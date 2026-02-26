import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import { GlossaryProvider } from './context/GlossaryContext';
import { AIProvider } from './context/AIContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import ErrorBoundary from './components/ErrorBoundary';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const CourseCatalog = lazy(() => import('./pages/CourseCatalog'));
const CourseOverview = lazy(() => import('./pages/CourseOverview'));
const LessonPage = lazy(() => import('./pages/LessonPage'));
const KnowledgeCheckPage = lazy(() => import('./pages/KnowledgeCheckPage'));
const GlossaryFullPage = lazy(() => import('./pages/GlossaryFullPage'));
const CompletionPage = lazy(() => import('./pages/CompletionPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ReviewWidget = lazy(() => import('./components/review/ReviewWidget'));

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-pulse text-text-secondary">Loading...</div></div>}>
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        {import.meta.env.VITE_REVIEW_MODE === 'true' && (
          <Suspense fallback={null}>
            <ReviewWidget />
          </Suspense>
        )}
      </AuthProvider>
    </ThemeProvider>
  );
}
