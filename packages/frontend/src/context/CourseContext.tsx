import { createContext, useContext, useEffect, useState, useMemo, useCallback, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import type { CourseConfig, CourseNavTree } from '@playbook/shared';
import { api } from '../lib/api';

interface ContinueLesson {
  moduleSlug: string;
  lessonSlug: string;
  title: string;
}

interface CourseContextValue {
  course: CourseConfig | null;
  navTree: CourseNavTree | null;
  loading: boolean;
  error: string | null;
  continueLesson: ContinueLesson | null;
  refreshNavTree: () => void;
}

const CourseContext = createContext<CourseContextValue>({
  course: null,
  navTree: null,
  loading: true,
  error: null,
  continueLesson: null,
  refreshNavTree: () => {},
});

export function CourseProvider({ children }: { children: ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  const [course, setCourse] = useState<CourseConfig | null>(null);
  const [navTree, setNavTree] = useState<CourseNavTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = useCallback((courseSlug: string, showLoading = true) => {
    if (showLoading) {
      setLoading(true);
      setError(null);
    }
    api.getCourse(courseSlug)
      .then((data) => {
        setCourse(data.course);
        setNavTree(data.navTree);
      })
      .catch((err) => { if (showLoading) setError(err.message); })
      .finally(() => { if (showLoading) setLoading(false); });
  }, []);

  useEffect(() => {
    if (!slug) return;
    fetchCourse(slug, true);
  }, [slug, fetchCourse]);

  const refreshNavTree = useCallback(() => {
    if (slug) fetchCourse(slug, false);
  }, [slug, fetchCourse]);

  // Compute continue lesson from navTree progress
  const continueLesson = useMemo<ContinueLesson | null>(() => {
    if (!navTree) return null;

    // Find first in_progress lesson
    for (const mod of navTree.modules) {
      for (const lesson of mod.lessons) {
        if (lesson.status === 'in_progress') {
          return { moduleSlug: mod.slug, lessonSlug: lesson.slug, title: lesson.title };
        }
      }
    }

    // If none in_progress, find first not_started
    for (const mod of navTree.modules) {
      for (const lesson of mod.lessons) {
        if (lesson.status === 'not_started') {
          return { moduleSlug: mod.slug, lessonSlug: lesson.slug, title: lesson.title };
        }
      }
    }

    return null;
  }, [navTree]);

  const value = useMemo(
    () => ({ course, navTree, loading, error, continueLesson, refreshNavTree }),
    [course, navTree, loading, error, continueLesson, refreshNavTree]
  );

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  return useContext(CourseContext);
}
