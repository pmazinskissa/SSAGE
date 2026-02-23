import { Router } from 'express';
import {
  getCourseProgress,
  recordLessonView,
  updateTimeOnTask,
  completeLessonAndCheck,
  saveKnowledgeCheckResults,
} from '../services/progress.service.js';
import type { HeartbeatPayload, KnowledgeCheckSubmission, LessonCompletePayload } from '@playbook/shared';

const router = Router();

// GET /api/progress/:courseSlug — full progress for authenticated user
router.get('/:courseSlug', async (req, res) => {
  try {
    const progress = await getCourseProgress(req.user!.id, req.params.courseSlug);
    res.json({ data: progress });
  } catch (err: any) {
    console.error('[Progress] Get error:', err.message);
    res.status(500).json({ error: { message: 'Failed to get progress' } });
  }
});

// POST /api/progress/:courseSlug/heartbeat — record view + update time
router.post('/:courseSlug/heartbeat', async (req, res) => {
  try {
    const { module_slug, lesson_slug, time_delta_seconds, active_time_delta_seconds, scroll_depth } = req.body as HeartbeatPayload;
    if (!module_slug || !lesson_slug) {
      return res.status(400).json({ error: { message: 'module_slug and lesson_slug required' } });
    }

    await recordLessonView(req.user!.id, req.params.courseSlug, module_slug, lesson_slug);
    if (time_delta_seconds > 0) {
      await updateTimeOnTask(req.user!.id, req.params.courseSlug, module_slug, lesson_slug, time_delta_seconds, active_time_delta_seconds, scroll_depth);
    }

    res.json({ data: { ok: true } });
  } catch (err: any) {
    console.error('[Progress] Heartbeat error:', err.message);
    res.status(500).json({ error: { message: 'Failed to record heartbeat' } });
  }
});

// POST /api/progress/:courseSlug/lessons/:lessonSlug/complete — mark lesson done
router.post('/:courseSlug/lessons/:lessonSlug/complete', async (req, res) => {
  try {
    const { module_slug } = req.body as LessonCompletePayload;
    if (!module_slug) {
      return res.status(400).json({ error: { message: 'module_slug required' } });
    }

    const result = await completeLessonAndCheck(
      req.user!.id,
      req.params.courseSlug,
      module_slug,
      req.params.lessonSlug
    );

    res.json({ data: result });
  } catch (err: any) {
    console.error('[Progress] Complete lesson error:', err.message);
    res.status(500).json({ error: { message: 'Failed to complete lesson' } });
  }
});

// POST /api/progress/:courseSlug/modules/:moduleSlug/check — submit KC results
router.post('/:courseSlug/modules/:moduleSlug/check', async (req, res) => {
  try {
    const { answers } = req.body as KnowledgeCheckSubmission;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: { message: 'answers array required' } });
    }

    const result = await saveKnowledgeCheckResults(
      req.user!.id,
      req.params.courseSlug,
      req.params.moduleSlug,
      answers
    );

    res.json({ data: result });
  } catch (err: any) {
    console.error('[Progress] KC submit error:', err.message);
    res.status(500).json({ error: { message: 'Failed to save knowledge check results' } });
  }
});

export default router;
