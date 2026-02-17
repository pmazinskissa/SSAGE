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
  DashboardMetrics,
  UserWithProgress,
  UserDetail,
  ContentFeedback,
  SearchResult,
  UserWithModuleAnalytics,
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
    fetchApi<{ courseCompleted: boolean }>(`/progress/${courseSlug}/modules/${moduleSlug}/check`, {
      method: 'POST',
      body: JSON.stringify(submission),
    }),

  // Admin — Dashboard
  getAdminDashboard: (courseSlug?: string) =>
    fetchApi<DashboardMetrics>(`/admin/dashboard${courseSlug ? `?course=${courseSlug}` : ''}`),

  // Admin — Users
  getAdminUsers: () => fetchApi<UserWithProgress[]>('/admin/users'),
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
  exportUsersCSV: async (courseSlug?: string) => {
    const qs = courseSlug ? `?course=${encodeURIComponent(courseSlug)}` : '';
    const res = await fetch(`${BASE_URL}/admin/users/export${qs}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to export CSV');
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  },
  preEnrollUsers: (entries: { name: string; email: string; role: 'learner' | 'admin' | 'dev_admin' }[]) =>
    fetchApi<{ added: number; skipped: number }>('/admin/users/pre-enroll', {
      method: 'POST',
      body: JSON.stringify({ entries }),
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
  submitFeedback: (data: { course_slug: string; feedback_text: string; submitter_name?: string }) =>
    fetchApi<ContentFeedback>('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Search
  searchContent: (courseSlug: string, query: string) =>
    fetchApi<SearchResult[]>(`/courses/${courseSlug}/search?q=${encodeURIComponent(query)}`),

  // AI
  getAIStatus: () =>
    fetchApi<{ available: boolean; model: string | null }>('/ai/status'),
  streamChat: (body: {
    messages: { role: string; content: string; timestamp: string }[];
    course_slug: string;
    module_slug: string;
    lesson_slug: string;
  }) =>
    fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
};
