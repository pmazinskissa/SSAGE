import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useLessonContent } from '../hooks/useLessonContent';
import { useHeartbeat } from '../hooks/useHeartbeat';
import { useCourse } from '../context/CourseContext';
import LessonNav from '../components/layout/LessonNav';
import { GradientMesh, TopographicBg } from '../components/ui/Backgrounds';
import { pageTransition } from '../lib/animations';
import { api } from '../lib/api';

export default function LessonPage() {
  const { slug, moduleSlug, lessonSlug } = useParams<{
    slug: string;
    moduleSlug: string;
    lessonSlug: string;
  }>();

  const { navTree, course, refreshNavTree } = useCourse();
  const { meta, MdxComponent, loading, error } = useLessonContent(slug, moduleSlug, lessonSlug);

  // Heartbeat for time tracking
  useHeartbeat(slug, moduleSlug, lessonSlug);

  // Elapsed-time timer for minimum lesson time enforcement
  const minLessonTime = course?.min_lesson_time_seconds ?? 0;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(0);
    if (minLessonTime <= 0) return;
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [lessonSlug, minLessonTime]);

  const minTimeRemaining = Math.max(0, minLessonTime - elapsed);

  // Check if this lesson is locked (sequential mode or KC gate)
  const isCurrentLessonLocked = useMemo(() => {
    if (!navTree || !course || !moduleSlug || !lessonSlug) return false;
    const isLinear = course.navigation_mode === 'linear';
    const requireKC = course.require_knowledge_checks ?? false;
    if (!isLinear && !requireKC) return false;

    const allLessons: Array<{ modSlug: string; slug: string; status: string }> = [];
    for (const mod of navTree.modules) {
      for (const lesson of mod.lessons) {
        allLessons.push({ modSlug: mod.slug, slug: lesson.slug, status: lesson.status });
      }
    }
    const firstNonCompleted = isLinear ? allLessons.findIndex((l) => l.status !== 'completed') : -1;
    let kcBlockedFromModIdx = Infinity;
    if (requireKC) {
      for (let i = 0; i < navTree.modules.length; i++) {
        const mod = navTree.modules[i];
        if (mod.has_knowledge_check && !mod.knowledge_check_completed) {
          kcBlockedFromModIdx = i + 1;
          break;
        }
      }
    }

    let flatIdx = 0;
    for (let modIdx = 0; modIdx < navTree.modules.length; modIdx++) {
      const mod = navTree.modules[modIdx];
      for (const lesson of mod.lessons) {
        if (mod.slug === moduleSlug && lesson.slug === lessonSlug) {
          const linearLocked = isLinear && firstNonCompleted !== -1 && flatIdx > firstNonCompleted;
          const kcLocked = requireKC && modIdx >= kcBlockedFromModIdx;
          return linearLocked || kcLocked;
        }
        flatIdx++;
      }
    }
    return false;
  }, [navTree, course, moduleSlug, lessonSlug]);

  // Keep refreshNavTree stable in a ref so the cleanup effect always has the latest
  const refreshRef = useRef(refreshNavTree);
  refreshRef.current = refreshNavTree;

  // Track current lesson in a ref so the cleanup function always has the latest values
  const currentRef = useRef<{ courseSlug: string; lessonSlug: string; moduleSlug: string } | null>(null);

  useEffect(() => {
    if (!slug || !moduleSlug || !lessonSlug) return;

    // Mark the previous lesson complete when navigating to a different lesson
    const prev = currentRef.current;
    if (prev && (prev.lessonSlug !== lessonSlug || prev.moduleSlug !== moduleSlug)) {
      api.completeLesson(prev.courseSlug, prev.lessonSlug, prev.moduleSlug)
        .then(() => refreshRef.current())
        .catch(() => {});
    }

    currentRef.current = { courseSlug: slug, lessonSlug, moduleSlug };

    // Mark the current lesson complete on unmount (navigating away to non-lesson pages, closing tab, etc.)
    return () => {
      const cur = currentRef.current;
      if (cur) {
        api.completeLesson(cur.courseSlug, cur.lessonSlug, cur.moduleSlug)
          .then(() => refreshRef.current())
          .catch(() => {});
        currentRef.current = null;
      }
    };
  }, [slug, moduleSlug, lessonSlug]);

  // Scroll to top on lesson change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lessonSlug]);

  // Compute prev/next lessons + progress info from navTree
  const { prevLesson, nextLesson, knowledgeCheckLink, currentIndex, totalLessons, moduleTitle, moduleNumber, lessonInModule, lessonsInModule, completedLessons } = useMemo(() => {
    if (!navTree) return { prevLesson: null, nextLesson: null, knowledgeCheckLink: null, currentIndex: 0, totalLessons: 0, moduleTitle: '', moduleNumber: 0, lessonInModule: 0, lessonsInModule: 0, completedLessons: 0 };

    const allLessons: { moduleSlug: string; slug: string; title: string }[] = [];
    navTree.modules.forEach((mod) => {
      mod.lessons.forEach((lesson) => {
        allLessons.push({ moduleSlug: mod.slug, slug: lesson.slug, title: lesson.title });
      });
    });

    const idx = allLessons.findIndex(
      (l) => l.moduleSlug === moduleSlug && l.slug === lessonSlug
    );

    // Module info
    const currentMod = navTree.modules.find((m) => m.slug === moduleSlug);
    const modIdx = navTree.modules.findIndex((m) => m.slug === moduleSlug);
    const lessonIdx = currentMod ? currentMod.lessons.findIndex((l) => l.slug === lessonSlug) : -1;

    // Check if this is the last lesson in a module that has a knowledge check
    let kcLink: string | null = null;
    if (currentMod && currentMod.has_knowledge_check) {
      const lastLesson = currentMod.lessons[currentMod.lessons.length - 1];
      if (lastLesson && lastLesson.slug === lessonSlug) {
        kcLink = `/courses/${slug}/modules/${moduleSlug}/knowledge-check`;
      }
    }

    return {
      prevLesson: idx > 0 ? allLessons[idx - 1] : null,
      nextLesson: kcLink ? null : (idx < allLessons.length - 1 ? allLessons[idx + 1] : null),
      knowledgeCheckLink: kcLink,
      currentIndex: idx + 1,
      totalLessons: allLessons.length,
      moduleTitle: currentMod?.title || '',
      moduleNumber: modIdx + 1,
      lessonInModule: lessonIdx + 1,
      lessonsInModule: currentMod?.lessons.length || 0,
      completedLessons: navTree.completed_lessons,
    };
  }, [navTree, moduleSlug, lessonSlug, slug]);

  // Redirect to course overview if this lesson is locked
  if (!loading && isCurrentLessonLocked && slug) {
    return <Navigate to={`/courses/${slug}`} replace />;
  }

  if (loading) {
    return (
      <div className="max-w-prose mx-auto px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-surface rounded w-1/4" />
          <div className="h-8 bg-surface rounded w-3/4" />
          <div className="h-4 bg-surface rounded w-full" />
          <div className="h-4 bg-surface rounded w-5/6" />
          <div className="h-4 bg-surface rounded w-4/6" />
          <div className="h-32 bg-surface rounded w-full mt-6" />
          <div className="h-4 bg-surface rounded w-full" />
          <div className="h-4 bg-surface rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-prose mx-auto px-6 py-12 text-center">
        <p className="text-error font-semibold">Failed to load lesson</p>
        <p className="text-text-secondary mt-2">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      key={lessonSlug}
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Mini-hero header */}
      {meta && (
        <section className="relative overflow-hidden">
          <GradientMesh className="opacity-40" />
          <div className="relative max-w-prose mx-auto px-6 pt-8 pb-6">
            {/* Module & progress context */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Module {moduleNumber}: {moduleTitle}
              </p>
              <span className="text-xs text-text-secondary">
                {Math.round((completedLessons / Math.max(totalLessons, 1)) * 100)}% complete
              </span>
            </div>

            {/* Course progress bar */}
            <div className="h-1.5 bg-surface rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(completedLessons / Math.max(totalLessons, 1)) * 100}%` }}
              />
            </div>

            <p className="text-xs text-text-secondary mb-2">
              Lesson {lessonInModule} of {lessonsInModule} in this module
            </p>
            <h1
              className="text-2xl sm:text-3xl font-bold text-text-primary"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {meta.title}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-text-secondary">
              <Clock size={14} />
              <span>~{meta.estimated_duration_minutes} min</span>
            </div>
          </div>
        </section>
      )}

      {/* Content area with topo background */}
      <div className="relative">
        <TopographicBg />
        <div className="relative max-w-prose mx-auto px-6 py-8">
          {/* MDX content */}
          <article className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-text-primary prose-p:text-text-secondary prose-a:text-link prose-strong:text-text-primary prose-code:text-primary prose-code:bg-primary-light prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-th:text-white">
            {MdxComponent && <MdxComponent />}
          </article>

          {/* Previous/Next navigation */}
          {slug && (
            <LessonNav
              courseSlug={slug}
              prevLesson={prevLesson}
              nextLesson={nextLesson}
              knowledgeCheckLink={knowledgeCheckLink}
              currentIndex={currentIndex}
              totalLessons={totalLessons}
              minTimeRemaining={minTimeRemaining}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
