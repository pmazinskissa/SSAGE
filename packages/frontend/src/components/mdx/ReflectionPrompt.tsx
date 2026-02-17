import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Send, ChevronDown, AlertCircle, Bot } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAI } from '../../context/AIContext';
import { useAIChat } from '../../hooks/useAIChat';
import ScrollReveal from './ScrollReveal';
import Markdown from 'react-markdown';

interface ReflectionPromptProps {
  question: string;
  answer?: string;
  children?: React.ReactNode;
}

export default function ReflectionPrompt({ question, answer, children }: ReflectionPromptProps) {
  const [userResponse, setUserResponse] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [showFallbackAnswer, setShowFallbackAnswer] = useState(false);
  const { available } = useAI();
  const { slug: courseSlug } = useParams<{ slug: string }>();
  const { streaming, error, sendExercisePrompt } = useAIChat();

  const sampleAnswer = typeof children === 'string' ? children : answer || '';

  const handleSubmit = async () => {
    if (!userResponse.trim() || streaming || !courseSlug) return;

    const prompt = [
      'You are a learning coach. A learner was asked the following reflection question:\n',
      `**Question:** ${question}\n`,
      `**Learner's response:** ${userResponse}\n`,
      `**Sample/expected answer:** ${sampleAnswer}\n`,
      'Please provide a brief, encouraging comparison (3-5 sentences). Highlight what the learner got right, note any key points they may have missed from the sample answer, and offer one suggestion for deepening their understanding. Be concise and supportive.',
    ].join('\n');

    const result = await sendExercisePrompt(prompt, courseSlug);
    setAiFeedback(result);
  };

  return (
    <ScrollReveal>
      <div
        className="my-8 rounded-card border border-border bg-white shadow-elevation-1 overflow-hidden"
        data-print-reflection
      >
        <div className="border-l-[6px] border-l-primary p-5">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <Pause size={18} className="text-primary" />
            <span className="text-sm font-bold uppercase tracking-wider text-primary">
              Pause & Reflect
            </span>
          </div>

          {/* Question */}
          <p className="text-text-primary font-medium leading-relaxed mb-4">
            {question}
          </p>

          {/* Textarea */}
          <textarea
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            className="w-full p-3 border border-border rounded-input text-sm text-text-secondary bg-surface/50 resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            placeholder="Write your thoughts here..."
            rows={3}
            disabled={streaming}
            data-print-hide
          />

          {/* Submit / Reveal buttons */}
          {(answer || children) && (
            <div className="mt-3" data-print-hide>
              {available ? (
                <>
                  <button
                    onClick={handleSubmit}
                    disabled={streaming || !userResponse.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-button hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {streaming ? (
                      <>
                        <span className="inline-flex gap-0.5">
                          <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                        Reviewing...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Submit for Review
                      </>
                    )}
                  </button>

                  {error && (
                    <p className="mt-2 text-xs text-error flex items-center gap-1">
                      <AlertCircle size={12} />
                      {error}
                    </p>
                  )}

                  {/* AI Feedback */}
                  <AnimatePresence>
                    {aiFeedback && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 rounded-card border border-border bg-surface overflow-hidden">
                          <div className="border-b border-border bg-success/5 px-4 py-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-success">
                              AI Feedback
                            </span>
                          </div>
                          <div className="flex gap-3 p-4">
                            <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                              <Bot size={16} className="text-success" />
                            </div>
                            <div className="flex-1 prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 text-sm text-text-secondary leading-relaxed">
                              <Markdown>{aiFeedback}</Markdown>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                /* Fallback: reveal answer when AI is not available */
                <>
                  <button
                    onClick={() => setShowFallbackAnswer(!showFallbackAnswer)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary-light rounded-button hover:bg-primary/15 transition-colors"
                  >
                    {showFallbackAnswer ? 'Hide Answer' : 'Reveal Answer'}
                    <motion.span
                      animate={{ rotate: showFallbackAnswer ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown size={16} />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {showFallbackAnswer && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-border text-sm text-text-secondary leading-relaxed">
                          {answer || children}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          )}

          {/* Print-only: always show answer */}
          <div className="hidden print:block mt-4 pt-4 border-t border-border text-sm text-text-secondary leading-relaxed">
            {answer || children}
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
