import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import { GlossaryProvider } from './context/GlossaryContext';
import { AIProvider } from './context/AIContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';
import CourseCatalog from './pages/CourseCatalog';
import CourseOverview from './pages/CourseOverview';
import LessonPage from './pages/LessonPage';
import KnowledgeCheckPage from './pages/KnowledgeCheckPage';
import GlossaryFullPage from './pages/GlossaryFullPage';
import CompletionPage from './pages/CompletionPage';
import FeedbackPage from './pages/FeedbackPage';
import SearchPage from './pages/SearchPage';
import ReviewWidget from './components/review/ReviewWidget';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCourses from './pages/admin/AdminCourses';
import AdminLayout from './components/layout/AdminLayout';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <CourseCatalog />
              </ProtectedRoute>
            }
          />

          {/* Course routes */}
          <Route
            path="/courses/:slug"
            element={
              <ProtectedRoute>
                <CourseProvider>
                  <AIProvider>
                    <GlossaryProvider>
                      <AppShell />
                    </GlossaryProvider>
                  </AIProvider>
                </CourseProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<CourseOverview />} />
            <Route
              path="modules/:moduleSlug/lessons/:lessonSlug"
              element={<LessonPage />}
            />
            <Route
              path="modules/:moduleSlug/knowledge-check"
              element={<KnowledgeCheckPage />}
            />
            <Route path="glossary" element={<GlossaryFullPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="completion" element={<CompletionPage />} />
            <Route path="search" element={<SearchPage />} />
          </Route>
          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:id" element={<AdminUserDetail />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="feedback" element={<AdminFeedback />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {import.meta.env.VITE_REVIEW_MODE === 'true' && <ReviewWidget />}
      </AuthProvider>
    </ThemeProvider>
  );
}
