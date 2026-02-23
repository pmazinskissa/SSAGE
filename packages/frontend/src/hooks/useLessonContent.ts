import { useState, useEffect, type ComponentType } from 'react';
import type { LessonMeta } from '@playbook/shared';
import { api } from '../lib/api';
import { renderMdx } from '../lib/mdx-renderer';
import { mdxComponents } from '../components/mdx';

interface UseLessonContentResult {
  meta: LessonMeta | null;
  MdxComponent: ComponentType | null;
  loading: boolean;
  error: string | null;
}

export function useLessonContent(
  courseSlug: string | undefined,
  moduleSlug: string | undefined,
  lessonSlug: string | undefined
): UseLessonContentResult {
  const [meta, setMeta] = useState<LessonMeta | null>(null);
  const [MdxComponent, setMdxComponent] = useState<ComponentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseSlug || !moduleSlug || !lessonSlug) return;

    let stale = false;
    setLoading(true);
    setError(null);
    setMdxComponent(null);

    api.getLesson(courseSlug, moduleSlug, lessonSlug)
      .then(async (data) => {
        if (stale) return;
        setMeta(data.meta);
        const Component = await renderMdx(data.compiledSource, mdxComponents);
        if (!stale) setMdxComponent(() => Component);
      })
      .catch((err) => { if (!stale) setError(err.message); })
      .finally(() => { if (!stale) setLoading(false); });

    return () => { stale = true; };
  }, [courseSlug, moduleSlug, lessonSlug]);

  return { meta, MdxComponent, loading, error };
}
