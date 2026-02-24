import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, TrendingUp, LayoutDashboard, Search, Brain, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../lib/api';
import Card from '../../components/ui/Card';
import { stagger, fadeInUp } from '../../lib/animations';
import type { DashboardMetrics, UserWithProgress } from '@playbook/shared';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User autocomplete state (multi-select)
  const [allUsers, setAllUsers] = useState<UserWithProgress[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load all users on mount
  useEffect(() => {
    api.getAdminUsers().then(setAllUsers).catch(() => {});
  }, []);

  // Load dashboard metrics — re-fetch when selectedUserIds changes
  useEffect(() => {
    setLoading(true);
    api.getAdminDashboard(selectedUserIds.length > 0 ? selectedUserIds : undefined)
      .then(setMetrics)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedUserIds]);

  // Click-outside to close dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filtered users for dropdown (exclude already-selected)
  const lower = userSearch.toLowerCase();
  const selectedSet = new Set(selectedUserIds);
  const filteredUsers = (lower
    ? allUsers.filter((u) => !selectedSet.has(u.id) && (u.name.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower)))
    : allUsers.filter((u) => !selectedSet.has(u.id))
  ).slice(0, 8);

  const selectedUsers = selectedUserIds.map((id) => allUsers.find((u) => u.id === id)).filter(Boolean) as UserWithProgress[];

  const addUser = (id: string) => {
    setSelectedUserIds((prev) => [...prev, id]);
    setUserSearch('');
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const removeUser = (id: string) => {
    setSelectedUserIds((prev) => prev.filter((uid) => uid !== id));
  };

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
    {
      label: 'Avg KC Score',
      value: `${metrics.avg_kc_score}%`,
      icon: Brain,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  const statusTotal = metrics.completed + metrics.in_progress + metrics.not_started;
  const statusSegments = [
    { label: 'Completed', count: metrics.completed, color: 'bg-green-500' },
    { label: 'In Progress', count: metrics.in_progress, color: 'bg-blue-500' },
    { label: 'Not Started', count: metrics.not_started, color: 'bg-gray-300' },
  ];

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
      {/* User autocomplete filter (multi-select) */}
      <div className="flex items-center gap-3 mb-6">
        <div className="sm:ml-auto relative" ref={dropdownRef}>
          <div
            className="flex flex-wrap items-center gap-1.5 bg-white border border-border shadow-sm rounded-lg px-2 py-1.5 min-w-[16rem] max-w-md cursor-text focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all"
            onClick={() => inputRef.current?.focus()}
          >
            <Search size={14} className="text-text-secondary pointer-events-none shrink-0" />
            {selectedUsers.map((u) => (
              <span
                key={u.id}
                className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full pl-2.5 pr-1 py-0.5 text-xs font-medium"
              >
                {u.name || u.email}
                <button
                  onClick={(e) => { e.stopPropagation(); removeUser(u.id); }}
                  className="p-0.5 rounded-full hover:bg-primary/20 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              type="text"
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !userSearch && selectedUserIds.length > 0) {
                  removeUser(selectedUserIds[selectedUserIds.length - 1]);
                }
              }}
              placeholder={selectedUsers.length === 0 ? 'Filter by user...' : ''}
              className="flex-1 min-w-[80px] bg-transparent text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none py-0.5"
            />
            {selectedUserIds.length > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedUserIds([]); setUserSearch(''); }}
                className="p-0.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface transition-colors shrink-0"
                title="Clear all"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {showDropdown && filteredUsers.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
              {filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => addUser(u.id)}
                  className="w-full text-left px-3 py-2 hover:bg-surface/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  <p className="text-sm font-medium text-text-primary truncate">{u.name || '(unnamed)'}</p>
                  <p className="text-xs text-text-secondary truncate">{u.email}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Metric cards */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4"
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
          ) : (() => {
            const lower = userSearch.toLowerCase();
            const filtered = lower
              ? userAnalytics.filter((u) => u.name.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower))
              : userAnalytics;
            if (filtered.length === 0) return (
              <Card className="p-8 text-center">
                <p className="text-sm text-text-secondary">No user data found.</p>
              </Card>
            );
            return (
              <div className="space-y-2">
                {filtered.map((user) => {
                  const isExpanded = expandedUserId === user.id;
                  const detail = expandedUserDetail[user.id];
                  const isDetailLoading = userDetailLoading === user.id;

                  return (
                    <Card key={user.id} className="overflow-hidden">
                      <button
                        onClick={() => toggleUserExpand(user.id)}
                        className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-surface/30 transition-colors"
                      >
                        <StatusIcon status={user.status} size={16} />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-text-primary">{user.name}</span>
                          <p className="text-xs text-text-secondary truncate">{user.email}</p>
                        </div>
                        {user.total_time_seconds > 0 && (() => {
                          const active = user.active_time_seconds;
                          const total = user.total_time_seconds;
                          const showBoth = active != null && active < total * 0.9;
                          return (
                            <span className="text-xs text-text-secondary">
                              {showBoth ? `${formatTime(active!)} active / ${formatTime(total)}` : formatTime(total)}
                            </span>
                          );
                        })()}
                        <ChevronDown
                          size={16}
                          className={`text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="border-t border-border/50 px-3.5 pb-3.5">
                          {isDetailLoading ? (
                            <div className="flex items-center gap-2 py-4 pl-7 text-xs text-text-secondary">
                              <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              Loading progress...
                            </div>
                          ) : detail ? (() => {
                            const lessonLookup = new Map<string, Map<string, Map<string, LessonProgressEntry>>>();
                            for (const lp of detail.lesson_progress) {
                              const cs = lp.course_slug || '';
                              if (!lessonLookup.has(cs)) lessonLookup.set(cs, new Map());
                              const modMap = lessonLookup.get(cs)!;
                              if (!modMap.has(lp.module_slug)) modMap.set(lp.module_slug, new Map());
                              modMap.get(lp.module_slug)!.set(lp.lesson_slug, lp);
                            }
                            const kcLookup = new Map<string, { score: number }>();
                            for (const kc of detail.knowledge_check_scores) {
                              kcLookup.set(`${kc.course_slug || ''}:${kc.module_slug}`, kc);
                            }
                            const enrolledSlugs = new Set((detail.enrollments || []).map(e => e.course_slug));
                            const enrolledCourses = courses.filter(c => enrolledSlugs.has(c.slug));

                            if (enrolledCourses.length === 0) {
                              return <p className="text-xs text-text-secondary py-4 pl-7">No courses enrolled.</p>;
                            }

                            return (
                              <div className="mt-2 space-y-1">
                                {enrolledCourses.map((course) => {
                                  const courseKey = `${user.id}:${course.slug}`;
                                  const isCourseExpanded = expandedUserCourses.has(courseKey);
                                  const tree = userNavTrees[course.slug];
                                  const courseLessons = lessonLookup.get(course.slug);
                                  const cp = detail.course_progress.find(p => p.course_slug === course.slug);
                                  const courseStatus = cp?.status || 'not_started';

                                  return (
                                    <div key={course.slug} className="border border-border/40 rounded-xl bg-white/50 overflow-hidden">
                                      <button
                                        onClick={() => toggleUserCourse(courseKey, course.slug)}
                                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-surface/30 transition-colors"
                                      >
                                        <StatusIcon status={courseStatus} size={16} />
                                        <span className="flex-1 text-sm font-semibold text-text-primary truncate">{course.title}</span>
                                        <ChevronDown
                                          size={14}
                                          className={`text-text-secondary transition-transform ${isCourseExpanded ? 'rotate-180' : ''}`}
                                        />
                                      </button>

                                      {isCourseExpanded && (
                                        <div className="px-3 pb-3 border-t border-border/30">
                                          {!tree ? (
                                            <div className="flex items-center gap-2 py-3 pl-7 text-xs text-text-secondary">
                                              <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                              Loading modules...
                                            </div>
                                          ) : (
                                            <div className="mt-2 space-y-1">
                                              {tree.modules.map((mod) => {
                                                const modKey = `${user.id}:${course.slug}:${mod.slug}`;
                                                const isModExpanded = expandedUserModules.has(modKey);
                                                const modLessons = courseLessons?.get(mod.slug);
                                                const completedCount = modLessons
                                                  ? Array.from(modLessons.values()).filter(l => l.status === 'completed').length
                                                  : 0;
                                                const totalCount = mod.lessons.length;
                                                const modStatus = completedCount >= totalCount && totalCount > 0
                                                  ? 'completed'
                                                  : completedCount > 0
                                                    ? 'in_progress'
                                                    : 'not_started';
                                                const kc = kcLookup.get(`${course.slug}:${mod.slug}`);

                                                return (
                                                  <div key={mod.slug}>
                                                    <button
                                                      onClick={() => toggleUserModule(modKey)}
                                                      className="w-full flex items-center gap-2.5 py-2 pl-7 pr-2 text-left hover:bg-surface/30 rounded-md transition-colors"
                                                    >
                                                      <StatusIcon status={modStatus} />
                                                      <span className="flex-1 text-xs font-medium text-text-primary truncate">{mod.title}</span>
                                                      <span className={`text-[11px] font-medium ${
                                                        modStatus === 'completed' ? 'text-success' : modStatus === 'in_progress' ? 'text-primary' : 'text-text-secondary'
                                                      }`}>
                                                        {modStatus === 'completed'
                                                          ? 'complete'
                                                          : modStatus === 'in_progress'
                                                            ? `in progress (${completedCount}/${totalCount})`
                                                            : `0/${totalCount}`}
                                                      </span>
                                                      {kc && (
                                                        <span className="text-[10px] font-medium text-primary ml-1">KC: {kc.score}%</span>
                                                      )}
                                                      <ChevronDown
                                                        size={12}
                                                        className={`text-text-secondary/50 transition-transform ${isModExpanded ? 'rotate-180' : ''}`}
                                                      />
                                                    </button>

                                                    {isModExpanded && (
                                                      <div className="pl-12 pr-2 pb-1 space-y-0.5">
                                                        {mod.lessons.map((lesson) => {
                                                          const lp = modLessons?.get(lesson.slug);
                                                          const lessonStatus = lp?.status || 'not_started';
                                                          const total = lp?.time_spent_seconds || 0;
                                                          const active = lp?.active_time_seconds;
                                                          const showBothTimes = active != null && total > 0 && active < total * 0.9;
                                                          return (
                                                            <div key={lesson.slug} className="flex items-center gap-2 py-1.5 text-xs">
                                                              <StatusIcon status={lessonStatus} size={12} />
                                                              <span className="flex-1 text-text-primary truncate">{lesson.title}</span>
                                                              {lp?.max_scroll_depth != null && (
                                                                <div
                                                                  className="w-12 h-1.5 bg-surface rounded-full overflow-hidden flex-shrink-0"
                                                                  title={`Scrolled ${lp.max_scroll_depth}% of page`}
                                                                >
                                                                  <div className="h-full bg-primary/50 rounded-full" style={{ width: `${lp.max_scroll_depth}%` }} />
                                                                </div>
                                                              )}
                                                              {total > 0 ? (
                                                                <span className="text-text-secondary">
                                                                  {showBothTimes
                                                                    ? `${Math.round(active! / 60)}m active / ${Math.round(total / 60)}m`
                                                                    : `${Math.round(total / 60)}m`}
                                                                </span>
                                                              ) : null}
                                                              {lp?.completed_at && (
                                                                <span className="text-text-secondary">{new Date(lp.completed_at).toLocaleDateString()}</span>
                                                              )}
                                                            </div>
                                                          );
                                                        })}
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })() : (
                            <p className="text-xs text-text-secondary py-4 pl-7">Failed to load user details.</p>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            );
          })()}
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
    </div>
    </div>
    </>
  );
}
