import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, TrendingUp, LayoutDashboard, ChevronDown, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../lib/api';
import Card from '../../components/ui/Card';
import { stagger, fadeInUp } from '../../lib/animations';
import type { DashboardMetrics, CourseConfig, UserWithModuleAnalytics } from '@playbook/shared';

type TabView = 'course' | 'users';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseConfig[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [activeTab, setActiveTab] = useState<TabView>('course');

  // User Analytics state
  const [userAnalytics, setUserAnalytics] = useState<UserWithModuleAnalytics[]>([]);
  const [userAnalyticsLoading, setUserAnalyticsLoading] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  useEffect(() => {
    api.getCourses().then(setCourses).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api.getAdminDashboard(selectedCourse || undefined)
      .then(setMetrics)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedCourse]);

  // Load user analytics when switching to users tab with a course selected
  useEffect(() => {
    if (activeTab === 'users' && selectedCourse) {
      setUserAnalyticsLoading(true);
      api.getAdminUserAnalytics(selectedCourse)
        .then(setUserAnalytics)
        .catch(() => setUserAnalytics([]))
        .finally(() => setUserAnalyticsLoading(false));
    }
  }, [activeTab, selectedCourse]);

  if (loading && !metrics) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-surface rounded w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-surface rounded-card" />
            ))}
          </div>
          <div className="h-72 bg-surface rounded-card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center">
        <p className="text-error font-semibold">Failed to load dashboard</p>
        <p className="text-text-secondary mt-2">{error}</p>
      </div>
    );
  }

  if (!metrics || metrics.total_users === 0) {
    return (
      <>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute w-[500px] h-[500px] rounded-full opacity-30 blur-[100px] animate-[meshFloat1_12s_ease-in-out_infinite]" style={{ background: 'var(--color-primary)', top: '-10%', left: '-5%' }} />
            <div className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-[100px] animate-[meshFloat2_14s_ease-in-out_infinite]" style={{ background: 'var(--color-primary-hover)', top: '20%', right: '-8%' }} />
          </div>
          <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-8">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-2 text-primary mb-2">
                <LayoutDashboard size={16} />
                <span className="text-sm font-medium">Analytics Overview</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                Dashboard
              </h2>
              <p className="text-text-secondary mt-2 max-w-xl">Track enrollment, completion rates, and learner progress at a glance.</p>
            </motion.div>
          </div>
        </section>
        <div className="relative flex-1">
          <div className="absolute inset-0 -z-10 bg-surface/30" />
          <div className="absolute inset-0 -z-10 opacity-[0.07]" style={{ backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 40px, var(--color-primary) 40px, var(--color-primary) 41px, transparent 41px, transparent 80px), repeating-radial-gradient(circle at 30% 70%, transparent 0, transparent 60px, var(--color-primary) 60px, var(--color-primary) 61px, transparent 61px, transparent 120px), repeating-radial-gradient(circle at 70% 30%, transparent 0, transparent 50px, var(--color-primary) 50px, var(--color-primary) 51px, transparent 51px, transparent 100px)' }} />
          <div className="p-6 max-w-6xl mx-auto">
            <Card className="p-8 text-center">
              <Users size={48} className="mx-auto text-text-secondary/40 mb-4" />
              <p className="text-lg font-semibold text-text-primary">No users enrolled yet</p>
              <p className="text-text-secondary mt-2">
                Pre-enroll users from the Users tab to get started, or share the course link.
              </p>
            </Card>
          </div>
        </div>
      </>
    );
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const cards = [
    {
      label: 'Total Enrolled',
      value: metrics.total_users,
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary-light',
    },
    {
      label: 'Avg Completion',
      value: `${metrics.avg_completion_pct}%`,
      icon: TrendingUp,
      color: 'text-accent',
      bg: 'bg-orange-50',
    },
    {
      label: 'Avg Time to Complete',
      value: formatTime(metrics.avg_time_to_completion_seconds),
      icon: Clock,
      color: 'text-secondary',
      bg: 'bg-blue-50',
    },
  ];

  const statusTotal = metrics.completed + metrics.in_progress + metrics.not_started;
  const statusSegments = [
    { label: 'Completed', count: metrics.completed, color: 'bg-green-500' },
    { label: 'In Progress', count: metrics.in_progress, color: 'bg-blue-500' },
    { label: 'Not Started', count: metrics.not_started, color: 'bg-gray-300' },
  ];

  const statusBadge = (status: string) => {
    const classes: Record<string, string> = {
      completed: 'bg-green-100 text-green-700',
      in_progress: 'bg-blue-100 text-blue-700',
      not_started: 'bg-gray-100 text-gray-600',
    };
    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${classes[status] || classes.not_started}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute w-[500px] h-[500px] rounded-full opacity-30 blur-[100px] animate-[meshFloat1_12s_ease-in-out_infinite]" style={{ background: 'var(--color-primary)', top: '-10%', left: '-5%' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-[100px] animate-[meshFloat2_14s_ease-in-out_infinite]" style={{ background: 'var(--color-primary-hover)', top: '20%', right: '-8%' }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-8">
          <div className="flex items-start sm:items-center justify-between gap-4">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-2 text-primary mb-2">
                <LayoutDashboard size={16} />
                <span className="text-sm font-medium">Analytics Overview</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                Dashboard
              </h2>
              <p className="text-text-secondary mt-2 max-w-xl">Track enrollment, completion rates, and learner progress at a glance.</p>
            </motion.div>
            {courses.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="shrink-0">
                <div className="relative">
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="appearance-none bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm rounded-lg px-4 py-2.5 pr-9 text-sm font-medium text-text-primary hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="">All Courses</option>
                    {courses.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.title}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

    <div className="relative flex-1">
      <div className="absolute inset-0 -z-10 bg-surface/30" />
      <div className="absolute inset-0 -z-10 opacity-[0.07]" style={{ backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 40px, var(--color-primary) 40px, var(--color-primary) 41px, transparent 41px, transparent 80px), repeating-radial-gradient(circle at 30% 70%, transparent 0, transparent 60px, var(--color-primary) 60px, var(--color-primary) 61px, transparent 61px, transparent 120px), repeating-radial-gradient(circle at 70% 30%, transparent 0, transparent 50px, var(--color-primary) 50px, var(--color-primary) 51px, transparent 51px, transparent 100px)' }} />
    <div className="p-6 max-w-6xl mx-auto">
      {/* Tab Switcher */}
      <div className="flex gap-1 mb-6 bg-surface rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('course')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'course' ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Course Analytics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'users' ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          User Analytics
        </button>
      </div>

      {activeTab === 'course' ? (
        <>
          {/* Metric cards */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4"
          >
            {cards.map((card) => (
              <motion.div key={card.label} variants={fadeInUp}>
                <Card className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                        {card.label}
                      </p>
                      <p className="text-2xl font-bold text-text-primary mt-1">{card.value}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${card.bg}`}>
                      <card.icon size={20} className={card.color} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Status breakdown bar */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-8">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Status Breakdown</p>
                <div className="flex gap-3">
                  {statusSegments.map((s) => (
                    <span key={s.label} className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                      {s.label}: <strong className="text-text-primary">{s.count}</strong>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex h-6 rounded-full overflow-hidden bg-gray-100">
                {statusSegments.map((s) => {
                  const pct = statusTotal > 0 ? (s.count / statusTotal) * 100 : 0;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={s.label}
                      className={`${s.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                      title={`${s.label}: ${s.count} (${Math.round(pct)}%)`}
                    />
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Module Completion Funnel */}
          {metrics.module_funnel.length > 0 && (
            <motion.div variants={fadeInUp} initial="hidden" animate="visible">
              <Card className="p-6">
                <h3 className="text-sm font-semibold text-text-primary mb-4">Module Completion Funnel</h3>
                <ResponsiveContainer width="100%" height={Math.max(200, metrics.module_funnel.length * 50)}>
                  <BarChart
                    data={metrics.module_funnel}
                    layout="vertical"
                    margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <YAxis
                      type="category"
                      dataKey="module_title"
                      width={180}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip formatter={(value: number) => [`${value}%`, 'Completion']} />
                    <Bar
                      dataKey="completion_pct"
                      fill="var(--color-primary, #2563eb)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          )}
        </>
      ) : (
        /* User Analytics Tab */
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          {!selectedCourse ? (
            <Card className="p-8 text-center">
              <Users size={36} className="mx-auto text-text-secondary/40 mb-3" />
              <p className="text-sm font-semibold text-text-primary">Select a course</p>
              <p className="text-xs text-text-secondary mt-1">
                Choose a course from the dropdown above to view per-user module progress.
              </p>
            </Card>
          ) : userAnalyticsLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-surface rounded" />
              ))}
            </div>
          ) : userAnalytics.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-text-secondary">No user data found for this course.</p>
            </Card>
          ) : (
            <Card className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide py-3 px-3 w-8" />
                    <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide py-3 px-3">Name</th>
                    <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide py-3 px-3">Email</th>
                    <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide py-3 px-3">Status</th>
                    <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide py-3 px-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {userAnalytics.map((user) => {
                    const isExpanded = expandedUserId === user.id;
                    return (
                      <UserAnalyticsRow
                        key={user.id}
                        user={user}
                        isExpanded={isExpanded}
                        onToggle={() => setExpandedUserId(isExpanded ? null : user.id)}
                        formatTime={formatTime}
                        statusBadge={statusBadge}
                      />
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}
        </motion.div>
      )}
    </div>
    </div>
    </>
  );
}

function UserAnalyticsRow({
  user,
  isExpanded,
  onToggle,
  formatTime,
  statusBadge,
}: {
  user: UserWithModuleAnalytics;
  isExpanded: boolean;
  onToggle: () => void;
  formatTime: (s: number) => string;
  statusBadge: (s: string) => JSX.Element;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        className="border-b border-border/50 hover:bg-surface/50 cursor-pointer transition-colors"
      >
        <td className="py-3 px-3">
          <ChevronRight
            size={14}
            className={`text-text-secondary transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        </td>
        <td className="py-3 px-3 font-medium text-text-primary">{user.name}</td>
        <td className="py-3 px-3 text-text-secondary">{user.email}</td>
        <td className="py-3 px-3">{statusBadge(user.status)}</td>
        <td className="py-3 px-3 text-text-secondary text-xs">
          {user.total_time_seconds > 0 ? formatTime(user.total_time_seconds) : '—'}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={5} className="p-0">
            <div className="bg-surface/30 px-6 py-4 border-b border-border/50">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-text-secondary">
                    <th className="text-left py-1.5 font-medium uppercase tracking-wide">Module</th>
                    <th className="text-left py-1.5 font-medium uppercase tracking-wide">Lessons</th>
                    <th className="text-left py-1.5 font-medium uppercase tracking-wide">Time</th>
                    <th className="text-left py-1.5 font-medium uppercase tracking-wide">KC Score</th>
                  </tr>
                </thead>
                <tbody>
                  {user.modules.map((mod) => (
                    <tr key={mod.module_slug} className="border-t border-border/30">
                      <td className="py-2 text-text-primary capitalize">
                        {mod.module_title}
                      </td>
                      <td className="py-2 text-text-secondary">
                        {mod.lessons_completed}/{mod.total_lessons}
                      </td>
                      <td className="py-2 text-text-secondary">
                        {mod.time_spent_seconds > 0 ? formatTime(mod.time_spent_seconds) : '—'}
                      </td>
                      <td className="py-2">
                        {mod.kc_score !== null ? (
                          <span className={`font-medium ${mod.kc_score >= 80 ? 'text-success' : mod.kc_score >= 60 ? 'text-warning' : 'text-error'}`}>
                            {mod.kc_score}%
                          </span>
                        ) : (
                          <span className="text-text-secondary">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
