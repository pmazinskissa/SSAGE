import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, UserPlus, AlertTriangle, ArrowUpDown, X, Upload, Plus, Trash2, Users as UsersIcon, ChevronDown, UserX, UserCheck, BookOpen, BookX, Eye } from 'lucide-react';
import { api } from '../../lib/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SearchInput from '../../components/ui/SearchInput';
import { fadeInUp } from '../../lib/animations';
import AdminUserDetail from './AdminUserDetail';
import type { UserWithProgress, CourseConfig } from '@playbook/shared';

interface PreEnrolledUser {
  id: string;
  email: string;
  name: string;
  role: string;
  enrolled_at: string;
  enrolled_by: string | null;
}

type StatusFilter = 'all' | 'pre_enrolled' | 'deactivated';
type SortField = 'name' | 'email' | 'role' | 'created_at' | 'last_active_at';
type SortDir = 'asc' | 'desc';

export default function AdminUsers() {
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
  const [preEnrollEntries, setPreEnrollEntries] = useState<{ name: string; email: string; role: 'learner' | 'admin' | 'dev_admin'; courses: string[] }[]>([
    { name: '', email: '', role: 'learner', courses: [] },
  ]);
  const [preEnrollResult, setPreEnrollResult] = useState<{ added: number; skipped: number } | null>(null);
  const [preEnrollTab, setPreEnrollTab] = useState<'form' | 'csv'>('form');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [preEnrolledUsers, setPreEnrolledUsers] = useState<PreEnrolledUser[]>([]);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkEnrollCourse, setBulkEnrollCourse] = useState('');
  const [bulkUnenrollCourse, setBulkUnenrollCourse] = useState('');
  const [viewUserId, setViewUserId] = useState<string | null>(null);

  const fetchAll = () => {
    api.getCourses().then(setCourses).catch(() => {});
    Promise.all([api.getAdminUsers(), api.getPreEnrolledUsers()])
      .then(([u, pe]) => { setUsers(u); setPreEnrolledUsers(pe); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // Merge registered users and pre-enrolled users into a unified list
  type UnifiedUser = UserWithProgress & { _preEnrolled?: boolean };

  const filtered = useMemo(() => {
    const registered: UnifiedUser[] = users.map((u) => ({ ...u, _preEnrolled: false }));
    const pending: UnifiedUser[] = preEnrolledUsers.map((pe) => ({
      id: pe.id,
      email: pe.email,
      name: pe.name,
      role: pe.role as any,
      is_active: true,
      created_at: pe.enrolled_at,
      last_active_at: '',
      oauth_provider: null,
      oauth_subject_id: null,
      course_progress: [],
      _preEnrolled: true,
    } as unknown as UnifiedUser));

    let list: UnifiedUser[];

    if (statusFilter === 'pre_enrolled') {
      list = [...pending];
    } else if (statusFilter === 'deactivated') {
      list = registered.filter((u) => !u.is_active);
    } else {
      list = [...registered, ...pending];
    }

    if (search) {
      const lower = search.toLowerCase();
      list = list.filter(
        (u) => u.name.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower)
      );
    }

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'email': cmp = a.email.localeCompare(b.email); break;
        case 'role': cmp = a.role.localeCompare(b.role); break;
        case 'created_at': cmp = a.created_at.localeCompare(b.created_at); break;
        case 'last_active_at': cmp = (a.last_active_at || '').localeCompare(b.last_active_at || ''); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [users, preEnrolledUsers, statusFilter, search, sortField, sortDir]);

  // Bulk selection helpers — only registered (non-pre-enrolled) users are selectable
  const selectableIds = useMemo(
    () => filtered.filter((u) => !(u as any)._preEnrolled).map((u) => u.id),
    [filtered]
  );
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.has(id));

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableIds));
    }
  };

  // Bulk action handlers
  const handleBulkDeactivate = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await api.bulkDeactivateUsers([...selectedIds]);
      setUsers((prev) => prev.map((u) => selectedIds.has(u.id) ? { ...u, is_active: false } : u));
      setSelectedIds(new Set());
    } catch {
      alert('Failed to deactivate users');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkActivate = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await api.bulkActivateUsers([...selectedIds]);
      setUsers((prev) => prev.map((u) => selectedIds.has(u.id) ? { ...u, is_active: true } : u));
      setSelectedIds(new Set());
    } catch {
      alert('Failed to activate users');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Permanently delete ${selectedIds.size} user${selectedIds.size > 1 ? 's' : ''}? This cannot be undone.`)) return;
    setBulkLoading(true);
    try {
      await api.bulkDeleteUsers([...selectedIds]);
      setUsers((prev) => prev.filter((u) => !selectedIds.has(u.id)));
      setSelectedIds(new Set());
    } catch {
      alert('Failed to delete users');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkEnroll = async () => {
    if (selectedIds.size === 0 || !bulkEnrollCourse) return;
    setBulkLoading(true);
    const emails = users.filter((u) => selectedIds.has(u.id)).map((u) => u.email);
    try {
      await api.bulkEnrollUsers(emails, [bulkEnrollCourse]);
      setBulkEnrollCourse('');
      setSelectedIds(new Set());
    } catch {
      alert('Failed to enroll users');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkUnenroll = async () => {
    if (selectedIds.size === 0 || !bulkUnenrollCourse) return;
    setBulkLoading(true);
    const emails = users.filter((u) => selectedIds.has(u.id)).map((u) => u.email);
    try {
      await api.bulkUnenrollUsers(emails, bulkUnenrollCourse);
      setBulkUnenrollCourse('');
      setSelectedIds(new Set());
    } catch {
      alert('Failed to unenroll users');
    } finally {
      setBulkLoading(false);
    }
  };

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
        const [updated, updatedPe] = await Promise.all([api.getAdminUsers(), api.getPreEnrolledUsers()]);
        setUsers(updated);
        setPreEnrolledUsers(updatedPe);
      } catch {
        alert('Failed to pre-enroll users from CSV');
      }
      return;
    }

    const validEntries = preEnrollEntries.filter((e) => e.email.trim());
    if (validEntries.length === 0) return;
    try {
      const result = await api.preEnrollUsers(validEntries.map((e) => ({
        ...e,
        courses: e.courses.length > 0 ? e.courses : undefined,
      })));
      setPreEnrollResult(result);
      const [updated, updatedPe] = await Promise.all([api.getAdminUsers(), api.getPreEnrolledUsers()]);
      setUsers(updated);
      setPreEnrolledUsers(updatedPe);
    } catch {
      alert('Failed to pre-enroll users');
    }
  };

  const addEntry = () => {
    setPreEnrollEntries([...preEnrollEntries, { name: '', email: '', role: 'learner', courses: [] }]);
  };

  const removeEntry = (index: number) => {
    setPreEnrollEntries(preEnrollEntries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: string, value: string) => {
    setPreEnrollEntries(preEnrollEntries.map((e, i) => (i === index ? { ...e, [field]: value } : e)));
  };

  const toggleEntryCourse = (index: number, slug: string) => {
    setPreEnrollEntries(preEnrollEntries.map((e, i) => {
      if (i !== index) return e;
      const has = e.courses.includes(slug);
      return { ...e, courses: has ? e.courses.filter((s) => s !== slug) : [...e.courses, slug] };
    }));
  };

  const resetPreEnroll = () => {
    setShowPreEnroll(false);
    setPreEnrollResult(null);
    setPreEnrollEntries([{ name: '', email: '', role: 'learner' as const, courses: [] }]);
    setPreEnrollTab('form');
    setCsvFile(null);
  };

  const isStale = (lastActive: string) => {
    if (!lastActive) return false;
    const diff = Date.now() - new Date(lastActive).getTime();
    return diff > 14 * 24 * 60 * 60 * 1000;
  };

  const handleDeletePreEnrolled = async (id: string) => {
    try {
      await api.deletePreEnrolledUser(id);
      setPreEnrolledUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      alert('Failed to remove pre-enrolled user');
    }
  };

  const handleToggleActive = async (userId: string, currentlyActive: boolean) => {
    try {
      if (currentlyActive) {
        await api.deactivateUser(userId);
      } else {
        await api.activateUser(userId);
      }
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_active: !currentlyActive } : u));
    } catch {
      alert('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Permanently delete ${userName}? This cannot be undone.`)) return;
    try {
      await api.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch {
      alert('Failed to delete user');
    }
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
    { label: 'Pre-Enrolled', value: 'pre_enrolled' },
    { label: 'Deactivated', value: 'deactivated' },
  ];

  // Determine if all selected users are deactivated (for showing activate vs deactivate)
  const selectedUsers = users.filter((u) => selectedIds.has(u.id));
  const allSelectedDeactivated = selectedUsers.length > 0 && selectedUsers.every((u) => !u.is_active);

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
          </div>
        </div>
      </section>

    <div className="relative flex-1">
      <div className="absolute inset-0 -z-10 bg-surface/30" />
      <div className="absolute inset-0 -z-10 opacity-[0.07]" style={{ backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 40px, var(--color-primary) 40px, var(--color-primary) 41px, transparent 41px, transparent 80px), repeating-radial-gradient(circle at 30% 70%, transparent 0, transparent 60px, var(--color-primary) 60px, var(--color-primary) 61px, transparent 61px, transparent 120px), repeating-radial-gradient(circle at 70% 30%, transparent 0, transparent 50px, var(--color-primary) 50px, var(--color-primary) 51px, transparent 51px, transparent 100px)' }} />
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="p-6 max-w-6xl mx-auto pb-24">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-1 items-center">
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
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col className="w-[3%]" />
            <col className="w-[17%]" />
            <col className="w-[21%]" />
            <col className="w-[10%]" />
            <col className="w-[11%]" />
            <col className="w-[11%]" />
            <col className="w-[27%]" />
          </colgroup>
          <thead className="border-b border-border">
            <tr>
              <th className="py-3 px-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="accent-primary w-3.5 h-3.5 cursor-pointer"
                  title={allSelected ? 'Deselect all' : 'Select all'}
                />
              </th>
              <SortHeader field="name">Name</SortHeader>
              <SortHeader field="email">Email</SortHeader>
              <SortHeader field="role">Role</SortHeader>
              <SortHeader field="created_at">Enrolled</SortHeader>
              <SortHeader field="last_active_at">Last Active</SortHeader>
              <th className="text-center text-xs font-medium text-text-secondary uppercase tracking-wide py-3 px-3 border-l border-border">Actions</th>
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
                const isPre = !!(user as any)._preEnrolled;
                const isSelected = selectedIds.has(user.id);
                return (
                  <tr
                    key={user.id}
                    className={`border-b border-border/50 transition-colors ${
                      isSelected ? 'bg-primary/5' : 'hover:bg-surface/50'
                    } ${isPre ? 'opacity-75' : ''}`}
                  >
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      {!isPre && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          onClick={(e) => toggleSelect(user.id, e)}
                          className="accent-primary w-3.5 h-3.5 cursor-pointer"
                        />
                      )}
                    </td>
                    <td className="py-3 px-3 font-medium text-text-primary">
                      {user.name || <span className="text-text-secondary italic">—</span>}
                    </td>
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
                      {isPre ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="text-text-secondary italic">awaiting registration</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeletePreEnrolled(user.id); }}
                            className="text-error hover:text-error/80 transition-colors"
                            title="Remove pre-enrollment"
                          >
                            <Trash2 size={14} />
                          </button>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          {user.last_active_at ? new Date(user.last_active_at).toLocaleDateString() : '—'}
                          {isStale(user.last_active_at) && (
                            <span title="Inactive > 14 days"><AlertTriangle size={12} className="text-warning" /></span>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 border-l border-border">
                      {!isPre && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); setViewUserId(user.id); }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-primary bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 hover:border-primary/30 transition-all"
                            title="View details"
                          >
                            <Eye size={13} />
                            View
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleActive(user.id, user.is_active); }}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                              user.is_active
                                ? 'text-text-secondary bg-surface/50 border-border hover:bg-surface hover:border-border/80'
                                : 'text-success bg-green-50 border-green-200 hover:bg-green-100'
                            }`}
                            title={user.is_active ? 'Deactivate user' : 'Activate user'}
                          >
                            {user.is_active ? <UserX size={13} /> : <UserCheck size={13} />}
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.id, user.name); }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all"
                            title="Delete user"
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </div>
                      )}
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
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {preEnrollEntries.map((entry, i) => (
                  <div key={i} className="border border-border/50 rounded-lg p-3 space-y-2">
                    <div className="flex gap-2 items-start">
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
                    {courses.length > 0 && (
                      <details className="group">
                        <summary className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-text-secondary hover:text-text-primary select-none list-none">
                          <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
                          Courses
                          {entry.courses.length > 0 && (
                            <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full ml-1">
                              {entry.courses.length}
                            </span>
                          )}
                        </summary>
                        <div className="mt-2 space-y-1 pl-1">
                          {courses.map((c) => (
                            <label
                              key={c.slug}
                              className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-surface/50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={entry.courses.includes(c.slug)}
                                onChange={() => toggleEntryCourse(i, c.slug)}
                                className="accent-primary w-3.5 h-3.5"
                              />
                              <span className="text-xs text-text-primary">{c.title}</span>
                            </label>
                          ))}
                        </div>
                      </details>
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
                  Upload a CSV with columns: <strong>Name, Email, Role, Course1, Course2, ...</strong> (role and courses are optional; each course slug is a separate column).
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

    {/* Bulk action toolbar — floats at bottom when rows are selected */}
    {selectedIds.size > 0 && (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-2xl shadow-2xl ring-1 ring-white/10 flex-wrap justify-center">
        {/* Count + clear */}
        <span className="text-sm font-semibold text-white/90 mr-1">
          {selectedIds.size} selected
        </span>
        <button
          onClick={() => setSelectedIds(new Set())}
          className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors mr-2"
          title="Clear selection"
        >
          <X size={14} />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-white/20" />

        {/* Enroll in course */}
        <div className="flex items-center gap-1.5">
          <BookOpen size={14} className="text-white/60 shrink-0" />
          <select
            value={bulkEnrollCourse}
            onChange={(e) => setBulkEnrollCourse(e.target.value)}
            className="bg-white/10 border border-white/20 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-white/40 max-w-[140px]"
          >
            <option value="">Enroll in…</option>
            {courses.map((c) => (
              <option key={c.slug} value={c.slug}>{c.title}</option>
            ))}
          </select>
          <button
            onClick={handleBulkEnroll}
            disabled={!bulkEnrollCourse || bulkLoading}
            className="px-2.5 py-1.5 text-xs font-medium bg-primary hover:bg-primary/80 disabled:opacity-40 rounded-lg transition-colors"
          >
            Go
          </button>
        </div>

        {/* Unenroll from course */}
        <div className="flex items-center gap-1.5">
          <BookX size={14} className="text-white/60 shrink-0" />
          <select
            value={bulkUnenrollCourse}
            onChange={(e) => setBulkUnenrollCourse(e.target.value)}
            className="bg-white/10 border border-white/20 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-white/40 max-w-[140px]"
          >
            <option value="">Unenroll from…</option>
            {courses.map((c) => (
              <option key={c.slug} value={c.slug}>{c.title}</option>
            ))}
          </select>
          <button
            onClick={handleBulkUnenroll}
            disabled={!bulkUnenrollCourse || bulkLoading}
            className="px-2.5 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 disabled:opacity-40 border border-white/20 rounded-lg transition-colors"
          >
            Go
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-white/20" />

        {/* Activate / Deactivate */}
        {allSelectedDeactivated ? (
          <button
            onClick={handleBulkActivate}
            disabled={bulkLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-500 disabled:opacity-40 rounded-lg transition-colors"
          >
            <UserCheck size={13} />
            Activate
          </button>
        ) : (
          <button
            onClick={handleBulkDeactivate}
            disabled={bulkLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 disabled:opacity-40 border border-white/20 rounded-lg transition-colors"
          >
            <UserX size={13} />
            Deactivate
          </button>
        )}

        {/* Delete */}
        <button
          onClick={handleBulkDelete}
          disabled={bulkLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-lg transition-colors"
        >
          <Trash2 size={13} />
          Delete
        </button>
      </div>
    )}

    {/* User detail modal */}
    {viewUserId && (
      <AdminUserDetail
        userId={viewUserId}
        onClose={() => { setViewUserId(null); fetchAll(); }}
      />
    )}
    </>
  );
}
