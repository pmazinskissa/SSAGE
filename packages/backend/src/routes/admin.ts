import { Router } from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import {
  listUsers,
  listPreEnrolledUsers,
  getUserDetail,
  updateUserRole,
  updateUserProfile,
  bulkDeleteUsers,
  bulkDeactivateUsers,
  bulkActivateUsers,
  bulkEnrollUsers,
  bulkUnenrollUsers,
  deactivateUser,
  activateUser,
  deleteUser,
  deletePreEnrolledUser,
  preEnrollUsers,
  getDashboardMetrics,
  getUsersWithModuleProgress,
  exportUsersCSV,
  getEnrollmentsForEmail,
  enrollUserInCourses,
  unenrollUserFromCourse,
} from '../services/admin.service.js';
import { getAllSettings, upsertSetting, getCourseSettings } from '../services/settings.service.js';
import { listCourses } from '../services/content.service.js';
import { testConnection } from '../services/ai.service.js';
import {
  listFeedback,
  createFeedback,
  resolveFeedback,
  unresolveFeedback,
  deleteFeedback,
} from '../services/feedback.service.js';

const router = Router();
const upload = multer({ limits: { fileSize: 1024 * 1024 } }); // 1MB

// GET /api/admin/dashboard — dashboard metrics
router.get('/dashboard', async (req, res) => {
  try {
    const courseSlug = req.query.course as string | undefined;
    const userIds = req.query.userIds
      ? (req.query.userIds as string).split(',').filter(Boolean)
      : undefined;
    // Legacy single-user support
    const userId = req.query.userId as string | undefined;
    const resolvedIds = userIds && userIds.length > 0 ? userIds : userId ? [userId] : undefined;
    const metrics = await getDashboardMetrics(courseSlug, resolvedIds);
    res.json({ data: metrics });
  } catch (err: any) {
    console.error('[Admin] Dashboard error:', err.message);
    res.status(500).json({ error: { message: 'Failed to load dashboard metrics' } });
  }
});

// GET /api/admin/users — list all users with progress
router.get('/users', async (_req, res) => {
  try {
    const users = await listUsers();
    res.json({ data: users });
  } catch (err: any) {
    console.error('[Admin] List users error:', err.message);
    res.status(500).json({ error: { message: 'Failed to list users' } });
  }
});

// GET /api/admin/users/analytics — per-module user analytics
router.get('/users/analytics', async (req, res) => {
  try {
    const courseSlug = req.query.course as string;
    if (!courseSlug) {
      return res.status(400).json({ error: { message: 'course query parameter is required' } });
    }
    const data = await getUsersWithModuleProgress(courseSlug);
    res.json({ data });
  } catch (err: any) {
    console.error('[Admin] User analytics error:', err.message);
    res.status(500).json({ error: { message: 'Failed to load user analytics' } });
  }
});

// GET /api/admin/users/export — CSV export
router.get('/users/export', async (req, res) => {
  try {
    const courseSlug = req.query.course as string | undefined;
    const csv = await exportUsersCSV(courseSlug);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="users-${timestamp}.csv"`);
    res.send(csv);
  } catch (err: any) {
    console.error('[Admin] Export CSV error:', err.message);
    res.status(500).json({ error: { message: 'Failed to export users' } });
  }
});

// GET /api/admin/users/pre-enrolled — list pre-enrolled users
router.get('/users/pre-enrolled', async (_req, res) => {
  try {
    const users = await listPreEnrolledUsers();
    res.json({ data: users });
  } catch (err: any) {
    console.error('[Admin] List pre-enrolled users error:', err.message);
    res.status(500).json({ error: { message: 'Failed to list pre-enrolled users' } });
  }
});

// DELETE /api/admin/users/pre-enrolled/:id — remove a pre-enrolled user
router.delete('/users/pre-enrolled/:id', async (req, res) => {
  try {
    await deletePreEnrolledUser(req.params.id);
    res.json({ data: { message: 'Pre-enrolled user removed' } });
  } catch (err: any) {
    console.error('[Admin] Delete pre-enrolled user error:', err.message);
    res.status(500).json({ error: { message: 'Failed to remove pre-enrolled user' } });
  }
});

// GET /api/admin/users/:id — detailed user view
router.get('/users/:id', async (req, res) => {
  try {
    const detail = await getUserDetail(req.params.id);
    if (!detail) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }
    res.json({ data: detail });
  } catch (err: any) {
    console.error('[Admin] Get user detail error:', err.message);
    res.status(500).json({ error: { message: 'Failed to get user details' } });
  }
});

// PUT /api/admin/users/:id/profile — update name and email
router.put('/users/:id/profile', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ error: { message: 'name and email are required' } });
    }
    if (!email.includes('@')) {
      return res.status(400).json({ error: { message: 'Invalid email address' } });
    }
    await updateUserProfile(req.params.id, name.trim(), email.trim());
    res.json({ data: { message: 'Profile updated' } });
  } catch (err: any) {
    if (err.message === 'Email already in use') {
      return res.status(409).json({ error: { message: err.message } });
    }
    console.error('[Admin] Update profile error:', err.message);
    res.status(500).json({ error: { message: 'Failed to update profile' } });
  }
});

// PUT /api/admin/users/:id/role — change role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (role !== 'learner' && role !== 'admin' && role !== 'dev_admin') {
      return res.status(400).json({ error: { message: 'Role must be "learner", "admin", or "dev_admin"' } });
    }

    // Only dev_admin can promote to dev_admin
    if (role === 'dev_admin' && req.user!.role !== 'dev_admin') {
      return res.status(403).json({ error: { message: 'Only dev admins can assign the dev_admin role' } });
    }

    // Regular admins cannot change other admins or dev_admins
    if (req.user!.role === 'admin') {
      const target = await getUserDetail(req.params.id);
      if (target && (target.role === 'admin' || target.role === 'dev_admin')) {
        return res.status(403).json({ error: { message: 'Admins cannot change the role of other admins' } });
      }
    }

    await updateUserRole(req.params.id, role);
    res.json({ data: { message: 'Role updated' } });
  } catch (err: any) {
    console.error('[Admin] Update role error:', err.message);
    res.status(500).json({ error: { message: 'Failed to update role' } });
  }
});

// PUT /api/admin/users/:id/deactivate — deactivate user
router.put('/users/:id/deactivate', async (req, res) => {
  if (req.params.id === req.user!.id) {
    return res.status(400).json({ error: { message: 'Cannot deactivate yourself' } });
  }
  try {
    await deactivateUser(req.params.id);
    res.json({ data: { message: 'User deactivated' } });
  } catch (err: any) {
    console.error('[Admin] Deactivate error:', err.message);
    res.status(500).json({ error: { message: 'Failed to deactivate user' } });
  }
});

// PUT /api/admin/users/:id/activate — reactivate user
router.put('/users/:id/activate', async (req, res) => {
  try {
    await activateUser(req.params.id);
    res.json({ data: { message: 'User activated' } });
  } catch (err: any) {
    console.error('[Admin] Activate error:', err.message);
    res.status(500).json({ error: { message: 'Failed to activate user' } });
  }
});

// DELETE /api/admin/users/:id — delete user + all data
router.delete('/users/:id', async (req, res) => {
  if (req.params.id === req.user!.id) {
    return res.status(400).json({ error: { message: 'Cannot delete yourself' } });
  }
  try {
    await deleteUser(req.params.id);
    res.json({ data: { message: 'User deleted' } });
  } catch (err: any) {
    console.error('[Admin] Delete error:', err.message);
    res.status(500).json({ error: { message: 'Failed to delete user' } });
  }
});

// POST /api/admin/users/bulk/delete — bulk delete users
router.post('/users/bulk/delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: { message: 'ids array is required' } });
    }
    const filteredIds = ids.filter((id) => id !== req.user!.id);
    await bulkDeleteUsers(filteredIds);
    res.json({ data: { message: `${filteredIds.length} users deleted` } });
  } catch (err: any) {
    console.error('[Admin] Bulk delete error:', err.message);
    res.status(500).json({ error: { message: 'Failed to delete users' } });
  }
});

// PUT /api/admin/users/bulk/deactivate — bulk deactivate
router.put('/users/bulk/deactivate', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: { message: 'ids array is required' } });
    }
    const filteredIds = ids.filter((id) => id !== req.user!.id);
    await bulkDeactivateUsers(filteredIds);
    res.json({ data: { message: `${filteredIds.length} users deactivated` } });
  } catch (err: any) {
    console.error('[Admin] Bulk deactivate error:', err.message);
    res.status(500).json({ error: { message: 'Failed to deactivate users' } });
  }
});

// PUT /api/admin/users/bulk/activate — bulk activate
router.put('/users/bulk/activate', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: { message: 'ids array is required' } });
    }
    await bulkActivateUsers(ids);
    res.json({ data: { message: `${ids.length} users activated` } });
  } catch (err: any) {
    console.error('[Admin] Bulk activate error:', err.message);
    res.status(500).json({ error: { message: 'Failed to activate users' } });
  }
});

// POST /api/admin/enrollments/bulk — bulk enroll
router.post('/enrollments/bulk', async (req, res) => {
  try {
    const { emails, course_slugs } = req.body;
    if (!Array.isArray(emails) || !Array.isArray(course_slugs) || emails.length === 0 || course_slugs.length === 0) {
      return res.status(400).json({ error: { message: 'emails and course_slugs arrays are required' } });
    }
    await bulkEnrollUsers(emails, course_slugs, req.user!.id);
    res.json({ data: { message: 'Users enrolled' } });
  } catch (err: any) {
    console.error('[Admin] Bulk enroll error:', err.message);
    res.status(500).json({ error: { message: 'Failed to enroll users' } });
  }
});

// DELETE /api/admin/enrollments/bulk — bulk unenroll
router.delete('/enrollments/bulk', async (req, res) => {
  try {
    const { emails, course_slug } = req.body;
    if (!Array.isArray(emails) || !course_slug || emails.length === 0) {
      return res.status(400).json({ error: { message: 'emails and course_slug are required' } });
    }
    await bulkUnenrollUsers(emails, course_slug);
    res.json({ data: { message: 'Users unenrolled' } });
  } catch (err: any) {
    console.error('[Admin] Bulk unenroll error:', err.message);
    res.status(500).json({ error: { message: 'Failed to unenroll users' } });
  }
});

// POST /api/admin/users/pre-enroll — structured entries or CSV upload
router.post('/users/pre-enroll', upload.single('file'), async (req, res) => {
  try {
    let entries: { name: string; email: string; role: 'learner' | 'admin' | 'dev_admin'; courses?: string[] }[] = [];

    if (req.file) {
      // Parse CSV with columns: name, email, role, courses (comma-separated slugs)
      const content = req.file.buffer.toString('utf-8');
      const records = parse(content, { columns: false, skip_empty_lines: true, relax_column_count: true });
      for (const row of records) {
        if (!Array.isArray(row) || row.length < 2) continue;
        // Support: name,email,role,courses OR name,email,role OR email (legacy)
        if (row.length >= 3) {
          const role = row[2]?.trim() === 'admin' ? 'admin' as const : row[2]?.trim() === 'dev_admin' ? 'dev_admin' as const : 'learner' as const;
          // Columns 4+ are course slugs (csv-parse splits on commas, so each slug is its own column)
          const courseCols = row.slice(3).map((s: string) => s.trim()).filter(Boolean);
          const courses = courseCols.length > 0 ? courseCols : undefined;
          entries.push({ name: row[0]?.trim() || '', email: row[1]?.trim() || '', role, courses });
        } else if (row.length === 2) {
          // Could be name,email or just two emails
          if (row[1]?.includes('@')) {
            entries.push({ name: row[0]?.trim() || '', email: row[1]?.trim(), role: 'learner' });
          } else if (row[0]?.includes('@')) {
            entries.push({ name: '', email: row[0]?.trim(), role: 'learner' });
          }
        } else if (row[0]?.includes('@')) {
          entries.push({ name: '', email: row[0]?.trim(), role: 'learner' });
        }
      }
    } else if (req.body.entries && Array.isArray(req.body.entries)) {
      entries = req.body.entries;
    } else {
      return res.status(400).json({ error: { message: 'Provide a CSV file or entries array' } });
    }

    const result = await preEnrollUsers(entries, req.user!.id);
    res.json({ data: result });
  } catch (err: any) {
    console.error('[Admin] Pre-enroll error:', err.message);
    res.status(500).json({ error: { message: 'Failed to pre-enroll users' } });
  }
});

// --- Course Enrollments ---

// GET /api/admin/enrollments/:email — list enrollments for an email
router.get('/enrollments/:email', async (req, res) => {
  try {
    const enrollments = await getEnrollmentsForEmail(req.params.email);
    res.json({ data: enrollments });
  } catch (err: any) {
    console.error('[Admin] Get enrollments error:', err.message);
    res.status(500).json({ error: { message: 'Failed to get enrollments' } });
  }
});

// POST /api/admin/enrollments — enroll user in courses
router.post('/enrollments', async (req, res) => {
  try {
    const { email, course_slugs } = req.body;
    if (!email || !Array.isArray(course_slugs) || course_slugs.length === 0) {
      return res.status(400).json({ error: { message: 'email and course_slugs[] are required' } });
    }
    await enrollUserInCourses(email, course_slugs, req.user!.id);
    res.json({ data: { message: 'Enrolled successfully' } });
  } catch (err: any) {
    console.error('[Admin] Enroll error:', err.message);
    res.status(500).json({ error: { message: 'Failed to enroll user' } });
  }
});

// DELETE /api/admin/enrollments — unenroll user from a course
router.delete('/enrollments', async (req, res) => {
  try {
    const { email, course_slug } = req.body;
    if (!email || !course_slug) {
      return res.status(400).json({ error: { message: 'email and course_slug are required' } });
    }
    await unenrollUserFromCourse(email, course_slug);
    res.json({ data: { message: 'Unenrolled successfully' } });
  } catch (err: any) {
    console.error('[Admin] Unenroll error:', err.message);
    res.status(500).json({ error: { message: 'Failed to unenroll user' } });
  }
});

// --- Settings ---

// GET /api/admin/settings — all settings as key-value object
router.get('/settings', async (_req, res) => {
  try {
    const settings = await getAllSettings();
    res.json({ data: settings });
  } catch (err: any) {
    console.error('[Admin] Get settings error:', err.message);
    res.status(500).json({ error: { message: 'Failed to load settings' } });
  }
});

// PUT /api/admin/settings — upsert a setting
router.put('/settings', async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ error: { message: 'key and value are required' } });
    }
    await upsertSetting(key, value);

    // If theme was changed, update in-memory config and clear cache
    if (key === 'active_theme') {
      const { config } = await import('../config/env.js');
      (config as any).activeTheme = value;
      const { clearThemeCache } = await import('../services/theme.service.js');
      clearThemeCache();
    }

    res.json({ data: { message: 'Setting updated' } });
  } catch (err: any) {
    console.error('[Admin] Update setting error:', err.message);
    res.status(500).json({ error: { message: 'Failed to update setting' } });
  }
});

// POST /api/admin/settings/test-ai — test AI connection
router.post('/settings/test-ai', async (_req, res) => {
  try {
    const settings = await getAllSettings();
    const model = settings['ai_model'] || '';
    if (!model) {
      return res.json({ data: { success: false, message: 'No model configured', latencyMs: 0 } });
    }

    if (model === 'azure-openai') {
      const apiKey = settings['azure_openai_api_key'] || '';
      const endpoint = settings['azure_openai_endpoint'] || '';
      const apiVersion = settings['azure_openai_api_version'] || '2024-10-21';
      const deployment = settings['azure_openai_deployment'] || '';
      if (!apiKey || !endpoint || !deployment) {
        return res.json({ data: { success: false, message: 'Azure OpenAI requires an API key, endpoint, and deployment name', latencyMs: 0 } });
      }
      const result = await testConnection(apiKey, model, { endpoint, apiVersion, deployment });
      return res.json({ data: result });
    }

    const isOpenAI = model.startsWith('gpt-') || model.startsWith('o1') || model.startsWith('o3');
    const providerKey = isOpenAI ? 'openai_api_key' : 'anthropic_api_key';
    const apiKey = settings[providerKey] || settings['ai_api_key'] || '';
    if (!apiKey) {
      return res.json({ data: { success: false, message: 'No API key configured for this provider', latencyMs: 0 } });
    }
    const result = await testConnection(apiKey, model);
    res.json({ data: result });
  } catch (err: any) {
    console.error('[Admin] Test AI error:', err.message);
    res.status(500).json({ error: { message: 'Failed to test AI connection' } });
  }
});

// --- Feedback ---

// GET /api/admin/feedback — list all feedback
router.get('/feedback', async (req, res) => {
  try {
    const filters: any = {};
    if (req.query.module) filters.module = req.query.module;
    if (req.query.course) filters.course = req.query.course;
    if (req.query.resolved !== undefined) filters.resolved = req.query.resolved === 'true';
    const feedback = await listFeedback(filters);
    res.json({ data: feedback });
  } catch (err: any) {
    console.error('[Admin] List feedback error:', err.message);
    res.status(500).json({ error: { message: 'Failed to load feedback' } });
  }
});

// POST /api/admin/feedback — create feedback (admin can also submit from admin panel)
router.post('/feedback', async (req, res) => {
  try {
    const { course_slug, feedback_text, submitter_name, rating } = req.body;
    if (!course_slug || !feedback_text) {
      return res.status(400).json({ error: { message: 'course_slug and feedback_text are required' } });
    }
    const feedback = await createFeedback(req.user!.id, course_slug, feedback_text, submitter_name, rating);
    res.json({ data: feedback });
  } catch (err: any) {
    console.error('[Admin] Create feedback error:', err.message);
    res.status(500).json({ error: { message: 'Failed to create feedback' } });
  }
});

// PUT /api/admin/feedback/:id/resolve — toggle resolved
router.put('/feedback/:id/resolve', async (req, res) => {
  try {
    const resolved = req.body.resolved !== false;
    if (resolved) {
      await resolveFeedback(req.params.id);
    } else {
      await unresolveFeedback(req.params.id);
    }
    res.json({ data: { message: 'Feedback updated' } });
  } catch (err: any) {
    console.error('[Admin] Resolve feedback error:', err.message);
    res.status(500).json({ error: { message: 'Failed to update feedback' } });
  }
});

// DELETE /api/admin/feedback/:id — delete feedback
router.delete('/feedback/:id', async (req, res) => {
  try {
    await deleteFeedback(req.params.id);
    res.json({ data: { message: 'Feedback deleted' } });
  } catch (err: any) {
    console.error('[Admin] Delete feedback error:', err.message);
    res.status(500).json({ error: { message: 'Failed to delete feedback' } });
  }
});

// GET /api/admin/courses — list courses with their admin-configurable settings
router.get('/courses', async (_req, res) => {
  try {
    const courses = listCourses();
    const merged = await Promise.all(
      courses.map(async (c) => {
        const overrides = await getCourseSettings(c.slug);
        return {
          ...c,
          ai_features_enabled:
            overrides.ai_features_enabled !== undefined
              ? overrides.ai_features_enabled === 'true'
              : c.ai_features_enabled,
          navigation_mode:
            overrides.ordered_lessons !== undefined
              ? overrides.ordered_lessons === 'true' ? 'linear' : 'open'
              : c.navigation_mode,
          require_knowledge_checks: overrides.require_knowledge_checks === 'true',
          min_lesson_time_seconds: parseInt(overrides.min_lesson_time_seconds || '0', 10),
        };
      })
    );
    res.json({ data: merged });
  } catch (err: any) {
    console.error('[Admin] List courses error:', err.message);
    res.status(500).json({ error: { message: 'Failed to list courses' } });
  }
});

// PUT /api/admin/courses/:slug/settings — save per-course admin settings
router.put('/courses/:slug/settings', async (req, res) => {
  try {
    const { slug } = req.params;
    const { ai_features_enabled, ordered_lessons, require_knowledge_checks, min_lesson_time_seconds } = req.body;
    await Promise.all([
      upsertSetting(`course.${slug}.ai_features_enabled`, String(!!ai_features_enabled)),
      upsertSetting(`course.${slug}.ordered_lessons`, String(!!ordered_lessons)),
      upsertSetting(`course.${slug}.require_knowledge_checks`, String(!!require_knowledge_checks)),
      upsertSetting(`course.${slug}.min_lesson_time_seconds`, String(Number(min_lesson_time_seconds) || 0)),
    ]);
    res.json({ data: { message: 'Course settings saved' } });
  } catch (err: any) {
    console.error('[Admin] Update course settings error:', err.message);
    res.status(500).json({ error: { message: 'Failed to save course settings' } });
  }
});

export default router;
