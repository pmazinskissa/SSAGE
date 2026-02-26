import { ChevronLeft, ChevronRight, ClipboardCheck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LessonNavProps {
  courseSlug: string;
  prevLesson?: { moduleSlug: string; slug: string; title: string } | null;
  nextLesson?: { moduleSlug: string; slug: string; title: string } | null;
  knowledgeCheckLink?: string | null;
  currentIndex: number;
  totalLessons: number;
  minTimeRemaining?: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
}

export default function LessonNav({
  courseSlug,
  prevLesson,
  nextLesson,
  knowledgeCheckLink,
  currentIndex,
  totalLessons,
  minTimeRemaining = 0,
}: LessonNavProps) {
  const forwardBlocked = minTimeRemaining > 0;

  const forwardButton = () => {
    if (forwardBlocked) {
      return (
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary/40 text-white rounded-button cursor-not-allowed"
          title={`Read for ${formatTime(minTimeRemaining)} more before continuing`}
        >
          <Clock size={14} />
          {formatTime(minTimeRemaining)}
        </button>
      );
    }

    if (nextLesson) {
      return (
        <Link
          to={`/courses/${courseSlug}/modules/${nextLesson.moduleSlug}/lessons/${nextLesson.slug}`}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white hover:bg-primary-hover transition-colors rounded-button"
        >
          Next
          <ChevronRight size={16} />
        </Link>
      );
    }

    if (knowledgeCheckLink) {
      return (
        <Link
          to={knowledgeCheckLink}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-accent text-white rounded-button hover:opacity-90 transition-opacity"
        >
          <ClipboardCheck size={16} />
          <span className="hidden sm:inline">Knowledge Check</span>
          <span className="sm:hidden">Quiz</span>
        </Link>
      );
    }

    return (
      <Link
        to={`/courses/${courseSlug}/completion`}
        className="flex items-center gap-2 px-4 py-2 text-sm bg-success text-white rounded-button hover:opacity-90 transition-opacity"
      >
        Complete Course
      </Link>
    );
  };

  return (
    <div className="flex items-center justify-between py-8 mt-8 border-t border-border" data-print-hide>
      {prevLesson ? (
        <Link
          to={`/courses/${courseSlug}/modules/${prevLesson.moduleSlug}/lessons/${prevLesson.slug}`}
          className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-primary transition-colors rounded-button border border-border hover:border-primary"
        >
          <ChevronLeft size={16} />
          Back
        </Link>
      ) : (
        <div />
      )}

      <span className="text-xs text-text-secondary">
        Lesson {currentIndex} of {totalLessons}
      </span>

      {forwardButton()}
    </div>
  );
}
