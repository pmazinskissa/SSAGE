import { ChevronLeft, ChevronRight, ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LessonNavProps {
  courseSlug: string;
  prevLesson?: { moduleSlug: string; slug: string; title: string } | null;
  nextLesson?: { moduleSlug: string; slug: string; title: string } | null;
  knowledgeCheckLink?: string | null;
  currentIndex: number;
  totalLessons: number;
}

export default function LessonNav({
  courseSlug,
  prevLesson,
  nextLesson,
  knowledgeCheckLink,
  currentIndex,
  totalLessons,
}: LessonNavProps) {
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

      {nextLesson ? (
        <Link
          to={`/courses/${courseSlug}/modules/${nextLesson.moduleSlug}/lessons/${nextLesson.slug}`}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white hover:bg-primary-hover transition-colors rounded-button"
        >
          Next
          <ChevronRight size={16} />
        </Link>
      ) : knowledgeCheckLink ? (
        <Link
          to={knowledgeCheckLink}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-accent text-white rounded-button hover:opacity-90 transition-opacity"
        >
          <ClipboardCheck size={16} />
          <span className="hidden sm:inline">Knowledge Check</span>
          <span className="sm:hidden">Quiz</span>
        </Link>
      ) : (
        <Link
          to={`/courses/${courseSlug}/completion`}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-success text-white rounded-button hover:opacity-90 transition-opacity"
        >
          Complete Course
        </Link>
      )}
    </div>
  );
}
