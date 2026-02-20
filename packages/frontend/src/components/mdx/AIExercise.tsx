import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, ChevronDown, AlertCircle, Bot, User } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAI } from '../../context/AIContext';
import { useAIChat } from '../../hooks/useAIChat';
import ScrollReveal from './ScrollReveal';

interface AIExerciseProps {
  scenario: string;
  instructions: string;
  referencePrompt?: string;
  referenceResponse?: string;
}

export default function AIExercise({
  scenario,
  instructions,
  referencePrompt,
  referenceResponse,
}: AIExerciseProps) {
  const { available } = useAI();
  const { slug: courseSlug } = useParams<{ slug: string }>();
  const { streaming, error, sendExercisePrompt } = useAIChat();

  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [showReference, setShowReference] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim() || streaming || !courseSlug) return;
    const result = await sendExercisePrompt(prompt, courseSlug);
    setResponse(result);
  };

  return (
    <ScrollReveal>
      <div className="my-8 rounded-card border border-border bg-white shadow-elevation-1 overflow-hidden">
        <div className="border-l-[6px] border-l-accent p-5">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-accent" />
            <span className="text-sm font-bold uppercase tracking-wider text-accent">
              AI Exercise
            </span>
          </div>

          {/* Scenario */}
          <p className="text-text-primary font-medium leading-relaxed mb-3">{scenario}</p>

          {/* Instructions */}
          <p className="text-sm text-text-secondary leading-relaxed mb-4">{instructions}</p>

          {available ? (
            <>
              {/* Prompt input */}
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-3 border border-border rounded-input text-sm text-text-primary bg-surface/50 resize-y min-h-[100px] focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors font-mono"
                placeholder="Write your prompt here..."
                rows={4}
                disabled={streaming}
              />

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={streaming || !prompt.trim()}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-button hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {streaming ? (
                  <>
                    <span className="inline-flex gap-0.5">
                      <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    Processing...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Submit to AI
                  </>
                )}
              </button>

              {/* Error */}
              {error && (
                <p className="mt-2 text-xs text-error flex items-center gap-1">
                  <AlertCircle size={12} />
                  {error}
                </p>
              )}

              {/* AI Response */}
              {response && (
                <div className="mt-4 rounded-card border border-border bg-surface overflow-hidden">
                  <div className="border-b border-border bg-success/5 px-4 py-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-success">
                      AI Response
                    </span>
                  </div>
                  <div className="flex gap-3 p-4">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                      <Bot size={16} className="text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
                        {response}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}

          {/* Reference comparison */}
          {(referencePrompt || referenceResponse) && (
            <div className="mt-4">
              {available ? (
                <>
                  <button
                    onClick={() => setShowReference(!showReference)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary-light rounded-button hover:bg-primary/15 transition-colors"
                  >
                    {showReference ? 'Hide Reference' : 'Compare with Reference'}
                    <motion.span
                      animate={{ rotate: showReference ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown size={16} />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {showReference && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <ReferenceBlock prompt={referencePrompt} response={referenceResponse} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <ReferenceBlock prompt={referencePrompt} response={referenceResponse} label="Sample Answer" />
              )}
            </div>
          )}
        </div>
      </div>
    </ScrollReveal>
  );
}

function ReferenceBlock({ prompt, response, label = 'Reference Example' }: { prompt?: string; response?: string; label?: string }) {
  return (
    <div className="mt-4 rounded-card border border-border bg-surface overflow-hidden">
      <div className="border-b border-border bg-primary/5 px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          {label}
        </span>
      </div>
      {prompt && (
        <div className="flex gap-3 p-4 border-b border-border">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-text-secondary mb-1">Reference Prompt</p>
            <p className="text-sm font-mono text-text-primary whitespace-pre-wrap leading-relaxed">
              {prompt}
            </p>
          </div>
        </div>
      )}
      {response && (
        <div className="flex gap-3 p-4 bg-white">
          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
            <Bot size={16} className="text-success" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-text-secondary mb-1">Reference Response</p>
            <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
              {response}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
