import { Router } from 'express';
import { createFeedback } from '../services/feedback.service.js';

const router = Router();

// POST /api/feedback — submit feedback (any authenticated user)
router.post('/', async (req, res) => {
  try {
    const { course_slug, feedback_text, submitter_name, rating } = req.body;
    if (!course_slug || !feedback_text) {
      return res.status(400).json({ error: { message: 'course_slug and feedback_text are required' } });
    }
    const feedback = await createFeedback(req.user!.id, course_slug, feedback_text, submitter_name, rating);
    res.json({ data: feedback });
  } catch (err: any) {
    console.error('[Feedback] Submit error:', err.message);
    res.status(500).json({ error: { message: 'Failed to submit feedback' } });
  }
});

export default router;
