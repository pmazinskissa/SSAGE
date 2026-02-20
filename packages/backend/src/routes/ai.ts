import { Router } from 'express';
import { getAIConfig, streamChatResponse, buildSystemPrompt } from '../services/ai.service.js';
import { getCourse } from '../services/content.service.js';
import type { ChatMessage } from '@playbook/shared';

const router = Router();

// POST /api/ai/chat — SSE streaming chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { messages, course_slug, module_slug, lesson_slug } = req.body as {
      messages: ChatMessage[];
      course_slug: string;
      module_slug: string;
      lesson_slug: string;
    };

    if (!messages || !Array.isArray(messages) || !course_slug) {
      return res.status(400).json({ error: { message: 'messages array and course_slug are required' } });
    }

    // Check global AI enabled
    const aiConfig = await getAIConfig();
    if (!aiConfig) {
      return res.status(503).json({ error: { message: 'AI features are not enabled' } });
    }

    // Check course-level AI enabled
    const course = getCourse(course_slug);
    if (!course || !course.ai_features_enabled) {
      return res.status(403).json({ error: { message: 'AI features are not enabled for this course' } });
    }

    // Build system prompt with lesson context
    const systemPrompt = await buildSystemPrompt(course_slug, module_slug || '', lesson_slug || '');

    // Exercise prompts (no module/lesson context) need more tokens for structured JSON responses
    const isExercise = !module_slug && !lesson_slug;
    const maxTokens = isExercise ? 2048 : 1024;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    await streamChatResponse(
      messages,
      systemPrompt,
      aiConfig,
      (text) => {
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      },
      () => {
        res.write('data: [DONE]\n\n');
        res.end();
      },
      (err) => {
        console.error('[AI] Stream error:', err.message);
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      },
      maxTokens,
    );
  } catch (err: any) {
    console.error('[AI] Chat error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: { message: 'AI chat failed' } });
    } else {
      res.end();
    }
  }
});

// GET /api/ai/status — check if AI is available
router.get('/status', async (_req, res) => {
  try {
    const aiConfig = await getAIConfig();
    res.json({
      data: {
        available: !!aiConfig,
        model: aiConfig?.model || null,
      },
    });
  } catch (err: any) {
    console.error('[AI] Status error:', err.message);
    res.json({ data: { available: false, model: null } });
  }
});

export default router;
