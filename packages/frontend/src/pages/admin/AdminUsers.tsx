import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, UserPlus, AlertTriangle, ArrowUpDown, X, Upload, Plus, Trash2, Users as UsersIcon, ChevronDown } from 'lucide-react';
import { api } from '../../lib/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SearchInput from '../../components/ui/SearchInput';
import { fadeInUp } from '../../lib/animations';
import type { UserWithProgress, CourseConfig } from '@playbook/shared';

type StatusFilter = 'all' | 'not_started' | 'in_progress' | 'completed';
type SortField = 'name' | 'email' | 'role' | 'created_at' | 'last_active_at' | 'status' | 'time';
type SortDir = 'asc' | 'desc';

interface AdminUsersProps {
  onUserClick?: (userId: string) => void;
}

/** Get the course_progress entry matching the selected course, or aggregate across all courses. */
function getProgress(user: UserWithProgress, selectedCourse: string) {
  if (selectedCourse) {
    return user.course_progress.find((cp) => cp.course_slug === selectedCourse) || null;
  }
  // Aggregate: best status, sum time
  if (user.course_progress.length === 0) return null;
  const statusRank: Record<string, number> = { completed: 2, in_progress: 1, not_started: 0 };
  let bestStatus = 'not_started';
  let totalTime = 0;
  for (const cp of user.course_progress) {
    if ((statusRank[cp.status] ?? 0) > (statusRank[bestStatus] ?? 0)) bestStatus = cp.status;
    totalTime += cp.total_time_seconds || 0;
  }
  return { status: bestStatus, total_time_seconds: totalTime, course_slug: '' };
}

export default function AdminUsers({ onUserClick }: AdminUsersProps) {
  const [users, setUsers] = useState<UserWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseConfig[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showPreEnroll, setShowPreEnroll] = useState(false);
  const [preEnrollEntries, setPreEnrollEntries] = useState<{ name: string; email: string; role: 'learner' | 'admin' | 'dev_admin' }[]>([
    { name: '', email: '', role: 'learner' },
  ]);
  const [preEnrollResult, setPreEnrollResult] = useState<{ added: number; skipped: number } | null>(null);
  const [preEnrollTab, setPreEnrollTab] = useState<'form' | 'csv'>('form');
  const [csvFile, setCsvFile] = useState<File | null>(null);

  useEffect(() => {
    api.getCourses().then(setCourses).catch(() => {});
    api.getAdminUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    let list = [...users];

    // Status filter
    if (statusFilter !== 'all') {
      list = list.filter((u) => {
        const cp = getProgress(u, selectedCourse);
        const status = cp?.status || 'not_started';
        return status === statusFilter;
      });
    }

    // Search
    if (search) {
      const lower = search.toLowerCase();
      list = list.filter(
        (u) => u.name.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower)
      );
    }

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'email': cmp = a.email.localeCompare(b.email); break;
        case 'role': cmp = a.role.localeCompare(b.role); break;
        case 'created_at': cmp = a.created_at.localeCompare(b.created_at); break;
        case 'last_active_at': cmp = (a.last_active_at || '').localeCompare(b.last_active_at || ''); break;
        case 'status': {
          const sa = getProgress(a, selectedCourse)?.status || 'not_started';
          const sb = getProgress(b, selectedCourse)?.status || 'not_started';
          cmp = sa.localeCompare(sb);
          break;
        }
        case 'time': {
          const ta = getProgress(a, selectedCourse)?.total_time_seconds || 0;
          const tb = getProgress(b, selectedCourse)?.total_time_seconds || 0;
          cmp = ta - tb;
          break;
        }
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [users, statusFilter, search, sortField, sortDir, selectedCourse]);

  const handleExport = async () => {
    try {
      const url = await api.exportUsersCSV(selectedCourse || undefined);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export CSV');
    }
  };

  const handlePreEnroll = async () => {
    if (preEnrollTab === 'csv' && csvFile) {
      // Upload CSV file
      const formData = new FormData();
      formData.append('file', csvFile);
      try {
        const res = await fetch('/api/admin/users/pre-enroll', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed');
        setPreEnrollResult(json.data);
        const updated = await api.getAdminUsers();
        setUsers(updated);
      } catch {
        alert('Failed to pre-enroll users from CSV');
      }
      return;
    }

    const validEntries = preEnrollEntries.filter((e) => e.email.trim());
    if (validEntries.length === 0) return;
    try {
      const result = await api.preEnrollUsers(validEntries);
      setPreEnrollResult(result);
      const updated = await api.getAdminUsers();
      setUsers(updated);
    } catch {
      alert('Failed to pre-enroll users');
    }
  };

  const addEntry = () => {
    setPreEnrollEntries([...preEnrollEntries, { name: '', email: '', role: 'learner' }]);
  };

  const removeEntry = (index: number) => {
    setPreEnrollEntries(preEnrollEntries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: string, value: string) => {
    setPreEnrollEntries(preEnrollEntries.map((e, i) => (i === index ? { ...e, [field]: value } : e)));
  };

  const resetPreEnroll = () => {
    setShowPreEnroll(false);
    setPreEnrollResult(null);
    setPreEnrollEntries([{ name: '', email: '', role: 'learner' as const }]);
    setPreEnrollTab('form');
    setCsvFile(null);
  };

  const isStale = (lastActive: string) => {
    if (!lastActive) return false;
    const diff = Date.now() - new Date(lastActive).getTime();
    return diff > 14 * 24 * 60 * 60 * 1000; // 14 days
  };

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

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="text-left text-xs font-medium text-text-secondary uppercase tracking-wide py-3 px-3 cursor-pointer select-none hover:text-text-primary"
      onClick={() => toggleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <ArrowUpDown size={12} className={sortField === field ? 'text-primary' : 'opacity-40'} />
      </span>
    </th>
  );

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface rounded w-32" />
          <div className="h-10 bg-surface rounded w-full" />
          <div className="h-64 bg-surface rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center">
        <p className="text-error font-semibold">Failed to load users</p>
        <p className="text-text-secondary mt-2">{error}</p>
      </div>
    );
  }

  const filters: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Not Started', value: 'not_started' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-2 text-primary mb-2">
                <UsersIcon size={16} />
                <span className="text-sm font-medium">User Management</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                Users
              </h2>
              <p className="text-text-secondary mt-2 max-w-xl">Manage enrollments, track individual progress, and pre-enroll new learners.</p>
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
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="p-6 max-w-6xl mx-auto">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                statusFilter === f.value
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-secondary hover:text-text-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="sm:ml-auto flex gap-2 items-center">
          <div className="w-full sm:w-64">
            <SearchInput placeholder="Search by name or email..." onChange={setSearch} />
          </div>
          <Button variant="tertiary" onClick={handleExport} className="text-xs shrink-0">
            <Download size={14} />
            Export CSV
          </Button>
          <Button variant="primary" onClick={() => setShowPreEnroll(true)} className="text-xs shrink-0">
            <UserPlus size={14} />
            Pre-Enroll
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr>
              <SortHeader field="name">Name</SortHeader>
              <SortHeader field="email">Email</SortHeader>
              <SortHeader field="role">Role</SortHeader>
              <SortHeader field="created_at">Enrolled</SortHeader>
              <SortHeader field="last_active_at">Last Active</SortHeader>
              <SortHeader field="status">Status</SortHeader>
              <SortHeader field="time">Time</SortHeader>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-text-secondary">
                  No users found
                </td>
              </tr>
            ) : (
              filtered.map((user) => {
                const cp = getProgress(user, selectedCourse);
                const status = cp?.status || 'not_started';
                return (
                  <tr
                    key={user.id}
                    onClick={() => onUserClick?.(user.id)}
                    className="border-b border-border/50 hover:bg-surface/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-medium text-text-primary">{user.name}</td>
                    <td className="py-3 px-3 text-text-secondary">{user.email}</td>
                    <td className="py-3 px-3">
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
                    </td>
                    <td className="py-3 px-3 text-text-secondary text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-text-secondary text-xs">
                      <span className="inline-flex items-center gap-1">
                        {user.last_active_at ? new Date(user.last_active_at).toLocaleDateString() : '—'}
                        {isStale(user.last_active_at) && (
                          <span title="Inactive > 14 days"><AlertTriangle size={12} className="text-warning" /></span>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-3">{statusBadge(status)}</td>
                    <td className="py-3 px-3 text-text-secondary text-xs">
                      {cp?.total_time_seconds
                        ? `${Math.round(cp.total_time_seconds / 60)}m`
                        : '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>

      {/* Pre-Enroll Modal */}
      {showPreEnroll && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6" elevation={3}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Pre-Enroll Users</h3>
              <button onClick={resetPreEnroll} className="p-1 hover:bg-surface rounded">
                <X size={20} />
              </button>
            </div>

            {/* Tab toggle */}
            <div className="flex gap-1 mb-4 bg-surface rounded-lg p-1">
              <button
                onClick={() => setPreEnrollTab('form')}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  preEnrollTab === 'form' ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary'
                }`}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setPreEnrollTab('csv')}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  preEnrollTab === 'csv' ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary'
                }`}
              >
                CSV Import
              </button>
            </div>

            {preEnrollTab === 'form' ? (
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {preEnrollEntries.map((entry, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={entry.name}
                        onChange={(e) => updateEntry(i, 'name', e.target.value)}
                        placeholder="Name"
                        className="w-full px-3 py-1.5 text-sm border border-border rounded-input focus:outline-none focus:border-primary"
                      />
                      <input
                        type="email"
                        value={entry.email}
                        onChange={(e) => updateEntry(i, 'email', e.target.value)}
                        placeholder="Email *"
                        className="w-full px-3 py-1.5 text-sm border border-border rounded-input focus:outline-none focus:border-primary"
                      />
                    </div>
                    <select
                      value={entry.role}
                      onChange={(e) => updateEntry(i, 'role', e.target.value)}
                      className="px-2 py-1.5 text-sm border border-border rounded-input focus:outline-none focus:border-primary mt-0.5"
                    >
                      <option value="learner">Learner</option>
                      <option value="admin">Admin</option>
                      <option value="dev_admin">Dev Admin</option>
                    </select>
                    {preEnrollEntries.length > 1 && (
                      <button
                        onClick={() => removeEntry(i)}
                        className="p-1.5 text-text-secondary hover:text-error rounded mt-0.5"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addEntry}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover font-medium"
                >
                  <Plus size={14} />
                  Add another
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-text-secondary">
                  Upload a CSV with columns: <strong>Name, Email, Role</strong> (role is optional, defaults to learner).
                </p>
                <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-border rounded-card cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload size={20} className="text-text-secondary" />
                  <span className="text-sm text-text-secondary">
                    {csvFile ? csvFile.name : 'Click to select CSV file'}
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            )}

            {preEnrollResult && (
              <p className="text-sm mt-3 text-text-secondary">
                Added: <strong className="text-success">{preEnrollResult.added}</strong> | Skipped: <strong>{preEnrollResult.skipped}</strong>
              </p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="tertiary" onClick={resetPreEnroll}>Cancel</Button>
              <Button onClick={handlePreEnroll}>Submit</Button>
            </div>
          </Card>
        </div>
      )}
    </motion.div>
    </div>
    </>
  );
}
