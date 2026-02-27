import type {
  ThemeConfig,
  CourseConfig,
  CourseNavTree,
  LessonContent,
  GlossaryEntry,
  KnowledgeCheckConfig,
  AuthUser,
  CourseProgress,
  HeartbeatPayload,
  KnowledgeCheckSubmission,
  KnowledgeCheckDraftPayload,
  KnowledgeCheckAnswersResponse,
  DashboardMetrics,
  UserWithProgress,
  UserDetail,
  ContentFeedback,
  SearchResult,
  UserWithModuleAnalytics,
  CourseEnrollment,
  ReviewAnnotation,
} from '@playbook/shared';

const BASE_URL = '/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new Error(error.error?.message || 'API request failed');
  }
  const json = await res.json();
  return json.data;
}

export const api = {
  // Health (does not throw on 503 — DB down is a valid response)
  getHealth: async (): Promise<{ reachable: true; db: boolean } | { reachable: false }> => {
    try {
      const res = await fetch(`${BASE_URL}/health`, { credentials: 'include' });
      const json = await res.json();
      return { reachable: true, db: json.data?.db ?? false };
    } catch {
      return { reachable: false };
    }
  },

  // Theme
  getTheme: () => fetchApi<ThemeConfig>('/themes/active'),
  getThemes: () => fetchApi<ThemeConfig[]>('/themes'),

  // Courses
  getCourses: () => fetchApi<CourseConfig[]>('/courses'),
  getCourse: (slug: string) =>
    fetchApi<{ course: CourseConfig; navTree: CourseNavTree }>(`/courses/${slug}`),
  getLesson: (courseSlug: string, moduleSlug: string, lessonSlug: string) =>
    fetchApi<LessonContent>(`/courses/${courseSlug}/modules/${moduleSlug}/lessons/${lessonSlug}`),
  getGlossary: (courseSlug: string) =>
    fetchApi<GlossaryEntry[]>(`/courses/${courseSlug}/glossary`),
  getKnowledgeCheck: (courseSlug: string, moduleSlug: string) =>
    fetchApi<KnowledgeCheckConfig>(`/courses/${courseSlug}/modules/${moduleSlug}/knowledge-check`),

  // Auth
  getProviders: () =>
    fetchApi<{ oauth: string | null; devBypass: boolean; localAuth: boolean }>('/auth/providers'),
  getMe: () => fetchApi<AuthUser>('/auth/me'),
  devLogin: () =>
    fetchApi<AuthUser>('/auth/dev-login', { method: 'POST' }),
  register: (data: { email: string; name: string; password: string }) =>
    fetchApi<AuthUser>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  localLogin: (data: { email: string; password: string }) =>
    fetchApi<AuthUser>('/auth/local-login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  logout: () =>
    fetchApi<{ message: string }>('/auth/logout', { method: 'POST' }),

  // Progress
  getProgress: (courseSlug: string) =>
    fetchApi<CourseProgress | null>(`/progress/${courseSlug}`),
  heartbeat: (courseSlug: string, payload: HeartbeatPayload) =>
    fetchApi<{ ok: boolean }>(`/progress/${courseSlug}/heartbeat`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  completeLesson: (courseSlug: string, lessonSlug: string, moduleSlug: string) =>
    fetchApi<{ courseCompleted: boolean }>(`/progress/${courseSlug}/lessons/${lessonSlug}/complete`, {
      method: 'POST',
      body: JSON.stringify({ module_slug: moduleSlug }),
    }),
  submitKnowledgeCheck: (courseSlug: string, moduleSlug: string, submission: KnowledgeCheckSubmission) =>
    fetchApi<{ courseCompleted: boolean; alreadyCompleted?: boolean }>(`/progress/${courseSlug}/modules/${moduleSlug}/check`, {
      method: 'POST',
      body: JSON.stringify(submission),
    }),
  saveKnowledgeCheckDraft: (courseSlug: string, moduleSlug: string, draft: KnowledgeCheckDraftPayload) =>
    fetchApi<{ ok: boolean }>(`/progress/${courseSlug}/modules/${moduleSlug}/check/draft`, {
      method: 'POST',
      body: JSON.stringify(draft),
    }),
  getKnowledgeCheckAnswers: (courseSlug: string, moduleSlug: string) =>
    fetchApi<KnowledgeCheckAnswersResponse>(`/progress/${courseSlug}/modules/${moduleSlug}/check/answers`),

  // Admin — Dashboard
  getAdminDashboard: (userIds?: string[]) => {
    const params = new URLSearchParams();
    if (userIds && userIds.length > 0) params.set('userIds', userIds.join(','));
    const qs = params.toString();
    return fetchApi<DashboardMetrics>(`/admin/dashboard${qs ? `?${qs}` : ''}`);
  },

  // Admin — Users
  getAdminUsers: () => fetchApi<UserWithProgress[]>('/admin/users'),
  getPreEnrolledUsers: () =>
    fetchApi<{ id: string; email: string; name: string; role: string; enrolled_at: string; enrolled_by: string | null }[]>('/admin/users/pre-enrolled'),
  deletePreEnrolledUser: (id: string) =>
    fetchApi<{ message: string }>(`/admin/users/pre-enrolled/${id}`, { method: 'DELETE' }),
  getAdminUserAnalytics: (courseSlug: string) =>
    fetchApi<UserWithModuleAnalytics[]>(`/admin/users/analytics?course=${encodeURIComponent(courseSlug)}`),
  getAdminUserDetail: (id: string) => fetchApi<UserDetail>(`/admin/users/${id}`),
  updateUserRole: (id: string, role: 'learner' | 'admin' | 'dev_admin') =>
    fetchApi<{ message: string }>(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
  deactivateUser: (id: string) =>
    fetchApi<{ message: string }>(`/admin/users/${id}/deactivate`, { method: 'PUT' }),
  activateUser: (id: string) =>
    fetchApi<{ message: string }>(`/admin/users/${id}/activate`, { method: 'PUT' }),
  deleteUser: (id: string) =>
    fetchApi<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE' }),
  updateUserProfile: (id: string, name: string, email: string) =>
    fetchApi<{ message: string }>(`/admin/users/${id}/profile`, {
      method: 'PUT',
      body: JSON.stringify({ name, email }),
    }),
  bulkDeleteUsers: (ids: string[]) =>
    fetchApi<{ message: string }>('/admin/users/bulk/delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),
  bulkDeactivateUsers: (ids: string[]) =>
    fetchApi<{ message: string }>('/admin/users/bulk/deactivate', {
      method: 'PUT',
      body: JSON.stringify({ ids }),
    }),
  bulkActivateUsers: (ids: string[]) =>
    fetchApi<{ message: string }>('/admin/users/bulk/activate', {
      method: 'PUT',
      body: JSON.stringify({ ids }),
    }),
  bulkEnrollUsers: (emails: string[], courseSlugs: string[]) =>
    fetchApi<{ message: string }>('/admin/enrollments/bulk', {
      method: 'POST',
      body: JSON.stringify({ emails, course_slugs: courseSlugs }),
    }),
  bulkUnenrollUsers: (emails: string[], courseSlug: string) =>
    fetchApi<{ message: string }>('/admin/enrollments/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ emails, course_slug: courseSlug }),
    }),
  exportUsersCSV: async (courseSlug?: string) => {
    const qs = courseSlug ? `?course=${encodeURIComponent(courseSlug)}` : '';
    const res = await fetch(`${BASE_URL}/admin/users/export${qs}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to export CSV');
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  },
  preEnrollUsers: (entries: { name: string; email: string; role: 'learner' | 'admin' | 'dev_admin'; courses?: string[] }[]) =>
    fetchApi<{ added: number; skipped: number }>('/admin/users/pre-enroll', {
      method: 'POST',
      body: JSON.stringify({ entries }),
    }),

  // Admin — Enrollments
  getEnrollments: (email: string) =>
    fetchApi<CourseEnrollment[]>(`/admin/enrollments/${encodeURIComponent(email)}`),
  enrollUser: (email: string, courseSlugs: string[]) =>
    fetchApi<{ message: string }>('/admin/enrollments', {
      method: 'POST',
      body: JSON.stringify({ email, course_slugs: courseSlugs }),
    }),
  unenrollUser: (email: string, courseSlug: string) =>
    fetchApi<{ message: string }>('/admin/enrollments', {
      method: 'DELETE',
      body: JSON.stringify({ email, course_slug: courseSlug }),
    }),

  // Admin — Courses
  getAdminCourses: () => fetchApi<CourseConfig[]>('/admin/courses'),
  updateCourseSettings: (
    slug: string,
    settings: { ai_features_enabled: boolean; ordered_lessons: boolean; require_knowledge_checks: boolean; min_lesson_time_seconds: number }
  ) =>
    fetchApi<{ message: string }>(`/admin/courses/${slug}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // Admin — Settings
  getAdminSettings: () => fetchApi<Record<string, string>>('/admin/settings'),
  updateSetting: (key: string, value: string) =>
    fetchApi<{ message: string }>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ key, value }),
    }),
  testAiConnection: () =>
    fetchApi<{ success: boolean; message: string }>('/admin/settings/test-ai', { method: 'POST' }),

  // Admin — Feedback
  getAdminFeedback: (filters?: { course?: string; module?: string; resolved?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.course) params.set('course', filters.course);
    if (filters?.module) params.set('module', filters.module);
    if (filters?.resolved !== undefined) params.set('resolved', String(filters.resolved));
    const qs = params.toString();
    return fetchApi<ContentFeedback[]>(`/admin/feedback${qs ? `?${qs}` : ''}`);
  },
  createFeedback: (data: { course_slug: string; feedback_text: string; submitter_name?: string }) =>
    fetchApi<ContentFeedback>('/admin/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  resolveFeedback: (id: string, resolved = true) =>
    fetchApi<{ message: string }>(`/admin/feedback/${id}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ resolved }),
    }),
  deleteFeedback: (id: string) =>
    fetchApi<{ message: string }>(`/admin/feedback/${id}`, { method: 'DELETE' }),

  // Feedback (any authenticated user)
  submitFeedback: (data: { course_slug: string; feedback_text: string; submitter_name?: string; rating?: number }) =>
    fetchApi<ContentFeedback>('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Search
  searchContent: (courseSlug: string, query: string) =>
    fetchApi<SearchResult[]>(`/courses/${courseSlug}/search?q=${encodeURIComponent(query)}`),

  // Review Mode
  getReviewStatus: () =>
    fetchApi<{ enabled: boolean }>('/review/status'),
  createReviewAnnotation: (data: { page_path: string; page_title?: string; annotation_text: string; annotation_type?: string }) =>
    fetchApi<ReviewAnnotation>('/review/annotations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // AI
  getAIStatus: () =>
    fetchApi<{ available: boolean; model: string | null }>('/ai/status'),
  streamChat: (body: {
    messages: { role: string; content: string; timestamp: string }[];
    course_slug: string;
    module_slug: string;
    lesson_slug: string;
  }, signal?: AbortSignal) =>
    fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    }),
};
