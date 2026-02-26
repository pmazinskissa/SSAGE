import type { User } from './user.js';
import type { CourseProgress, LessonProgressEntry, KnowledgeCheckSummaryEntry } from './progress.js';

export interface UserWithProgress extends User {
  course_progress: {
    course_slug: string;
    status: string;
    total_time_seconds: number;
    completed_at: string | null;
  }[];
}

export interface CourseEnrollment {
  id: string;
  email: string;
  course_slug: string;
  enrolled_at: string;
  enrolled_by: string | null;
}

export interface UserDetail extends User {
  lesson_progress: LessonProgressEntry[];
  knowledge_check_scores: KnowledgeCheckSummaryEntry[];
  course_progress: CourseProgress[];
  enrollments: CourseEnrollment[];
}

export interface PreEnrollEntry {
  email: string;
  name: string;
  role: 'learner' | 'admin' | 'dev_admin';
  enrolled_at: string;
  enrolled_by: string | null;
}

export interface RoleChangePayload {
  role: 'learner' | 'admin' | 'dev_admin';
}

export interface DashboardMetrics {
  total_users: number;
  completed: number;
  in_progress: number;
  not_started: number;
  avg_completion_pct: number;
  avg_time_to_completion_seconds: number;
  avg_kc_score: number;
  module_funnel: {
    module_slug: string;
    module_title: string;
    completion_pct: number;
  }[];
}

export interface UserModuleProgress {
  module_slug: string;
  module_title: string;
  lessons_completed: number;
  total_lessons: number;
  time_spent_seconds: number;
  kc_score: number | null;
}

export interface UserWithModuleAnalytics {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  total_time_seconds: number;
  modules: UserModuleProgress[];
}

export interface ContentFeedback {
  id: string;
  user_id: string;
  user_name: string;
  course_slug: string;
  module_slug: string;
  lesson_slug: string;
  feedback_text: string;
  submitter_name: string | null;
  rating: number | null;
  is_resolved: boolean;
  created_at: string;
}

export interface PlatformSetting {
  key: string;
  value: string;
  updated_at: string;
}

export interface SearchResult {
  type: 'lesson' | 'module' | 'glossary';
  course_slug: string;
  module_slug: string;
  lesson_slug: string;
  title: string;
  snippet: string;
  match_context: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  displayContent?: string;
  timestamp: string;
}

export interface AIConfig {
  enabled: boolean;
  model: string;
  provider: 'anthropic' | 'openai' | 'azure-openai';
}
