import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { getSetting } from '../services/settings.service.js';
import { createAnnotation, exportAnnotations } from '../services/review.service.js';

const router = Router();

// GET /api/review/status — check if review mode is enabled
router.get('/status', async (_req, res) => {
  try {
    const value = await getSetting('review_mode_enabled');
    res.json({ data: { enabled: value === 'true' } });
  } catch (err: any) {
    console.error('[Review] Status check error:', err.message);
    res.status(500).json({ error: { message: 'Failed to check review status' } });
  }
});

// POST /api/review/annotations — create a review annotation
router.post('/annotations', async (req, res) => {
  try {
    const enabled = await getSetting('review_mode_enabled');
    if (enabled !== 'true') {
      return res.status(403).json({ error: { message: 'Review mode is not enabled' } });
    }

    const { page_path, page_title, annotation_text, annotation_type } = req.body;
    if (!page_path || !annotation_text) {
      return res.status(400).json({ error: { message: 'page_path and annotation_text are required' } });
    }

    const annotation = await createAnnotation(
      req.user!.id,
      page_path,
      annotation_text,
      page_title,
      annotation_type,
    );
    res.json({ data: annotation });
  } catch (err: any) {
    console.error('[Review] Create annotation error:', err.message);
    res.status(500).json({ error: { message: 'Failed to create annotation' } });
  }
});

// GET /api/review/export — export all annotations as plain text (admin only)
router.get('/export', requireAdmin, async (_req, res) => {
  try {
    const text = await exportAnnotations();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(text);
  } catch (err: any) {
    console.error('[Review] Export error:', err.message);
    res.status(500).json({ error: { message: 'Failed to export annotations' } });
  }
});

export default router;
