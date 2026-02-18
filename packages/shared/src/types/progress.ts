import type { LessonStatus } from './navigation.js';

export interface LessonProgressEntry {
  course_slug?: string;
  module_slug: string;
  lesson_slug: string;
  status: LessonStatus;
  time_spent_seconds: number;
  first_viewed_at: string | null;
  completed_at: string | null;
}

export interface KnowledgeCheckSummaryEntry {
  course_slug?: string;
  module_slug: string;
  total_questions: number;
  correct_answers: number;
  score: number;
  attempted_at: string;
}

export interface CourseProgress {
  course_slug: string;
  status: LessonStatus;
  current_module_slug: string | null;
  current_lesson_slug: string | null;
  started_at: string | null;
  completed_at: string | null;
  total_time_seconds: number;
  lessons: LessonProgressEntry[];
  knowledge_checks: KnowledgeCheckSummaryEntry[];
}

export interface HeartbeatPayload {
  module_slug: string;
  lesson_slug: string;
  time_delta_seconds: number;
}

export interface LessonCompletePayload {
  module_slug: string;
}

export interface KnowledgeCheckSubmission {
  answers: {
    question_id: string;
    selected_answer: string;
    is_correct: boolean;
  }[];
}
