import Anthropic from '@anthropic-ai/sdk';
import OpenAI, { AzureOpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import { getSetting } from './settings.service.js';
import { getCourse, getModule } from './content.service.js';
import { config } from '../config/env.js';
import type { AIConfig, ChatMessage } from '@playbook/shared';

function deriveProvider(model: string): 'anthropic' | 'openai' | 'azure-openai' {
  if (model === 'azure-openai') return 'azure-openai';
  if (model.startsWith('gpt-') || model.startsWith('o1') || model.startsWith('o3')) return 'openai';
  return 'anthropic';
}

export async function getAIConfig(): Promise<(AIConfig & { apiKey: string; azureEndpoint?: string; azureApiVersion?: string; azureDeployment?: string }) | null> {
  const [enabled, model] = await Promise.all([
    getSetting('ai_enabled'),
    getSetting('ai_model'),
  ]);

  if (enabled !== 'true' || !model) return null;

  const provider = deriveProvider(model);

  if (provider === 'azure-openai') {
    const [apiKey, endpoint, apiVersion, deployment] = await Promise.all([
      getSetting('azure_openai_api_key'),
      getSetting('azure_openai_endpoint'),
      getSetting('azure_openai_api_version'),
      getSetting('azure_openai_deployment'),
    ]);
    if (!apiKey || !endpoint || !deployment) return null;
    return {
      enabled: true,
      model,
      provider,
      apiKey,
      azureEndpoint: endpoint,
      azureApiVersion: apiVersion || '2024-10-21',
      azureDeployment: deployment,
    };
  }

  const providerKeyName = provider === 'anthropic' ? 'anthropic_api_key' : 'openai_api_key';

  // Provider-specific key takes precedence; fall back to legacy ai_api_key
  const apiKey = (await getSetting(providerKeyName)) || (await getSetting('ai_api_key'));

  if (!apiKey) return null;

  return {
    enabled: true,
    model,
    provider,
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
  maxTokens: number = 1024,
): Promise<void> {
  try {
    if (aiConfig.provider === 'anthropic') {
      const client = new Anthropic({ apiKey: aiConfig.apiKey });
      const stream = client.messages.stream({
        model: aiConfig.model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      stream.on('text', (text) => onChunk(text));
      stream.on('end', () => onDone());
      stream.on('error', (err) => onError(err instanceof Error ? err : new Error(String(err))));
    } else if (aiConfig.provider === 'azure-openai') {
      const azureConfig = aiConfig as AIConfig & { apiKey: string; azureEndpoint?: string; azureApiVersion?: string; azureDeployment?: string };
      const client = new AzureOpenAI({
        endpoint: azureConfig.azureEndpoint!,
        apiKey: azureConfig.apiKey,
        apiVersion: azureConfig.azureApiVersion || '2024-10-21',
        deployment: azureConfig.azureDeployment!,
      });
      const stream = await client.chat.completions.create({
        model: azureConfig.azureDeployment!,
        max_tokens: maxTokens,
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
    } else {
      const client = new OpenAI({ apiKey: aiConfig.apiKey });
      const stream = await client.chat.completions.create({
        model: aiConfig.model,
        max_tokens: maxTokens,
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
  azureOptions?: { endpoint: string; apiVersion: string; deployment: string },
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
    } else if (provider === 'azure-openai' && azureOptions) {
      const client = new AzureOpenAI({
        endpoint: azureOptions.endpoint,
        apiKey,
        apiVersion: azureOptions.apiVersion || '2024-10-21',
        deployment: azureOptions.deployment,
      });
      await client.chat.completions.create({
        model: azureOptions.deployment,
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

// Cache for full course content to avoid re-reading files on every request
const courseContentCache = new Map<string, { content: CourseContent; loadedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function stripMdxComponents(source: string): string {
  // Remove frontmatter
  let text = source.replace(/^---\n[\s\S]*?\n---\n?/, '');

  // Extract meaningful text from self-closing component props before stripping.
  // Handles components like <ProcessFlow steps={[{title:"...", description:"..."}]} />
  // and <BeforeAfter before="..." after="..." /> etc.
  text = text.replace(/<(\w+)([^<]*?)\/>/g, (_match, _tag, attrs: string) => {
    const extracted: string[] = [];

    // Extract JSX object arrays from props like steps={[...]}
    // These use unquoted keys so they're not valid JSON — parse with regex instead
    const arrayPropMatches = attrs.matchAll(/\w+=\{(\[[\s\S]*?\])}/g);
    for (const m of arrayPropMatches) {
      const arrayContent = m[1];
      // Extract individual objects' title/description/label values
      const objMatches = arrayContent.matchAll(/\{\s*([\s\S]*?)\s*\}/g);
      for (const obj of objMatches) {
        const inner = obj[1];
        const parts: string[] = [];
        const titleMatch = inner.match(/title:\s*"([^"]+)"/);
        const descMatch = inner.match(/description:\s*"([^"]+)"/);
        const labelMatch = inner.match(/label:\s*"([^"]+)"/);
        if (titleMatch) parts.push(`**${titleMatch[1]}**`);
        if (descMatch) parts.push(descMatch[1]);
        if (labelMatch) parts.push(labelMatch[1]);
        if (parts.length) extracted.push(`- ${parts.join(': ')}`);
      }
    }

    // Extract simple string props like before="..." after="..." question="..." answer="..."
    const stringPropMatches = attrs.matchAll(/(\w+)="([^"]+)"/g);
    for (const m of stringPropMatches) {
      const key = m[1];
      const val = m[2];
      // Skip non-content props
      if (['type', 'title', 'className', 'size', 'style', 'variant', 'term', 'slug'].includes(key)) continue;
      extracted.push(val);
    }

    return extracted.length ? '\n' + extracted.join('\n') + '\n' : '';
  });

  // Handle opening+closing tag pairs like <Callout ...>content</Callout> — keep inner content
  // Preserve title attributes as bold headings (e.g. <Callout title="Data First"> → **Data First**)
  text = text.replace(/<\w+[^>]*>/g, (match) => {
    const titleMatch = match.match(/title="([^"]+)"/);
    return titleMatch ? `**${titleMatch[1]}**\n` : '';
  });
  text = text.replace(/<\/\w+>/g, '');       // closing tags

  // Collapse excessive newlines
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

interface CourseContent {
  material: string;
  lessonIndex: string;
}

function loadFullCourseContent(courseSlug: string): CourseContent {
  const cached = courseContentCache.get(courseSlug);
  if (cached && Date.now() - cached.loadedAt < CACHE_TTL_MS) return cached.content;

  const course = getCourse(courseSlug);
  if (!course) return { material: '', lessonIndex: '' };

  const sections: string[] = [];
  const indexLines: string[] = [];

  for (const modSlug of course.modules) {
    const mod = getModule(courseSlug, modSlug);
    const moduleTitle = mod?.title || modSlug;
    const moduleLessons: string[] = [];

    const lessonsDir = path.join(config.contentDir, 'courses', courseSlug, 'modules', modSlug, 'lessons');
    if (!fs.existsSync(lessonsDir)) continue;

    const lessonFiles = fs.readdirSync(lessonsDir)
      .filter((f) => f.endsWith('.mdx'))
      .sort();

    indexLines.push(`**${moduleTitle}** (${modSlug}):`);

    for (const file of lessonFiles) {
      const lessonSlug = file.replace('.mdx', '');
      const raw = fs.readFileSync(path.join(lessonsDir, file), 'utf-8');
      const titleMatch = raw.match(/^---\n[\s\S]*?title:\s*"?([^"\n]+)"?[\s\S]*?\n---/);
      const title = titleMatch?.[1] || file.replace('.mdx', '');
      const cleanContent = stripMdxComponents(raw);
      moduleLessons.push(`### ${title}\n[Link: /courses/${courseSlug}/modules/${modSlug}/lessons/${lessonSlug}]\n${cleanContent}`);
      indexLines.push(`- [${title}](/courses/${courseSlug}/modules/${modSlug}/lessons/${lessonSlug})`);
    }

    sections.push(`## ${moduleTitle}\n\n${moduleLessons.join('\n\n')}`);
  }

  const result: CourseContent = {
    material: sections.join('\n\n---\n\n'),
    lessonIndex: indexLines.join('\n'),
  };
  courseContentCache.set(courseSlug, { content: result, loadedAt: Date.now() });
  return result;
}

export async function buildSystemPrompt(
  courseSlug: string,
  moduleSlug: string,
  lessonSlug: string,
): Promise<string> {
  const coachPrompt = getCoachPrompt(courseSlug);
  const { material, lessonIndex } = loadFullCourseContent(courseSlug);

  const currentLessonNote = moduleSlug && lessonSlug
    ? `\n\nThe learner is currently on: Module "${moduleSlug}", Lesson "${lessonSlug}". Prioritize this lesson's content in your responses while drawing on the full course material as needed.`
    : '';

  return `${coachPrompt}

---
# Lesson Index

Use these paths to link learners to relevant lessons. Each lesson content section also has a [Link: ...] annotation you can use.

${lessonIndex}

---
# Full Course Material

The following is the complete course content. Use this as your knowledge base to answer learner questions accurately and thoroughly.

${material}
${currentLessonNote}

---
Important instructions:
- You are scoped to this course. Do not answer questions unrelated to the course material.
- Reference specific concepts from the course when relevant, especially from the learner's current lesson.
- Be concise. Lead with the direct answer, then add only the context necessary to understand it. Avoid restating what the learner already said, avoid filler phrases, and never repeat yourself. Use bullet points or short lists when multiple items are involved rather than writing them out in paragraph form.
- Do NOT use markdown headings (no # or ## symbols). Use bold, lists, or code formatting instead.
- When your answer draws on specific lessons, include markdown links so the learner can navigate directly to the relevant material. Format: [Lesson Title](/courses/aomt-playbook/modules/MODULE_SLUG/lessons/LESSON_SLUG). Include 1-3 of the most relevant links — do not overwhelm the response with links.
- Always end your response with a question designed to foster engagement, ensure the learner is progressing through the material, and maintain a natural conversational flow. For example, ask about applying the concept to their own context, confirm understanding before moving on, or prompt them to think about how the current topic connects to the next step.
- If you don't know the answer from the course material, say so honestly.`;
}
