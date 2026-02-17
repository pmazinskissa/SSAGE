import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, UserX, UserCheck, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import type { UserDetail } from '@playbook/shared';

interface AdminUserDetailProps {
  userId: string;
  onClose: () => void;
}

export default function AdminUserDetail({ userId, onClose }: AdminUserDetailProps) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'role' | null>(null);
  const [pendingRole, setPendingRole] = useState<'learner' | 'admin' | 'dev_admin'>('learner');

  useEffect(() => {
    setLoading(true);
    setError(null);
    setUser(null);
    api.getAdminUserDetail(userId)
      .then(setUser)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

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

  // Group lesson progress by module
  const moduleMap = new Map<string, NonNullable<UserDetail>['lesson_progress']>();
  if (user) {
    for (const lp of user.lesson_progress) {
      if (!moduleMap.has(lp.module_slug)) moduleMap.set(lp.module_slug, []);
      moduleMap.get(lp.module_slug)!.push(lp);
    }
  }

  const kcMap = user
    ? new Map(user.knowledge_check_scores.map((kc) => [kc.module_slug, kc]))
    : new Map();

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

      {/* Panel */}
      <motion.div
        className="fixed top-0 right-0 h-full w-full sm:w-[600px] bg-background z-50 shadow-2xl overflow-y-auto"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Close button */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-6 py-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">User Detail</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-surface transition-colors text-text-secondary hover:text-text-primary"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="space-y-4">
              <div className="h-6 bg-surface rounded w-32 animate-pulse" />
              <div className="h-32 bg-surface rounded-card animate-pulse" />
              <div className="h-64 bg-surface rounded-card animate-pulse" />
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-8">
              <p className="text-error font-semibold">Failed to load user</p>
              <p className="text-text-secondary mt-2">{error}</p>
            </div>
          )}

          {user && !loading && (
            <>
              {/* User info header */}
              <Card className="p-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-text-primary">{user.name}</h2>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          user.role === 'dev_admin'
                            ? 'bg-purple-100 text-purple-700'
                            : user.role === 'admin'
                            ? 'bg-primary-light text-primary'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {user.role === 'dev_admin' ? 'dev admin' : user.role}
                      </span>
                      {!user.is_active && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                          Deactivated
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mt-1">{user.email}</p>
                    <div className="flex gap-4 mt-2 text-xs text-text-secondary">
                      <span>Enrolled: {new Date(user.created_at).toLocaleDateString()}</span>
                      <span>Last active: {user.last_active_at ? new Date(user.last_active_at).toLocaleDateString() : '—'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <select
                      value={user.role}
                      onChange={(e) => {
                        setPendingRole(e.target.value as 'learner' | 'admin' | 'dev_admin');
                        setConfirmAction('role');
                      }}
                      className="text-xs border border-border rounded-input px-2 py-1.5 focus:outline-none focus:border-primary"
                    >
                      <option value="learner">Learner</option>
                      <option value="admin">Admin</option>
                      <option value="dev_admin">Dev Admin</option>
                    </select>

                    <Button
                      variant="tertiary"
                      onClick={handleToggleActive}
                      className="text-xs"
                    >
                      {user.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </Button>

                    <Button
                      variant="tertiary"
                      onClick={() => setConfirmAction('delete')}
                      className="text-xs text-error border-error hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Progress breakdown */}
              <h3 className="text-sm font-semibold text-text-primary mb-3">Progress Breakdown</h3>
              {user.course_progress.length === 0 && moduleMap.size === 0 ? (
                <Card className="p-6 text-center text-text-secondary text-sm">
                  No progress recorded yet.
                </Card>
              ) : (
                <div className="space-y-4">
                  {Array.from(moduleMap.entries()).map(([modSlug, lessons]) => {
                    const kc = kcMap.get(modSlug);
                    const completedLessons = lessons.filter((l) => l.status === 'completed').length;
                    return (
                      <Card key={modSlug} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-text-primary">
                            {modSlug.replace(/^\d+-/, '').replace(/-/g, ' ')}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-text-secondary">
                            <span>{completedLessons}/{lessons.length} lessons</span>
                            {kc && (
                              <span className="text-primary font-medium">KC: {kc.score}%</span>
                            )}
                          </div>
                        </div>
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-border/50">
                              <th className="text-left py-1.5 text-text-secondary font-medium">Lesson</th>
                              <th className="text-left py-1.5 text-text-secondary font-medium">Status</th>
                              <th className="text-left py-1.5 text-text-secondary font-medium">Time</th>
                              <th className="text-left py-1.5 text-text-secondary font-medium">Completed</th>
                            </tr>
                          </thead>
                          <tbody>
                            {lessons.map((lp) => (
                              <tr key={lp.lesson_slug} className="border-b border-border/30">
                                <td className="py-1.5 text-text-primary">
                                  {lp.lesson_slug.replace(/^\d+-/, '').replace(/-/g, ' ')}
                                </td>
                                <td className="py-1.5">
                                  <span
                                    className={`font-medium ${
                                      lp.status === 'completed' ? 'text-success' : lp.status === 'in_progress' ? 'text-blue-600' : 'text-text-secondary'
                                    }`}
                                  >
                                    {lp.status.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="py-1.5 text-text-secondary">
                                  {lp.time_spent_seconds ? `${Math.round(lp.time_spent_seconds / 60)}m` : '—'}
                                </td>
                                <td className="py-1.5 text-text-secondary">
                                  {lp.completed_at ? new Date(lp.completed_at).toLocaleDateString() : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
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
    </AnimatePresence>
  );
}
