import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { getSetting } from './settings.service.js';
import { getCourse, getLesson } from './content.service.js';
import { config } from '../config/env.js';
import type { AIConfig, ChatMessage } from '@playbook/shared';

function deriveProvider(model: string): 'anthropic' | 'openai' {
  if (model.startsWith('gpt-') || model.startsWith('o1') || model.startsWith('o3')) return 'openai';
  return 'anthropic';
}

export async function getAIConfig(): Promise<(AIConfig & { apiKey: string }) | null> {
  const [enabled, apiKey, model] = await Promise.all([
    getSetting('ai_enabled'),
    getSetting('ai_api_key'),
    getSetting('ai_model'),
  ]);

  if (enabled !== 'true' || !apiKey || !model) return null;

  return {
    enabled: true,
    model,
    provider: deriveProvider(model),
    apiKey,
  };
}

export async function streamChatResponse(
  messages: ChatMessage[],
  systemPrompt: string,
  aiConfig: AIConfig & { apiKey: string },
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
): Promise<void> {
  try {
    if (aiConfig.provider === 'anthropic') {
      const client = new Anthropic({ apiKey: aiConfig.apiKey });
      const stream = client.messages.stream({
        model: aiConfig.model,
        max_tokens: 512,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      stream.on('text', (text) => onChunk(text));
      stream.on('end', () => onDone());
      stream.on('error', (err) => onError(err instanceof Error ? err : new Error(String(err))));
    } else {
      const client = new OpenAI({ apiKey: aiConfig.apiKey });
      const stream = await client.chat.completions.create({
        model: aiConfig.model,
        max_tokens: 512,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        ],
      });

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content;
        if (text) onChunk(text);
      }
      onDone();
    }
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function testConnection(
  apiKey: string,
  model: string,
): Promise<{ success: boolean; message: string; latencyMs: number }> {
  const start = Date.now();
  const provider = deriveProvider(model);

  try {
    if (provider === 'anthropic') {
      const client = new Anthropic({ apiKey });
      await client.messages.create({
        model,
        max_tokens: 16,
        messages: [{ role: 'user', content: 'Respond with OK' }],
      });
    } else {
      const client = new OpenAI({ apiKey });
      await client.chat.completions.create({
        model,
        max_tokens: 16,
        messages: [{ role: 'user', content: 'Respond with OK' }],
      });
    }

    const latencyMs = Date.now() - start;
    return { success: true, message: `Connected successfully (${latencyMs}ms)`, latencyMs };
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    const message = err?.message || 'Unknown error';
    return { success: false, message, latencyMs };
  }
}

export function getCoachPrompt(courseSlug: string): string {
  const promptPath = path.join(config.contentDir, 'courses', courseSlug, 'coach-prompt.md');
  if (fs.existsSync(promptPath)) {
    return fs.readFileSync(promptPath, 'utf-8');
  }
  return `You are a helpful learning assistant for this course. Answer questions about the course material clearly and concisely. If a question is off-topic, politely redirect the learner back to the course material.`;
}

export async function buildSystemPrompt(
  courseSlug: string,
  moduleSlug: string,
  lessonSlug: string,
): Promise<string> {
  const coachPrompt = getCoachPrompt(courseSlug);

  // Load current lesson raw content for context
  let lessonContext = '';
  try {
    const lesson = await getLesson(courseSlug, moduleSlug, lessonSlug);
    if (lesson) {
      lessonContext = `\n\n---\nCurrent lesson: "${lesson.meta.title}" (Module: ${moduleSlug}, Lesson: ${lessonSlug})\n\nLesson content (MDX source — use this as context but respond in plain language, not MDX):\n${lesson.compiledSource.slice(0, 4000)}`;
    }
  } catch {
    // Continue without lesson context
  }

  return `${coachPrompt}${lessonContext}

---
Important instructions:
- You are scoped to this course. Do not answer questions unrelated to the course material.
- Reference specific concepts from the lesson when relevant.
- Keep responses to 3-5 sentences maximum. Be concise and direct.
- Do NOT use markdown headings (no # or ## symbols). Use bold, lists, or code formatting instead.
- Always end your response with a brief follow-up question to encourage deeper thinking.
- If you don't know the answer from the course material, say so honestly.`;
}
