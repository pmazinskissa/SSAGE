export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

export interface NavLesson {
  title: string;
  slug: string;
  order: number;
  estimated_duration_minutes: number;
  status: LessonStatus;
}

export interface NavModule {
  title: string;
  slug: string;
  order: number;
  objectives: string[];
  estimated_duration_minutes: number;
  lessons: NavLesson[];
  status: LessonStatus;
  has_knowledge_check: boolean;
  knowledge_check_completed?: boolean;
}

export interface CourseNavTree {
  course_slug: string;
  course_title: string;
  modules: NavModule[];
  total_lessons: number;
  completed_lessons: number;
}
