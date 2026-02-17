import path from 'path';
import fs from 'fs';
import { config } from '../config/env.js';
import { readYaml } from '../lib/yaml-parser.js';
import { compileMdx } from '../lib/mdx-compiler.js';
import { getFromCache, setInCache } from '../lib/content-cache.js';
import { hasKnowledgeCheck } from './knowledge-check.service.js';
import type { CourseConfig, ModuleConfig, LessonMeta, LessonContent, CourseNavTree, NavModule, NavLesson } from '@playbook/shared';

const coursesDir = () => path.join(config.contentDir, 'courses');

export function listCourses(): CourseConfig[] {
  const cached = getFromCache<CourseConfig[]>('courses:list');
  if (cached) return cached;

  const dir = coursesDir();
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const courses = entries
    .filter((e) => e.isDirectory())
    .map((e) => {
      const yamlPath = path.join(dir, e.name, 'course.yaml');
      if (!fs.existsSync(yamlPath)) return null;
      return readYaml<CourseConfig>(yamlPath);
    })
    .filter(Boolean) as CourseConfig[];

  setInCache('courses:list', courses);
  return courses;
}

export function getCourse(slug: string): CourseConfig | null {
  const cacheKey = `course:${slug}`;
  const cached = getFromCache<CourseConfig>(cacheKey);
  if (cached) return cached;

  const yamlPath = path.join(coursesDir(), slug, 'course.yaml');
  if (!fs.existsSync(yamlPath)) return null;

  const course = readYaml<CourseConfig>(yamlPath);
  setInCache(cacheKey, course);
  return course;
}

export function getModule(courseSlug: string, moduleSlug: string): ModuleConfig | null {
  const cacheKey = `module:${courseSlug}:${moduleSlug}`;
  const cached = getFromCache<ModuleConfig>(cacheKey);
  if (cached) return cached;

  const yamlPath = path.join(coursesDir(), courseSlug, 'modules', moduleSlug, 'module.yaml');
  if (!fs.existsSync(yamlPath)) return null;

  const mod = readYaml<ModuleConfig>(yamlPath);
  setInCache(cacheKey, mod);
  return mod;
}

export async function getLesson(
  courseSlug: string,
  moduleSlug: string,
  lessonSlug: string
): Promise<LessonContent | null> {
  const mdxPath = path.join(coursesDir(), courseSlug, 'modules', moduleSlug, 'lessons', `${lessonSlug}.mdx`);
  if (!fs.existsSync(mdxPath)) return null;

  const source = fs.readFileSync(mdxPath, 'utf-8');

  // Extract frontmatter (simple YAML between --- delimiters)
  const frontmatterMatch = source.match(/^---\n([\s\S]*?)\n---/);
  let meta: LessonMeta = {
    title: lessonSlug.replace(/^\d+-/, '').replace(/-/g, ' '),
    slug: lessonSlug,
    module_slug: moduleSlug,
    estimated_duration_minutes: 5,
    order: parseInt(lessonSlug.match(/^(\d+)/)?.[1] || '0', 10),
  };

  if (frontmatterMatch) {
    try {
      const { parse } = await import('yaml');
      const fm = parse(frontmatterMatch[1]);
      meta = { ...meta, ...fm, slug: lessonSlug, module_slug: moduleSlug };
    } catch {
      // Use defaults if frontmatter parsing fails
    }
  }

  const contentWithoutFrontmatter = frontmatterMatch
    ? source.slice(frontmatterMatch[0].length).trim()
    : source;

  const compiledSource = await compileMdx(contentWithoutFrontmatter, mdxPath);

  return { meta, compiledSource };
}

export function getCourseNavTree(courseSlug: string): CourseNavTree | null {
  const course = getCourse(courseSlug);
  if (!course) return null;

  const modules: NavModule[] = course.modules.map((moduleSlug, moduleIndex) => {
    const mod = getModule(courseSlug, moduleSlug);
    if (!mod) {
      return {
        title: moduleSlug,
        slug: moduleSlug,
        order: moduleIndex + 1,
        objectives: [],
        estimated_duration_minutes: 0,
        lessons: [],
        status: 'not_started' as const,
        has_knowledge_check: false,
      };
    }

    const lessons: NavLesson[] = mod.lessons.map((lessonSlug, lessonIndex) => {
      // Read frontmatter title from MDX file
      let title = lessonSlug
        .replace(/^\d+-/, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      let duration = 5;

      const mdxPath = path.join(coursesDir(), courseSlug, 'modules', moduleSlug, 'lessons', `${lessonSlug}.mdx`);
      if (fs.existsSync(mdxPath)) {
        try {
          const source = fs.readFileSync(mdxPath, 'utf-8');
          const fmMatch = source.match(/^---\n([\s\S]*?)\n---/);
          if (fmMatch) {
            const titleMatch = fmMatch[1].match(/^title:\s*"?([^"\n]+)"?/m);
            if (titleMatch) title = titleMatch[1].trim();
            const durationMatch = fmMatch[1].match(/^estimated_duration_minutes:\s*(\d+)/m);
            if (durationMatch) duration = parseInt(durationMatch[1], 10);
          }
        } catch {
          // Fall back to slug-derived title
        }
      }

      return {
        title,
        slug: lessonSlug,
        order: lessonIndex + 1,
        estimated_duration_minutes: duration,
        status: 'not_started' as const,
      };
    });

    return {
      title: mod.title,
      slug: moduleSlug,
      order: moduleIndex + 1,
      objectives: mod.objectives,
      estimated_duration_minutes: mod.estimated_duration_minutes,
      lessons,
      status: 'not_started' as const,
      has_knowledge_check: hasKnowledgeCheck(courseSlug, moduleSlug),
    };
  });

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return {
    course_slug: courseSlug,
    course_title: course.title,
    modules,
    total_lessons: totalLessons,
    completed_lessons: 0,
  };
}
