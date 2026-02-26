import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import { useCourse } from '../../context/CourseContext';
import { useAI } from '../../context/AIContext';
import AIChatPanel from '../ai/AIChatPanel';
import { NoiseOverlay } from '../ui/Backgrounds';
import Footer from './Footer';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { loading, error } = useCourse();
  const { available: aiAvailable } = useAI();

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-error text-lg font-semibold">Failed to load course</p>
          <p className="text-text-secondary mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <NoiseOverlay />
      <TopBar onMobileMenuToggle={() => setSidebarOpen((prev) => !prev)} />
      <div className="flex flex-1">
        <Sidebar
          open={sidebarOpen}
          collapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
          onCollapseToggle={() => setSidebarCollapsed((prev) => !prev)}
        />
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-pulse text-text-secondary">Loading course...</div>
              </div>
            ) : (
              <Outlet />
            )}
          </div>
          <Footer />
        </main>
      </div>
      {aiAvailable && <AIChatPanel />}
    </div>
  );
}
