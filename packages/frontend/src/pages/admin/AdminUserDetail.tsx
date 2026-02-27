import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserX, UserCheck, Trash2, ChevronDown, CheckCircle2, Circle, Disc, BookOpen, BarChart3, Users as UsersIcon, Pencil } from 'lucide-react';
import { api } from '../../lib/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import type { UserDetail, CourseConfig, CourseEnrollment, CourseNavTree, LessonProgressEntry } from '@playbook/shared';

interface AdminUserDetailProps {
  userId?: string;
  onClose?: () => void;
}

export default function AdminUserDetail({ userId: userIdProp, onClose: onCloseProp }: AdminUserDetailProps) {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = userIdProp ?? paramId ?? '';
  const onClose = onCloseProp ?? (() => navigate('/admin/users'));
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'role' | null>(null);
  const [pendingRole, setPendingRole] = useState<'learner' | 'admin' | 'dev_admin'>('learner');
  const [courses, setCourses] = useState<CourseConfig[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [enrollLoading, setEnrollLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'enrollment' | 'progress'>('enrollment');
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Progress tab state: expanded courses and modules, fetched nav trees
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [navTrees, setNavTrees] = useState<Record<string, CourseNavTree>>({});

  useEffect(() => {
    setLoading(true);
    setError(null);
    setUser(null);
    setActiveTab('enrollment');
    setExpandedCourses(new Set());
    setExpandedModules(new Set());
    Promise.all([
      api.getAdminUserDetail(userId),
      api.getCourses(),
    ])
      .then(([detail, allCourses]) => {
        setUser(detail);
        setCourses(allCourses);
        setEnrollments(detail.enrollments || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setProfileSaving(true);
    setProfileError(null);
    try {
      await api.updateUserProfile(userId, editName.trim(), editEmail.trim());
      setUser({ ...user, name: editName.trim(), email: editEmail.trim() });
      setEditingProfile(false);
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleRoleChange = async () => {
    if (!user) return;
    try {
      await api.updateUserRole(userId, pendingRole);
      setUser({ ...user, role: pendingRole });
      setConfirmAction(null);
    } catch {
      alert('Failed to update role');
    }
  };

  const handleToggleActive = async () => {
    if (!user) return;
    try {
      if (user.is_active) {
        await api.deactivateUser(userId);
        setUser({ ...user, is_active: false });
      } else {
        await api.activateUser(userId);
        setUser({ ...user, is_active: true });
      }
    } catch {
      alert('Failed to update user status');
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteUser(userId);
      onClose();
    } catch {
      alert('Failed to delete user');
    }
  };

  const handleToggleEnrollment = async (courseSlug: string) => {
    if (!user) return;
    setEnrollLoading(courseSlug);
    const isEnrolled = enrollments.some((e) => e.course_slug === courseSlug);
    try {
      if (isEnrolled) {
        await api.unenrollUser(user.email, courseSlug);
        setEnrollments((prev) => prev.filter((e) => e.course_slug !== courseSlug));
      } else {
        await api.enrollUser(user.email, [courseSlug]);
        setEnrollments((prev) => [...prev, {
          id: '',
          email: user.email,
          course_slug: courseSlug,
          enrolled_at: new Date().toISOString(),
          enrolled_by: null,
        }]);
      }
    } catch {
      alert('Failed to update enrollment');
    } finally {
      setEnrollLoading(null);
    }
  };

  // Fetch navTree for a course when expanding it in progress tab
  const toggleCourse = async (courseSlug: string) => {
    setExpandedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(courseSlug)) {
        next.delete(courseSlug);
      } else {
        next.add(courseSlug);
        if (!navTrees[courseSlug]) {
          api.getCourse(courseSlug)
            .then((data) => {
              setNavTrees((prev) => ({ ...prev, [courseSlug]: data.navTree }));
            })
            .catch(() => {});
        }
      }
      return next;
    });
  };

  const toggleModule = (key: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Build lesson progress lookup: course_slug -> module_slug -> lesson_slug -> entry
  const lessonLookup = new Map<string, Map<string, Map<string, LessonProgressEntry>>>();
  if (user) {
    for (const lp of user.lesson_progress) {
      const cs = lp.course_slug || '';
      if (!lessonLookup.has(cs)) lessonLookup.set(cs, new Map());
      const modMap = lessonLookup.get(cs)!;
      if (!modMap.has(lp.module_slug)) modMap.set(lp.module_slug, new Map());
      modMap.get(lp.module_slug)!.set(lp.lesson_slug, lp);
    }
  }

  // KC lookup: course_slug:module_slug -> entry
  const kcLookup = new Map<string, { score: number }>();
  if (user) {
    for (const kc of user.knowledge_check_scores) {
      const key = `${kc.course_slug || ''}:${kc.module_slug}`;
      kcLookup.set(key, kc);
    }
  }

  const StatusIcon = ({ status, size = 14 }: { status: string; size?: number }) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={size} className="text-success flex-shrink-0" />;
      case 'in_progress':
        return <Disc size={size} className="text-primary flex-shrink-0" />;
      default:
        return <Circle size={size} className="text-primary/30 flex-shrink-0" />;
    }
  };

  const EnrollmentTab = () => (
    <div className="space-y-2">
      {courses.length === 0 ? (
        <p className="text-sm text-text-secondary py-6 text-center">No courses available.</p>
      ) : (
        courses.map((c) => {
          const isEnrolled = enrollments.some((e) => e.course_slug === c.slug);
          const isLoading = enrollLoading === c.slug;
          return (
            <label
              key={c.slug}
              className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                isEnrolled
                  ? 'border-primary/30 bg-primary/5 shadow-sm'
                  : 'border-slate-200/60 bg-white/50 hover:border-primary/20 hover:shadow-sm'
              } ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <input
                type="checkbox"
                checked={isEnrolled}
                onChange={() => handleToggleEnrollment(c.slug)}
                className="accent-primary w-4 h-4"
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-text-primary">{c.title}</span>
                {c.description && (
                  <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{c.description}</p>
                )}
              </div>
              {isEnrolled && !isLoading && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Enrolled
                </span>
              )}
              {isLoading && (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </label>
          );
        })
      )}
    </div>
  );

  const ProgressTab = () => {
    const enrolledSlugs = new Set(enrollments.map((e) => e.course_slug));
    const enrolledCourses = courses.filter((c) => enrolledSlugs.has(c.slug));

    if (enrolledCourses.length === 0) {
      return (
        <div className="text-center py-8">
          <BarChart3 size={32} className="mx-auto text-text-secondary/30 mb-3" />
          <p className="text-sm font-medium text-text-secondary">No courses enrolled</p>
          <p className="text-xs text-text-secondary/70 mt-1">
            Go to the Enrollment tab to assign courses.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {enrolledCourses.map((course) => {
          const isExpanded = expandedCourses.has(course.slug);
          const tree = navTrees[course.slug];
          const courseLessons = lessonLookup.get(course.slug);

          const cp = user?.course_progress.find((p) => p.course_slug === course.slug);
          const courseStatus = cp?.status || 'not_started';

          return (
            <div key={course.slug} className="border border-slate-200/60 rounded-xl bg-white/50 overflow-hidden">
              <button
                onClick={() => toggleCourse(course.slug)}
                className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-slate-50/50 transition-colors"
              >
                <StatusIcon status={courseStatus} size={16} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-text-primary">{course.title}</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {isExpanded && (
                <div className="px-3.5 pb-3.5 border-t border-slate-100">
                  {!tree ? (
                    <div className="flex items-center gap-2 py-3 pl-7 text-xs text-text-secondary">
                      <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading modules...
                    </div>
                  ) : (
                    <div className="mt-2 space-y-1">
                      {tree.modules.map((mod) => {
                        const modKey = `${course.slug}:${mod.slug}`;
                        const isModExpanded = expandedModules.has(modKey);
                        const modLessons = courseLessons?.get(mod.slug);
                        const completedCount = modLessons
                          ? Array.from(modLessons.values()).filter((l) => l.status === 'completed').length
                          : 0;
                        const totalCount = mod.lessons.length;
                        const modStatus = completedCount >= totalCount && totalCount > 0
                          ? 'completed'
                          : completedCount > 0
                            ? 'in_progress'
                            : 'not_started';
                        const kc = kcLookup.get(modKey);

                        return (
                          <div key={mod.slug}>
                            <button
                              onClick={() => toggleModule(modKey)}
                              className="w-full flex items-center gap-2.5 py-2 pl-7 pr-2 text-left hover:bg-surface/30 rounded-md transition-colors"
                            >
                              <StatusIcon status={modStatus} />
                              <span className="flex-1 text-xs font-medium text-text-primary truncate">
                                {mod.title}
                              </span>
                              <span className={`text-[11px] font-medium ${
                                modStatus === 'completed' ? 'text-success' : modStatus === 'in_progress' ? 'text-indigo-600' : 'text-text-secondary'
                              }`}>
                                {modStatus === 'completed'
                                  ? 'complete'
                                  : modStatus === 'in_progress'
                                    ? `in progress (${completedCount}/${totalCount})`
                                    : `0/${totalCount}`}
                              </span>
                              {kc && (
                                <span className="text-[10px] font-medium text-primary ml-1">
                                  KC: {kc.score}%
                                </span>
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
                                    <div
                                      key={lesson.slug}
                                      className="flex items-center gap-2 py-1.5 text-xs"
                                    >
                                      <StatusIcon status={lessonStatus} size={12} />
                                      <span className="flex-1 text-text-primary truncate">
                                        {lesson.title}
                                      </span>
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
                                        <span className="text-text-secondary">
                                          {new Date(lp.completed_at).toLocaleDateString()}
                                        </span>
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
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/50 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Centered Modal */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden pointer-events-auto flex flex-col"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Purple title bar */}
          <div className="flex-shrink-0 px-5 py-3 flex items-center justify-between rounded-t-xl" style={{ background: 'var(--color-primary)' }}>
            <div className="flex items-center gap-2 text-white">
              <UsersIcon size={16} />
              <h3 className="text-sm font-semibold">User Detail</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Hero bar */}
          <section className="relative overflow-hidden flex-shrink-0 bg-white">
            <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
              <div
                className="absolute w-[500px] h-[500px] rounded-full opacity-30 blur-[100px] animate-[meshFloat1_12s_ease-in-out_infinite]"
                style={{ background: 'var(--color-primary)', top: '-10%', left: '-5%' }}
              />
              <div
                className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-[100px] animate-[meshFloat2_14s_ease-in-out_infinite]"
                style={{ background: 'var(--color-primary-hover)', top: '20%', right: '-8%' }}
              />
              <div
                className="absolute w-[350px] h-[350px] rounded-full opacity-15 blur-[100px] animate-[meshFloat3_10s_ease-in-out_infinite]"
                style={{ background: 'var(--color-accent)', bottom: '-15%', left: '30%' }}
              />
            </div>

            <div className="relative z-10 px-6 py-5">
              {loading && (
                <div className="space-y-3">
                  <div className="h-5 bg-surface rounded w-40 animate-pulse" />
                  <div className="h-3 bg-surface rounded w-56 animate-pulse" />
                </div>
              )}

              {error && !loading && (
                <div className="text-center py-2">
                  <p className="text-error font-semibold">Failed to load user</p>
                  <p className="text-text-secondary text-sm mt-1">{error}</p>
                </div>
              )}

              {user && !loading && (
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    {editingProfile ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Name"
                          className="w-full px-3 py-1.5 text-sm bg-white/70 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          placeholder="Email"
                          className="w-full px-3 py-1.5 text-sm bg-white/70 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        {profileError && <p className="text-xs text-red-600">{profileError}</p>}
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveProfile}
                            disabled={profileSaving}
                            className="px-3 py-1 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-60"
                          >
                            {profileSaving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => { setEditingProfile(false); setProfileError(null); }}
                            className="px-3 py-1 text-xs font-medium text-text-secondary bg-white/70 border border-white/50 rounded-lg hover:bg-white/90"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-semibold text-text-primary tracking-tight truncate" style={{ fontFamily: 'var(--font-heading)' }}>
                            {user.name}
                          </h2>
                          {!user.is_active && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200">
                              Deactivated
                            </span>
                          )}
                          <button
                            onClick={() => { setEditName(user.name); setEditEmail(user.email); setEditingProfile(true); setProfileError(null); }}
                            className="p-1 rounded-md text-text-secondary/50 hover:text-text-secondary hover:bg-black/5 transition-colors"
                            title="Edit name and email"
                          >
                            <Pencil size={13} />
                          </button>
                        </div>
                        <p className="text-sm text-text-secondary truncate">{user.email}</p>
                        <div className="flex gap-4 mt-1.5 text-xs text-text-secondary">
                          <span>Enrolled: {new Date(user.created_at).toLocaleDateString()}</span>
                          <span>Last active: {user.last_active_at ? new Date(user.last_active_at).toLocaleDateString() : '-'}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative">
                      <select
                        value={user.role}
                        onChange={(e) => {
                          setPendingRole(e.target.value as 'learner' | 'admin' | 'dev_admin');
                          setConfirmAction('role');
                        }}
                        className="appearance-none bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm rounded-lg px-3 py-2 pr-8 text-sm font-medium text-text-primary hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                        style={{ minWidth: '120px' }}
                      >
                        <option value="learner">Learner</option>
                        <option value="admin">Admin</option>
                        <option value="dev_admin">Dev Admin</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                    </div>
                    <button
                      onClick={handleToggleActive}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-text-secondary bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm rounded-lg hover:bg-white/90 transition-all"
                      title={user.is_active ? 'Deactivate user' : 'Activate user'}
                    >
                      {user.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                      <span className="hidden sm:inline">{user.is_active ? 'Deactivate' : 'Activate'}</span>
                    </button>
                    <button
                      onClick={() => setConfirmAction('delete')}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-white/70 backdrop-blur-sm border border-red-200/50 shadow-sm rounded-lg hover:bg-red-50/90 transition-all"
                      title="Delete user"
                    >
                      <Trash2 size={16} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-slate-50">
            {user && !loading && (
              <div className="p-6">
                <div className="flex gap-2 mb-5">
                  <button
                    onClick={() => setActiveTab('enrollment')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                      activeTab === 'enrollment'
                        ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <BookOpen size={16} />
                    Enrollment
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      activeTab === 'enrollment' ? 'bg-primary/20 text-primary' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {enrollments.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('progress')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                      activeTab === 'progress'
                        ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <BarChart3 size={16} />
                    Progress
                  </button>
                </div>

                {activeTab === 'enrollment' ? <EnrollmentTab /> : <ProgressTab />}
              </div>
            )}
          </div>

          {/* Confirmation dialog */}
          {confirmAction && (
            <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
              <Card className="w-full max-w-sm p-6" elevation={3}>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {confirmAction === 'delete' ? 'Delete User' : 'Change Role'}
                </h3>
                <p className="text-sm text-text-secondary mb-4">
                  {confirmAction === 'delete'
                    ? `Are you sure you want to permanently delete ${user?.name}? This cannot be undone.`
                    : `Change ${user?.name}'s role to "${pendingRole}"?`}
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="tertiary" onClick={() => setConfirmAction(null)}>Cancel</Button>
                  <Button
                    onClick={confirmAction === 'delete' ? handleDelete : handleRoleChange}
                    className={confirmAction === 'delete' ? 'bg-error border-error hover:bg-red-700' : ''}
                  >
                    {confirmAction === 'delete' ? 'Delete' : 'Confirm'}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
