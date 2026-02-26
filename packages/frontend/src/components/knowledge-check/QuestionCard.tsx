import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, BookOpen, Bot, ChevronLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { springBounce } from '../../lib/animations';
import type { KnowledgeCheckQuestion } from '@playbook/shared';
import { useAI } from '../../context/AIContext';
import MultipleChoiceSingle from './MultipleChoiceSingle';
import MultipleChoiceMulti from './MultipleChoiceMulti';
import TrueFalse from './TrueFalse';
import MatchingQuestion from './MatchingQuestion';
import DragToRank from './DragToRank';
import FillInBlank from './FillInBlank';

interface QuestionCardProps {
  question: KnowledgeCheckQuestion;
  questionNumber: number;
  totalQuestions: number;
  answer: any;
  onAnswer: (answer: any) => void;
  feedback: { correct: boolean; explanation: string } | null;
  onCheck: () => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  moduleSlug: string;
  readOnly?: boolean;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  answer,
  onAnswer,
  feedback,
  onCheck,
  onNext,
  onPrev,
  isFirst,
  isLast,
  moduleSlug,
  readOnly = false,
}: QuestionCardProps) {
  const { slug } = useParams<{ slug: string }>();
  const { available: aiAvailable, setChatOpen, setPendingMessage } = useAI();
  const checked = feedback !== null || readOnly;

  const buildAIPrompt = (): { displayText: string; fullText: string } => {
    const displayText = question.question;
    let context = 'Help me with this knowledge check question. Please look up the exact relevant section in the course material and check every option against it.\n\n' + question.question;
    if (question.type === 'multiple-choice-single') {
      context += '\n\nAnswer options:\n' + question.options.map((o) => `- ${o.text}`).join('\n');
    } else if (question.type === 'multiple-choice-multi') {
      context += '\n\nAnswer options (select all that apply):\n' + question.options.map((o) => `- ${o.text}`).join('\n');
      context += '\n\nPlease evaluate EACH option individually against the course material.';
    } else if (question.type === 'true-false') {
      context += '\n\nAnswer options:\n- True\n- False';
    } else if (question.type === 'matching') {
      context += '\n\nItems to match:\n' + question.pairs.map((p) => `- ${p.left} → ???`).join('\n');
      context += '\n\nAvailable matches:\n' + question.pairs.map((p) => `- ${p.right}`).join('\n');
    } else if (question.type === 'drag-to-rank') {
      context += '\n\nItems to rank:\n' + question.items.map((item) => `- ${item.text}`).join('\n');
    } else if (question.type === 'fill-in-blank') {
      const sentence = question.segments.map((s) => s.type === 'blank' ? '_____' : s.value).join('');
      context += '\n\nComplete the sentence: ' + sentence;
      if (question.word_bank?.length) {
        context += '\n\nWord bank: ' + question.word_bank.join(', ');
      }
    }
    return { displayText, fullText: context };
  };

  const hasAnswer = (() => {
    if (answer === null || answer === undefined) return false;
    if (typeof answer === 'string') return answer.length > 0;
    if (typeof answer === 'boolean') return true;
    if (Array.isArray(answer)) return answer.length > 0;
    if (typeof answer === 'object') {
      if (question.type === 'fill-in-blank') {
        const blankCount = question.segments.filter((s) => s.type === 'blank').length;
        return Object.keys(answer).length >= blankCount;
      }
      return Object.keys(answer).length > 0;
    }
    return false;
  })();

  return (
    <motion.div
      variants={springBounce}
      initial="hidden"
      animate="visible"
      className="bg-white/70 backdrop-blur-md rounded-card border border-white/50 shadow-elevation-1 overflow-hidden"
    >
      {/* Feedback border */}
      <div className={`border-l-[6px] ${
        feedback === null
          ? 'border-l-primary'
          : feedback.correct
            ? 'border-l-success'
            : 'border-l-error'
      }`}>
        {/* Header */}
        <div className="p-5 pb-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary/60">
              Question {questionNumber} of {totalQuestions}
            </p>
            {aiAvailable && (
              <button
                onClick={() => {
                  setPendingMessage(buildAIPrompt());
                  setChatOpen(true);
                }}
                className="w-9 h-9 bg-primary text-white rounded-full shadow-md hover:bg-primary-hover hover:shadow-lg transition-all flex items-center justify-center"
                title="Ask the AI assistant"
              >
                <Bot size={20} />
              </button>
            )}
          </div>
          <p className="text-text-primary font-medium text-lg leading-relaxed mb-5">
            {question.question}
          </p>
        </div>

        {/* Question renderer */}
        <div className="px-5 pb-5">
          {question.type === 'multiple-choice-single' && (
            <MultipleChoiceSingle
              question={question}
              selectedAnswer={answer}
              onAnswer={onAnswer}
              disabled={checked}
            />
          )}
          {question.type === 'multiple-choice-multi' && (
            <MultipleChoiceMulti
              question={question}
              selectedAnswers={answer || []}
              onAnswer={onAnswer}
              disabled={checked}
            />
          )}
          {question.type === 'true-false' && (
            <TrueFalse
              question={question}
              selectedAnswer={answer}
              onAnswer={onAnswer}
              disabled={checked}
            />
          )}
          {question.type === 'matching' && (
            <MatchingQuestion
              question={question}
              selectedMatches={answer || {}}
              onAnswer={onAnswer}
              disabled={checked}
            />
          )}
          {question.type === 'drag-to-rank' && (
            <DragToRank
              question={question}
              orderedIds={answer || []}
              onAnswer={onAnswer}
              disabled={checked}
            />
          )}
          {question.type === 'fill-in-blank' && (
            <FillInBlank
              question={question}
              answers={answer || {}}
              onAnswer={onAnswer}
              disabled={checked}
            />
          )}
        </div>

        {/* Feedback section */}
        {feedback && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className={`mx-5 mb-5 p-4 rounded-card ${
              feedback.correct ? 'bg-success/10' : 'bg-error/10'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {feedback.correct ? (
                  <CheckCircle2 size={18} className="text-success" />
                ) : (
                  <XCircle size={18} className="text-error" />
                )}
                <span className={`text-sm font-semibold ${
                  feedback.correct ? 'text-success' : 'text-error'
                }`}>
                  {feedback.correct ? 'Correct!' : 'Not quite'}
                </span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {feedback.explanation}
              </p>
              {question.lesson_link && (
                <Link
                  to={`/courses/${slug}/modules/${moduleSlug}/lessons/${question.lesson_link}`}
                  className="flex items-center gap-1 text-xs text-link mt-2 hover:underline"
                >
                  <BookOpen size={12} />
                  {question.lesson_link_label || 'Review this lesson'}
                </Link>
              )}
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        <div className="px-5 pb-5 flex items-center justify-between gap-3">
          {!isFirst ? (
            <button
              onClick={onPrev}
              className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-primary transition-colors rounded-button border border-border hover:border-primary"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          ) : (
            <div />
          )}
          {!checked ? (
            <button
              onClick={onCheck}
              disabled={!hasAnswer}
              className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-button hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={onNext}
              className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-button hover:bg-primary-hover transition-colors"
            >
              {isLast ? (readOnly ? 'Back to Summary' : 'See Results') : 'Next Question'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
