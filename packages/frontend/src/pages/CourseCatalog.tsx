import { useEffect, useState, useRef, useCallback, useMemo, type MouseEvent as ReactMouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Clock,
  Layers,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Play,
  LayoutDashboard,
  Users,
  Settings,
  MessageSquare,
  LogOut,
  CheckCircle,
  Trophy,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/ui/Card';
import { NoiseOverlay, GradientMesh, TopographicBg } from '../components/ui/Backgrounds';
import AdminDashboard from './admin/AdminDashboard';
import AdminUsers from './admin/AdminUsers';
import AdminUserDetail from './admin/AdminUserDetail';
import AdminSettings from './admin/AdminSettings';
import AdminFeedback from './admin/AdminFeedback';
import type { CourseConfig, CourseNavTree } from '@playbook/shared';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Tab = 'courses' | 'dashboard' | 'users' | 'settings' | 'feedback';


/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

/** Simple hash from string to 0..1 range */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return Math.abs(hash % 1000) / 1000;
}

/** Generate a unique gradient based on course slug */
function courseGradient(slug: string): string {
  const h = hashString(slug);
  const hue1 = Math.round(220 + h * 30);        // 220-250 (blue-indigo)
  const hue2 = Math.round(260 + h * 40);        // 260-300 (purple-magenta)
  const angle = Math.round(115 + h * 50);
  return `linear-gradient(${angle}deg, hsl(${hue1}, 75%, 58%) 0%, hsl(${hue2}, 60%, 48%) 100%)`;
}

/** Extract initials from a name string */
function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  Animated counter hook                                              */
/* ------------------------------------------------------------------ */

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || target === 0) return;
    started.current = true;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration]);

  return value;
}

/* ------------------------------------------------------------------ */
/*  Progress ring (SVG)                                                */
/* ------------------------------------------------------------------ */

function ProgressRing({ percent, size = 48, stroke = 4 }: { percent: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-border/40"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        className={percent >= 100 ? 'text-success' : 'text-primary'}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Interactive card with spotlight + tilt                              */
/* ------------------------------------------------------------------ */

function InteractiveCard({
  course,
  navTree,
  isResumable,
}: {
  course: CourseConfig;
  navTree: CourseNavTree | null;
  isResumable: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);

  // Spotlight position
  const spotlightX = useMotionValue(0);
  const spotlightY = useMotionValue(0);
  const spotlightOpacity = useSpring(0, { stiffness: 300, damping: 30 });

  // Tilt
  const rotateX = useSpring(0, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 20 });

  // Smooth shadow on tilt
  const shadowX = useTransform(rotateY, [-8, 8], [8, -8]);
  const shadowY = useTransform(rotateX, [-8, 8], [-8, 8]);
  const boxShadow = useTransform(
    [shadowX, shadowY],
    ([sx, sy]) =>
      `${sx}px ${sy}px 30px rgba(79, 70, 229, 0.10), 0 2px 8px rgba(79, 70, 229, 0.06)`
  );

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent) => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      spotlightX.set(x);
      spotlightY.set(y);

      // Tilt: +-8 degrees
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      rotateY.set(((x - centerX) / centerX) * 8);
      rotateX.set(((centerY - y) / centerY) * 8);
    },
    [spotlightX, spotlightY, rotateX, rotateY]
  );

  const handleMouseEnter = useCallback(() => {
    setHovering(true);
    spotlightOpacity.set(1);
  }, [spotlightOpacity]);

  const handleMouseLeave = useCallback(() => {
    setHovering(false);
    spotlightOpacity.set(0);
    rotateX.set(0);
    rotateY.set(0);
  }, [spotlightOpacity, rotateX, rotateY]);

  // Progress from navTree (has correct total_lessons and completed_lessons)
  const totalLessons = navTree?.total_lessons || 0;
  const completedLessons = navTree?.completed_lessons || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const hasStarted = completedLessons > 0;
  const isCompleted = totalLessons > 0 && completedLessons >= totalLessons;

  return (
    <Link to={`/courses/${course.slug}`} className="block group h-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          perspective: 800,
          rotateX,
          rotateY,
          boxShadow: hovering ? boxShadow : undefined,
          transformStyle: 'preserve-3d',
        }}
        className="h-full"
      >
        <Card
          elevation={1}
          className={`p-0 h-full flex flex-col relative overflow-hidden transition-shadow duration-200 ${
            isResumable
              ? 'ring-2 ring-primary/30 ring-offset-2'
              : isCompleted
                ? 'ring-2 ring-success/30 ring-offset-2'
                : ''
          }`}
        >
          {/* Cursor spotlight overlay */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              opacity: spotlightOpacity,
              background: useTransform(
                [spotlightX, spotlightY],
                ([x, y]) =>
                  `radial-gradient(350px circle at ${x}px ${y}px, rgba(79, 70, 229, 0.08), transparent 70%)`
              ),
            }}
          />

          {/* Gradient header with course title */}
          <div
            className="relative px-5 pt-5 pb-4 rounded-t-card overflow-hidden"
            style={{ background: courseGradient(course.slug) }}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
                {course.modules.length} {course.modules.length === 1 ? 'module' : 'modules'}
              </span>
              <h2
                className="text-lg font-semibold text-white mt-1 tracking-tight leading-snug"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {course.title}
              </h2>
            </div>

            {/* Completed badge */}
            {isCompleted && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-success px-2 py-1 rounded-full shadow-sm">
                <CheckCircle size={12} />
                <span className="text-[10px] font-bold uppercase tracking-wide">Completed</span>
              </div>
            )}
          </div>

          <div className="p-5 flex flex-col flex-1">
            {/* Resume badge */}
            {isResumable && (
              <div className="flex items-center gap-1.5 mb-2">
                <Play size={10} className="text-primary fill-primary" />
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                  Continue learning
                </span>
              </div>
            )}

            {/* Description */}
            <p className="text-sm text-text-secondary leading-relaxed mb-5 line-clamp-3 flex-1">
              {course.description}
            </p>

            {/* Progress bar (if started) */}
            {hasStarted && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-text-secondary">
                    {completedLessons} of {totalLessons} lessons
                  </span>
                  <span className={`text-[11px] font-semibold ${isCompleted ? 'text-success' : 'text-primary'}`}>
                    {progressPercent}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${isCompleted ? 'bg-success' : 'bg-primary'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border/30">
              <div className="flex items-center gap-4 text-xs text-text-secondary">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {formatDuration(course.estimated_duration_minutes)}
                </span>
                <span className="flex items-center gap-1">
                  <Layers size={12} />
                  {course.modules.length} modules
                </span>
              </div>
              <span className="text-xs font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isCompleted ? 'Review' : hasStarted ? 'Continue' : 'Start'}
                <ArrowRight size={12} />
              </span>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Stagger variant with spring                                        */
/* ------------------------------------------------------------------ */

const cardStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardSpring = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
};

/* ------------------------------------------------------------------ */
/*  Admin tab definitions                                              */
/* ------------------------------------------------------------------ */

const adminTabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

/* ------------------------------------------------------------------ */
/*  Admin Tab Bar                                                       */
/* ------------------------------------------------------------------ */

const allTabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'courses', label: 'Courses', icon: BookOpen },
  ...adminTabs,
];

function AdminTabBar({
  activeTab,
  setActiveTab,
}: {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
}) {
  return (
    <nav className="sticky top-14 z-30 bg-primary border-b border-primary">
      <div className="max-w-6xl mx-auto px-6 flex overflow-x-auto -mb-px items-center">
        {allTabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <div key={tab.id} className="flex items-center">
              {index > 0 && <div className="w-px h-5 bg-white/20 mx-0.5" />}
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-b-[3px] border-white text-white font-semibold'
                    : 'border-b-[3px] border-transparent text-white/70 hover:text-white hover:border-white/30'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                           */
/* ------------------------------------------------------------------ */

export default function CourseCatalog() {
  const [courses, setCourses] = useState<CourseConfig[] | null>(null);
  const [navMap, setNavMap] = useState<Record<string, CourseNavTree>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('courses');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  const isAdmin = user?.role === 'admin' || user?.role === 'dev_admin';

  useEffect(() => {
    api.getCourses()
      .then((data) => {
        setCourses(data);
        // Fetch navTree (includes correct completed/total counts) for each course
        return Promise.all(
          data.map((c) =>
            api.getCourse(c.slug)
              .then((r) => [c.slug, r.navTree] as const)
              .catch(() => [c.slug, null] as const)
          )
        );
      })
      .then((results) => {
        const map: Record<string, CourseNavTree> = {};
        for (const [slug, tree] of results) {
          if (tree) map[slug] = tree;
        }
        setNavMap(map);
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  // Aggregate progress across all courses
  const progress = useMemo(() => {
    const trees = Object.values(navMap);
    const totalLessons = trees.reduce((s, t) => s + t.total_lessons, 0);
    const completedLessons = trees.reduce((s, t) => s + t.completed_lessons, 0);
    const completedCourses = trees.filter((t) => t.total_lessons > 0 && t.completed_lessons >= t.total_lessons).length;
    const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    return { totalLessons, completedLessons, completedCourses, percent };
  }, [navMap]);

  // Animated counters
  const courseCount = useCountUp(courses?.length || 0);
  const totalMinutes = courses?.reduce((s, c) => s + c.estimated_duration_minutes, 0) || 0;
  const totalHours = useCountUp(Math.floor(totalMinutes / 60));
  const totalMins = useCountUp(totalMinutes % 60);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <BookOpen size={48} className="text-text-secondary mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-text-primary">No Courses Available</h1>
          <p className="text-sm text-text-secondary mt-2">Check back later for new content.</p>
        </div>
      </div>
    );
  }

  const firstName = user?.name?.split(' ')[0];
  const initials = user?.name ? getInitials(user.name) : '?';

  // Find the most recent in-progress course for "Continue learning" spotlight
  const resumableCourse = courses.find((c) => {
    const nav = navMap[c.slug];
    return nav && nav.completed_lessons > 0 && nav.completed_lessons < nav.total_lessons;
  });

  // Sort: in-progress first, then completed, then not started
  const sortedCourses = [...courses].sort((a, b) => {
    const na = navMap[a.slug];
    const nb = navMap[b.slug];
    const order = (n: CourseNavTree | undefined) => {
      if (!n || n.completed_lessons === 0) return 2;       // not started
      if (n.completed_lessons < n.total_lessons) return 0;  // in progress
      return 1;                                              // completed
    };
    return order(na) - order(nb);
  });

  const durationStr =
    totalHours > 0 ? `${totalHours}h ${totalMins}m` : `${totalMins}m`;

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      {/* Noise texture */}
      <NoiseOverlay />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-xl border-b border-white/50 shadow-elevation-1 px-6 h-14 flex items-center justify-between">
        <img
          src="/assets/Protective_Life_logo.svg.png"
          alt={theme?.organization_name || 'Protective Life'}
          className="h-7"
        />
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                <span className="text-xs font-bold text-primary leading-none">{initials}</span>
              </div>
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
      </header>

      {/* Tab bar */}
      {isAdmin ? (
        <AdminTabBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      ) : (
        /* Thin accent line for non-admins — visual separation */
        <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      )}

      {/* Content area */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'courses' ? (
          <div className="flex flex-col flex-1">
            {/* Hero */}
            <section className="relative overflow-hidden">
              {/* Animated gradient mesh */}
              <GradientMesh />

              <div className="relative max-w-6xl mx-auto px-6 pt-14 pb-12">
                <div className="flex items-center justify-between gap-8">
                  {/* Left: text content */}
                  <motion.div
                    className="flex-1 min-w-0"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {firstName && (
                      <p className="text-sm font-medium text-primary mb-2 flex items-center gap-1.5">
                        <Sparkles size={14} />
                        Welcome back, {firstName}
                      </p>
                    )}
                    <h1
                      className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight mb-3"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      Your Course Catalog
                    </h1>
                    <p className="text-text-secondary max-w-xl leading-relaxed">
                      Pick up where you left off or start something new. Each course is designed to build
                      practical skills you can apply immediately.
                    </p>

                    {/* Animated stats row */}
                    <motion.div
                      className="flex items-center gap-6 mt-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <GraduationCap size={16} className="text-primary" />
                        <span>
                          <span className="font-semibold text-text-primary tabular-nums">{courseCount}</span>{' '}
                          {courses.length === 1 ? 'course' : 'courses'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Clock size={16} className="text-primary" />
                        <span>
                          <span className="font-semibold text-text-primary tabular-nums">{durationStr}</span>{' '}
                          of content
                        </span>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Right: progress ring */}
                  {progress.completedLessons > 0 && (
                    <motion.div
                      className="hidden sm:flex flex-col items-center gap-2 shrink-0"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3, duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
                    >
                      <div className="relative">
                        <ProgressRing percent={progress.percent} size={120} stroke={8} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-2xl font-bold tabular-nums leading-none ${progress.percent >= 100 ? 'text-success' : 'text-primary'}`}>
                            {progress.percent}%
                          </span>
                          <span className="text-[10px] text-text-secondary mt-1">complete</span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-text-secondary">
                        {progress.completedLessons}/{progress.totalLessons} lessons
                      </span>
                      {progress.completedCourses > 0 && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-success">
                          <Trophy size={12} />
                          {progress.completedCourses} {progress.completedCourses === 1 ? 'course' : 'courses'} done
                        </span>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </section>

            {/* Course Grid */}
            <section className="relative pb-20 flex-1">
              {/* Topographic background */}
              <TopographicBg />
              <div className="max-w-6xl mx-auto px-6 pt-8">
                <motion.div
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  variants={cardStagger}
                  initial="hidden"
                  animate="visible"
                >
                  {sortedCourses.map((course) => (
                    <motion.div key={course.slug} variants={cardSpring}>
                      <InteractiveCard
                        course={course}
                        navTree={navMap[course.slug] || null}
                        isResumable={course.slug === resumableCourse?.slug}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </section>
          </div>
        ) : activeTab === 'dashboard' ? (
          <AdminDashboard />
        ) : activeTab === 'users' ? (
          <>
            <AdminUsers onUserClick={setSelectedUserId} />
            <AnimatePresence>
              {selectedUserId && (
                <AdminUserDetail
                  userId={selectedUserId}
                  onClose={() => setSelectedUserId(null)}
                />
              )}
            </AnimatePresence>
          </>
        ) : activeTab === 'settings' ? (
          <AdminSettings />
        ) : activeTab === 'feedback' ? (
          <AdminFeedback />
        ) : null}
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-white/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-secondary">
          <span>{theme?.organization_name || 'Protective Life'} &copy; {new Date().getFullYear()}</span>
          <span>Practitioner&apos;s Playbook</span>
        </div>
      </footer>
    </div>
  );
}
