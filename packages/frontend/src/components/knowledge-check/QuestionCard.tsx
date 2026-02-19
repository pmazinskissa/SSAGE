import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, BookOpen, Bot } from 'lucide-react';
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
  isLast: boolean;
  moduleSlug: string;
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
  isLast,
  moduleSlug,
}: QuestionCardProps) {
  const { slug } = useParams<{ slug: string }>();
  const { available: aiAvailable, setChatOpen } = useAI();
  const checked = feedback !== null;

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
          <p className="text-xs font-bold uppercase tracking-wider text-text-secondary/60 mb-2">
            Question {questionNumber} of {totalQuestions}
          </p>
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
          {aiAvailable ? (
            <button
              onClick={() => setChatOpen(true)}
              className="flex items-center gap-1.5 text-xs text-text-secondary/60 hover:text-primary transition-colors"
            >
              <Bot size={13} />
              Ask the AI assistant
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
              {isLast ? 'See Results' : 'Next Question'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
