import { Router } from 'express';
import {
  getCourseProgress,
  recordLessonView,
  updateTimeOnTask,
  completeLessonAndCheck,
  saveKnowledgeCheckResults,
  saveKnowledgeCheckDraftAnswer,
  getKnowledgeCheckDraft,
  getKnowledgeCheckResults,
} from '../services/progress.service.js';
import type { HeartbeatPayload, KnowledgeCheckSubmission, KnowledgeCheckDraftPayload, KnowledgeCheckAnswersResponse, LessonCompletePayload } from '@playbook/shared';

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

// POST /api/progress/:courseSlug/modules/:moduleSlug/check/draft — save a single draft answer
router.post('/:courseSlug/modules/:moduleSlug/check/draft', async (req, res) => {
  try {
    const { question_id, selected_answer, is_correct } = req.body as KnowledgeCheckDraftPayload;
    if (!question_id || selected_answer === undefined || is_correct === undefined) {
      return res.status(400).json({ error: { message: 'question_id, selected_answer, and is_correct required' } });
    }

    await saveKnowledgeCheckDraftAnswer(
      req.user!.id,
      req.params.courseSlug,
      req.params.moduleSlug,
      question_id,
      selected_answer,
      is_correct
    );

    res.json({ data: { ok: true } });
  } catch (err: any) {
    console.error('[Progress] KC draft save error:', err.message);
    res.status(500).json({ error: { message: 'Failed to save draft answer' } });
  }
});

// GET /api/progress/:courseSlug/modules/:moduleSlug/check/answers — get saved KC answers (draft or completed)
router.get('/:courseSlug/modules/:moduleSlug/check/answers', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { courseSlug, moduleSlug } = req.params;

    // Check completed results first
    const results = await getKnowledgeCheckResults(userId, courseSlug, moduleSlug);
    if (results.length > 0) {
      const response: KnowledgeCheckAnswersResponse = { status: 'completed', answers: results };
      return res.json({ data: response });
    }

    // Check drafts
    const drafts = await getKnowledgeCheckDraft(userId, courseSlug, moduleSlug);
    if (drafts.length > 0) {
      const response: KnowledgeCheckAnswersResponse = { status: 'in_progress', answers: drafts };
      return res.json({ data: response });
    }

    const response: KnowledgeCheckAnswersResponse = { status: 'not_started', answers: [] };
    res.json({ data: response });
  } catch (err: any) {
    console.error('[Progress] KC answers fetch error:', err.message);
    res.status(500).json({ error: { message: 'Failed to get knowledge check answers' } });
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
