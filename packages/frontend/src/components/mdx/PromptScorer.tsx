import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';
import { Target, Send, ChevronDown, AlertCircle, RotateCcw } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAI } from '../../context/AIContext';
import { useAIChat } from '../../hooks/useAIChat';
import ScrollReveal from './ScrollReveal';

interface PromptScorerProps {
  scenario: string;
  dataContext: string;
  objective: string;
  referencePrompt?: string;
}

interface ScoreResult {
  context: { score: number; feedback: string };
  task: { score: number; feedback: string };
  output: { score: number; feedback: string };
  overall: number;
  summary: string;
  improved_prompt: string;
}

function scoreColor(score: number): string {
  if (score <= 2) return 'text-error';
  if (score === 3) return 'text-warning';
  return 'text-success';
}

function scoreBg(score: number): string {
  if (score <= 2) return 'bg-error/10 border-error/30';
  if (score === 3) return 'bg-warning/10 border-warning/30';
  return 'bg-success/10 border-success/30';
}

function ScoreCard({ label, score, feedback }: { label: string; score: number; feedback: string }) {
  return (
    <div className={`flex-1 min-w-[140px] rounded-card border p-4 ${scoreBg(score)}`}>
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg font-bold ${scoreColor(score)} ${scoreBg(score)}`}
        >
          {score}
        </div>
        <span className="text-sm font-semibold text-text-primary">{label}</span>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed">{feedback}</p>
    </div>
  );
}

export default function PromptScorer({
  scenario,
  dataContext,
  objective,
  referencePrompt,
}: PromptScorerProps) {
  const { available } = useAI();
  const { slug: courseSlug } = useParams<{ slug: string }>();
  const { streaming, error, sendExercisePrompt } = useAIChat();

  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [rawFallback, setRawFallback] = useState<string | null>(null);
  const [showImproved, setShowImproved] = useState(false);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim() || streaming || !courseSlug) return;

    setResult(null);
    setRawFallback(null);

    const scoringMessage = `You are evaluating a prompt written by a practitioner.

SCENARIO: ${scenario}
AVAILABLE DATA: ${dataContext}
OBJECTIVE: ${objective}

USER'S PROMPT:
"""${prompt}"""

Score the prompt on the Context-Task-Output framework (1-5 each).
Respond in this exact JSON format only, no markdown:
{"context":{"score":X,"feedback":"..."},"task":{"score":X,"feedback":"..."},"output":{"score":X,"feedback":"..."},"overall":X,"summary":"...","improved_prompt":"..."}`;

    const response = await sendExercisePrompt(scoringMessage, courseSlug);

    if (!response) return;

    // Strip markdown code fences (```json ... ```) if the AI wrapped its response
    let cleaned = response.trim();
    const fenceMatch = cleaned.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
    if (fenceMatch) cleaned = fenceMatch[1].trim();

    try {
      const parsed: ScoreResult = JSON.parse(cleaned);
      setResult(parsed);
    } catch {
      // If JSON was truncated, try to repair by closing open strings/objects
      try {
        let repaired = cleaned;
        // Close any unclosed string
        const quoteCount = (repaired.match(/(?<!\\)"/g) || []).length;
        if (quoteCount % 2 !== 0) repaired += '"';
        // Close open braces/brackets
        const opens = (repaired.match(/[{[]/g) || []).length;
        const closes = (repaired.match(/[}\]]/g) || []).length;
        for (let i = 0; i < opens - closes; i++) repaired += '}';
        const repairedParsed: ScoreResult = JSON.parse(repaired);
        setResult(repairedParsed);
      } catch {
        setRawFallback(response);
      }
    }
  };

  const handleReset = () => {
    setPrompt('');
    setResult(null);
    setRawFallback(null);
    setShowImproved(false);
  };

  return (
    <ScrollReveal>
      <div className="my-8 rounded-card border border-border bg-white shadow-elevation-1 overflow-hidden">
        <div className="border-l-[6px] border-l-accent p-5">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <Target size={18} className="text-accent" />
            <span className="text-sm font-bold uppercase tracking-wider text-accent">
              Prompt Scoring Exercise
            </span>
          </div>

          {/* Scenario */}
          <p className="text-text-primary font-medium leading-relaxed mb-2">{scenario}</p>

          {/* Data context */}
          <p className="text-sm text-text-secondary leading-relaxed mb-2">
            <span className="font-semibold">Available Data:</span> {dataContext}
          </p>

          {/* Objective */}
          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            <span className="font-semibold">Your Objective:</span> {objective}
          </p>

          {/* Prompt input — always shown */}
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 border border-border rounded-input text-sm text-text-primary bg-surface/50 resize-y min-h-[100px] focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors font-mono"
            placeholder="Write your C+T+O prompt here..."
            rows={5}
            disabled={streaming}
          />

          {/* Action button */}
          <div className="flex items-center gap-3 mt-3">
            {available ? (
              <button
                onClick={handleSubmit}
                disabled={streaming || !prompt.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-button hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {streaming ? (
                  <>
                    <span className="inline-flex gap-0.5">
                      <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    Scoring...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Score My Prompt
                  </>
                )}
              </button>
            ) : referencePrompt ? (
              <button
                onClick={() => setShowSampleAnswer(!showSampleAnswer)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-button hover:opacity-90 transition-all"
              >
                <Send size={14} />
                {showSampleAnswer ? 'Hide Sample Answer' : 'Reveal Sample Answer'}
              </button>
            ) : null}

            {(result || rawFallback) && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary bg-surface border border-border rounded-button hover:bg-border/30 transition-colors"
              >
                <RotateCcw size={14} />
                Try Again
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="mt-2 text-xs text-error flex items-center gap-1">
              <AlertCircle size={12} />
              {error}
            </p>
          )}

          {/* Sample answer reveal (AI off) */}
          <AnimatePresence>
            {showSampleAnswer && !available && referencePrompt && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="mt-4 rounded-card border border-border bg-surface overflow-hidden">
                  <div className="border-b border-border bg-primary/5 px-4 py-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Sample Answer
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-mono text-text-primary whitespace-pre-wrap leading-relaxed">
                      {referencePrompt.split(/(Context:|Task:|Output:)/).map((part, i) =>
                        /^(Context|Task|Output):$/.test(part) ? (
                          <strong key={i}>{part}</strong>
                        ) : (
                          <span key={i}>{part}</span>
                        )
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Parsed score results (AI on) */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="mt-5"
            >
              <div className="flex flex-wrap gap-3 mb-4">
                <ScoreCard label="Context" score={result.context.score} feedback={result.context.feedback} />
                <ScoreCard label="Task" score={result.task.score} feedback={result.task.feedback} />
                <ScoreCard label="Output" score={result.output.score} feedback={result.output.feedback} />
              </div>

              <div className="rounded-card border border-border bg-surface px-4 py-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-bold ${scoreColor(Math.round(result.overall / 3))}`}>
                    {result.overall}/15
                  </span>
                  <p className="text-sm text-text-secondary leading-relaxed">{result.summary}</p>
                </div>
              </div>

              {result.improved_prompt && (
                <div>
                  <button
                    onClick={() => setShowImproved(!showImproved)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary-light rounded-button hover:bg-primary/15 transition-colors"
                  >
                    {showImproved ? 'Hide Improved Prompt' : 'See Improved Prompt'}
                    <motion.span
                      animate={{ rotate: showImproved ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown size={16} />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {showImproved && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 rounded-card border border-border bg-surface overflow-hidden">
                          <div className="border-b border-border bg-success/5 px-4 py-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-success">
                              Improved Prompt
                            </span>
                          </div>
                          <div className="p-4">
                            <p className="text-sm font-mono text-text-primary whitespace-pre-wrap leading-relaxed">
                              {result.improved_prompt}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}

          {/* Raw fallback if JSON parsing failed */}
          {rawFallback && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="mt-4 rounded-card border border-border bg-surface overflow-hidden"
            >
              <div className="border-b border-border bg-warning/5 px-4 py-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-warning">
                  AI Feedback
                </span>
              </div>
              <div className="p-4 prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:my-2 prose-pre:bg-white prose-pre:text-text-primary prose-code:text-xs prose-code:bg-white prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                <Markdown>{rawFallback}</Markdown>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </ScrollReveal>
  );
}
