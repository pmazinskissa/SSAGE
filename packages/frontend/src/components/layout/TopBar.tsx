import { Home, Menu, LogOut, ZoomIn, ZoomOut } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useCourse } from '../../context/CourseContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useFontSize } from '../../context/FontSizeContext';

interface TopBarProps {
  onMobileMenuToggle: () => void;
}

export default function TopBar({ onMobileMenuToggle }: TopBarProps) {
  const { slug } = useParams<{ slug: string }>();
  const { course, navTree } = useCourse();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const { canZoomIn, canZoomOut, zoomIn, zoomOut } = useFontSize();

  const completedPercent = navTree
    ? Math.round((navTree.completed_lessons / Math.max(navTree.total_lessons, 1)) * 100)
    : 0;

  return (
    <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-white/50 shadow-elevation-1">
      <div className="relative flex items-center h-14 px-4 gap-3">
        {/* Left group */}
        <Link
          to="/"
          className="p-2 rounded-md hover:bg-surface transition-colors"
          aria-label="All Courses"
          title="All Courses"
        >
          <Home size={20} className="text-primary" />
        </Link>

        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-md hover:bg-surface transition-colors"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:block shrink-0">
          <img
            src="/assets/Protective_Life_logo.svg.png"
            alt={theme?.organization_name || 'Protective Life'}
            className="h-8"
          />
        </div>

        {/* Centered course title */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-base font-semibold text-primary truncate max-w-[50%]">
            {course?.title || 'Loading...'}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right group */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={zoomOut}
            disabled={!canZoomOut}
            className="p-1.5 rounded-md hover:bg-surface transition-colors text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Decrease text size"
            title="Decrease text size"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={zoomIn}
            disabled={!canZoomIn}
            className="p-1.5 rounded-md hover:bg-surface transition-colors text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Increase text size"
            title="Increase text size"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-text-secondary">
          <span>{completedPercent}% complete</span>
        </div>

        {user && (
          <div className="flex items-center gap-2 ml-2">
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
              <span className="text-xs font-bold text-primary leading-none">
                {user.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-md hover:bg-surface transition-colors text-text-secondary hover:text-text-primary"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-surface/50">
        <div
          className="h-full bg-primary transition-all duration-600 ease-in-out"
          style={{ width: `${completedPercent}%` }}
        />
      </div>
    </header>
  );
}
