import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { BookOpen, ArrowRight, Trophy } from 'lucide-react';
import { springBounce, fadeInUp, stagger } from '../../lib/animations';
import type { KnowledgeCheckResult } from '@playbook/shared';

interface Props {
  result: KnowledgeCheckResult;
  moduleSlug: string;
  nextModuleSlug?: string;
  nextModuleFirstLessonSlug?: string;
  courseCompleted?: boolean;
  questionLabels: { id: string; lessonLink?: string; lessonLinkLabel?: string; questionText: string }[];
}

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'var(--color-success)' : score >= 60 ? 'var(--color-warning)' : 'var(--color-error)';

  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="8"
        />
        <motion.circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-text-primary">{Math.round(score)}%</span>
        <span className="text-xs text-text-secondary">Score</span>
      </div>
    </div>
  );
}

export default function KnowledgeCheckSummary({ result, moduleSlug, nextModuleSlug, nextModuleFirstLessonSlug, courseCompleted, questionLabels }: Props) {
  const { slug } = useParams<{ slug: string }>();
  const missed = result.results.filter((r) => !r.correct);

  return (
    <motion.div
      variants={springBounce}
      initial="hidden"
      animate="visible"
      className="bg-white/70 backdrop-blur-md rounded-card border border-white/50 shadow-elevation-1 p-8"
    >
      {/* Score section */}
      <div className="flex flex-col items-center text-center mb-8">
        <ScoreRing score={result.score} />
        <h2 className="text-xl font-bold text-text-primary mt-4" style={{ fontFamily: 'var(--font-heading)' }}>
          {result.score >= 80 ? 'Great job!' : result.score >= 60 ? 'Good effort!' : 'Keep learning!'}
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          You got {result.correct} out of {result.total} questions correct
        </p>
      </div>

      {/* Missed concepts */}
      {missed.length > 0 && (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary/60 mb-3">
            Review These Concepts
          </h3>
          <div className="space-y-2">
            {missed.map((r) => {
              const label = questionLabels.find((q) => q.id === r.questionId);
              return (
                <motion.div
                  key={r.questionId}
                  variants={fadeInUp}
                  className="flex items-start gap-3 p-3 rounded-card border border-border bg-error/5"
                >
                  <BookOpen size={16} className="text-error flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">
                      {label?.questionText || r.questionId}
                    </p>
                    {r.lesson_link && (
                      <Link
                        to={`/courses/${slug}/modules/${moduleSlug}/lessons/${r.lesson_link}`}
                        className="text-xs text-link hover:underline"
                      >
                        {r.lesson_link_label || 'Review lesson'}
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Continue button */}
      <div className="flex justify-center">
        {nextModuleSlug && nextModuleFirstLessonSlug ? (
          <Link
            to={`/courses/${slug}/modules/${nextModuleSlug}/lessons/${nextModuleFirstLessonSlug}`}
            className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-primary rounded-button hover:bg-primary-hover transition-colors"
          >
            Continue to Next Module
            <ArrowRight size={16} />
          </Link>
        ) : courseCompleted ? (
          <Link
            to={`/courses/${slug}/feedback`}
            className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-success rounded-button hover:opacity-90 transition-opacity"
          >
            <Trophy size={16} />
            Continue to Finish
          </Link>
        ) : (
          <Link
            to={`/courses/${slug}`}
            className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-success rounded-button hover:opacity-90 transition-opacity"
          >
            Back to Course Overview
          </Link>
        )}
      </div>
    </motion.div>
  );
}
