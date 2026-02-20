import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { listCourses, getCourse, getLesson, getCourseNavTree } from '../services/content.service.js';
import { getGlossary, searchGlossary } from '../services/glossary.service.js';
import { getKnowledgeCheck } from '../services/knowledge-check.service.js';
import { searchCourseContent } from '../services/search.service.js';
import { config } from '../config/env.js';
import { optionalAuth } from '../middleware/auth.js';
import { getCourseProgress } from '../services/progress.service.js';
import { getEnrollmentsForEmail } from '../services/admin.service.js';
import { getCourseSettings } from '../services/settings.service.js';
import type { CourseNavTree } from '@playbook/shared';

const router = Router();

// GET /api/courses — list all courses (filtered by enrollment for non-admins)
router.get('/', async (req, res) => {
  const courses = listCourses();
  // Admins and dev_admins see all courses
  if (req.user && (req.user.role === 'admin' || req.user.role === 'dev_admin')) {
    return res.json({ data: courses });
  }
  // Learners: filter to enrolled courses only
  if (req.user) {
    try {
      const enrollments = await getEnrollmentsForEmail(req.user.email);
      const enrolledSlugs = new Set(enrollments.map((e) => e.course_slug));
      const filtered = courses.filter((c) => enrolledSlugs.has(c.slug));
      return res.json({ data: filtered });
    } catch (err) {
      console.warn('[Courses] Failed to check enrollments:', err);
      return res.json({ data: courses });
    }
  }
  res.json({ data: courses });
});

// GET /api/courses/:slug — course detail + navigation tree (with optional progress overlay)
router.get('/:slug', optionalAuth, async (req, res) => {
  const slug = req.params.slug as string;
  const course = getCourse(slug);
  if (!course) {
    return res.status(404).json({ error: { message: 'Course not found' } });
  }

  // Enrollment guard for non-admins
  if (req.user && req.user.role !== 'admin' && req.user.role !== 'dev_admin') {
    try {
      const enrollments = await getEnrollmentsForEmail(req.user.email);
      const enrolledSlugs = new Set(enrollments.map((e) => e.course_slug));
      if (!enrolledSlugs.has(slug)) {
        return res.status(403).json({ error: { message: 'Not enrolled in this course' } });
      }
    } catch (err) {
      console.warn('[Courses] Failed to check enrollment:', err);
    }
  }

  // Merge admin-configurable overrides from DB into the YAML config
  try {
    const overrides = await getCourseSettings(slug);
    if (overrides.ai_features_enabled !== undefined) {
      (course as any).ai_features_enabled = overrides.ai_features_enabled === 'true';
    }
    if (overrides.ordered_lessons !== undefined) {
      (course as any).navigation_mode = overrides.ordered_lessons === 'true' ? 'linear' : 'open';
    }
    if (overrides.require_knowledge_checks !== undefined) {
      (course as any).require_knowledge_checks = overrides.require_knowledge_checks === 'true';
    }
    if (overrides.min_lesson_time_seconds !== undefined) {
      (course as any).min_lesson_time_seconds = parseInt(overrides.min_lesson_time_seconds, 10);
    }
  } catch {
    // Non-fatal: serve with YAML defaults
  }

  const navTree = getCourseNavTree(slug);

  // Overlay user progress if authenticated
  if (req.user && navTree) {
    try {
      const progress = await getCourseProgress(req.user.id, slug);
      if (progress) {
        overlayProgress(navTree, progress);
      }
    } catch (err) {
      // Non-fatal: log and continue with default statuses
      console.warn('[Courses] Failed to load progress overlay:', err);
    }
  }

  res.json({ data: { course, navTree } });
});

function overlayProgress(navTree: CourseNavTree, progress: import('@playbook/shared').CourseProgress): void {
  // Build lesson lookup map: "module_slug:lesson_slug" → status
  const lessonMap = new Map<string, string>();
  for (const lp of progress.lessons) {
    lessonMap.set(`${lp.module_slug}:${lp.lesson_slug}`, lp.status);
  }

  // Build KC lookup: module_slug → true
  const kcDone = new Set<string>();
  for (const kc of progress.knowledge_checks) {
    kcDone.add(kc.module_slug);
  }

  let completedLessons = 0;

  for (const mod of navTree.modules) {
    let moduleHasProgress = false;
    let allLessonsDone = true;

    for (const lesson of mod.lessons) {
      const status = lessonMap.get(`${mod.slug}:${lesson.slug}`);
      if (status) {
        lesson.status = status as any;
        moduleHasProgress = true;
        if (status === 'completed') {
          completedLessons++;
        } else {
          allLessonsDone = false;
        }
      } else {
        allLessonsDone = false;
      }
    }

    // Expose KC completion so frontend can compute locked state
    mod.knowledge_check_completed = kcDone.has(mod.slug);

    // Module status: completed if KC done or all lessons done; in_progress if any started
    if (kcDone.has(mod.slug) || (allLessonsDone && mod.lessons.length > 0)) {
      mod.status = 'completed';
    } else if (moduleHasProgress) {
      mod.status = 'in_progress';
    }
  }

  navTree.completed_lessons = completedLessons;
}

// GET /api/courses/:slug/modules/:moduleSlug/lessons/:lessonSlug — compiled MDX + metadata
router.get('/:slug/modules/:moduleSlug/lessons/:lessonSlug', async (req, res) => {
  try {
    const lesson = await getLesson(req.params.slug, req.params.moduleSlug, req.params.lessonSlug);
    if (!lesson) {
      return res.status(404).json({ error: { message: 'Lesson not found' } });
    }
    res.json({ data: lesson });
  } catch (err) {
    console.error('Failed to compile lesson:', err);
    res.status(500).json({ error: { message: 'Failed to compile lesson content' } });
  }
});

// GET /api/courses/:slug/modules/:moduleSlug/knowledge-check — knowledge check questions
router.get('/:slug/modules/:moduleSlug/knowledge-check', (req, res) => {
  const kc = getKnowledgeCheck(req.params.slug, req.params.moduleSlug);
  if (!kc) {
    return res.status(404).json({ error: { message: 'Knowledge check not found' } });
  }
  res.json({ data: kc });
});

// GET /api/courses/:slug/assets/:filename — downloadable resource files
router.get('/:slug/assets/:filename', (req, res) => {
  const filename = path.basename(req.params.filename); // prevent path traversal
  const filePath = path.join(config.contentDir, 'courses', req.params.slug, 'assets', filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: { message: 'Asset not found' } });
  }
  res.download(filePath, filename);
});

// GET /api/courses/:slug/glossary — glossary entries
router.get('/:slug/glossary', (req, res) => {
  const query = req.query.q as string | undefined;
  const entries = query
    ? searchGlossary(req.params.slug, query)
    : getGlossary(req.params.slug);
  res.json({ data: entries });
});

// GET /api/courses/:slug/search — content search
router.get('/:slug/search', optionalAuth, (req, res) => {
  const slug = req.params.slug as string;
  const query = req.query.q as string | undefined;
  if (!query || query.length < 2) {
    return res.json({ data: [] });
  }
  const results = searchCourseContent(slug, query);
  res.json({ data: results });
});

export default router;
