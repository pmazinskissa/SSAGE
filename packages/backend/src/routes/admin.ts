import { Router } from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import {
  listUsers,
  getUserDetail,
  updateUserRole,
  deactivateUser,
  activateUser,
  deleteUser,
  preEnrollUsers,
  getDashboardMetrics,
  getUsersWithModuleProgress,
  exportUsersCSV,
} from '../services/admin.service.js';
import { getAllSettings, upsertSetting } from '../services/settings.service.js';
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
    const metrics = await getDashboardMetrics(courseSlug);
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

// POST /api/admin/users/pre-enroll — structured entries or CSV upload
router.post('/users/pre-enroll', upload.single('file'), async (req, res) => {
  try {
    let entries: { name: string; email: string; role: 'learner' | 'admin' }[] = [];

    if (req.file) {
      // Parse CSV with columns: name, email, role
      const content = req.file.buffer.toString('utf-8');
      const records = parse(content, { columns: false, skip_empty_lines: true, relax_column_count: true });
      for (const row of records) {
        if (!Array.isArray(row) || row.length < 2) continue;
        // Support: name,email,role OR email (legacy)
        if (row.length >= 3) {
          entries.push({ name: row[0]?.trim() || '', email: row[1]?.trim() || '', role: row[2]?.trim() === 'admin' ? 'admin' : 'learner' });
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
    const apiKey = settings['ai_api_key'] || '';
    const model = settings['ai_model'] || '';
    if (!apiKey) {
      return res.json({ data: { success: false, message: 'No API key configured', latencyMs: 0 } });
    }
    if (!model) {
      return res.json({ data: { success: false, message: 'No model configured', latencyMs: 0 } });
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
    const { course_slug, feedback_text, submitter_name } = req.body;
    if (!course_slug || !feedback_text) {
      return res.status(400).json({ error: { message: 'course_slug and feedback_text are required' } });
    }
    const feedback = await createFeedback(req.user!.id, course_slug, feedback_text, submitter_name);
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

export default router;
