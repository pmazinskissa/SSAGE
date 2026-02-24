import { useState, useCallback, useRef } from 'react';
import { api } from '../lib/api';
import type { ChatMessage } from '@playbook/shared';

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text: string, courseSlug: string, moduleSlug: string, lessonSlug: string, displayText?: string) => {
      setError(null);

      const userMessage: ChatMessage = {
        role: 'user',
        content: text,
        ...(displayText ? { displayContent: displayText } : {}),
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setStreaming(true);

      // Create assistant placeholder
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };

      setMessages([...updatedMessages, assistantMessage]);

      try {
        abortRef.current = new AbortController();

        const response = await api.streamChat({
          messages: updatedMessages.map(({ displayContent, ...rest }) => rest),
          course_slug: courseSlug,
          module_slug: moduleSlug,
          lesson_slug: lessonSlug,
        }, abortRef.current.signal);

        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: { message: 'AI request failed' } }));
          throw new Error(err.error?.message || 'AI request failed');
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response stream');

        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();

            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                setError(parsed.error);
                break;
              }
              if (parsed.content) {
                accumulated += parsed.content;
                setMessages((prev) => {
                  const copy = [...prev];
                  copy[copy.length - 1] = {
                    ...copy[copy.length - 1],
                    content: accumulated,
                  };
                  return copy;
                });
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to get AI response');
          // Remove empty assistant message on error
          setMessages((prev) => {
            if (prev.length > 0 && prev[prev.length - 1].role === 'assistant' && !prev[prev.length - 1].content) {
              return prev.slice(0, -1);
            }
            return prev;
          });
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages],
  );

  const sendExercisePrompt = useCallback(
    async (text: string, courseSlug: string): Promise<string> => {
      setError(null);
      setStreaming(true);

      let accumulated = '';

      try {
        const exerciseMessages: ChatMessage[] = [
          { role: 'user', content: text, timestamp: new Date().toISOString() },
        ];

        const response = await api.streamChat({
          messages: exerciseMessages,
          course_slug: courseSlug,
          module_slug: '',
          lesson_slug: '',
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: { message: 'AI request failed' } }));
          throw new Error(err.error?.message || 'AI request failed');
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response stream');

        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.content) {
                accumulated += parsed.content;
              }
            } catch (e: any) {
              if (e.message && !e.message.includes('JSON')) throw e;
            }
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to get AI response');
      } finally {
        setStreaming(false);
      }

      return accumulated;
    },
    [],
  );

  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, streaming, error, sendMessage, sendExercisePrompt, clearHistory };
}
