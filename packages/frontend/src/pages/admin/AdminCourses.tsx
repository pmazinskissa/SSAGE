import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Bot, ClipboardCheck, Clock, ListOrdered, Save, BookMarked } from 'lucide-react';
import { api } from '../../lib/api';
import Card from '../../components/ui/Card';
import { fadeInUp, stagger } from '../../lib/animations';
import type { CourseConfig } from '@playbook/shared';

interface CourseSettingsState {
  ai_features_enabled: boolean;
  ordered_lessons: boolean;
  require_knowledge_checks: boolean;
  min_lesson_time_minutes: number; // stored as minutes in UI, converted to seconds on save
}

function CourseCard({ course }: { course: CourseConfig }) {
  const [settings, setSettings] = useState<CourseSettingsState>({
    ai_features_enabled: course.ai_features_enabled,
    ordered_lessons: course.navigation_mode === 'linear',
    require_knowledge_checks: course.require_knowledge_checks ?? false,
    min_lesson_time_minutes: Math.round((course.min_lesson_time_seconds ?? 0) / 60),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.updateCourseSettings(course.slug, {
        ai_features_enabled: settings.ai_features_enabled,
        ordered_lessons: settings.ordered_lessons,
        require_knowledge_checks: settings.require_knowledge_checks,
        min_lesson_time_seconds: settings.min_lesson_time_minutes * 60,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('Failed to save settings');
    }
    setSaving(false);
  };

  const toggle = (key: keyof Omit<CourseSettingsState, 'min_lesson_time_minutes'>) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <Card className="p-6">
      {/* Course header */}
      <div className="flex items-start gap-3 mb-6 pb-5 border-b border-border">
        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
          <BookOpen size={18} className="text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{course.title}</h3>
          <p className="text-xs text-text-secondary mt-0.5">{course.slug}</p>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-5">
        {/* AI features */}
        <SettingRow
          icon={<Bot size={15} className="text-primary" />}
          label="AI Assistant"
          description="Allow learners to use the AI chat assistant while taking this course."
          checked={settings.ai_features_enabled}
          onChange={() => toggle('ai_features_enabled')}
        />

        {/* Ordered lessons */}
        <SettingRow
          icon={<ListOrdered size={15} className="text-primary" />}
          label="Ordered Lessons"
          description="Require learners to complete lessons in sequence before unlocking the next one."
          checked={settings.ordered_lessons}
          onChange={() => toggle('ordered_lessons')}
        />

        {/* Require knowledge checks */}
        <SettingRow
          icon={<ClipboardCheck size={15} className="text-primary" />}
          label="Require Knowledge Checks"
          description="Learners must pass the knowledge check before advancing to the next module."
          checked={settings.require_knowledge_checks}
          onChange={() => toggle('require_knowledge_checks')}
        />

        {/* Min lesson time */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex-shrink-0 text-primary"><Clock size={15} /></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-text-primary">Minimum Time per Lesson</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  Learners must spend at least this long on each lesson before it can be marked complete. Set to 0 to disable.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={settings.min_lesson_time_minutes}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      min_lesson_time_minutes: Math.max(0, parseInt(e.target.value) || 0),
                    }))
                  }
                  className="w-16 px-2 py-1.5 text-sm text-center border border-border rounded-input focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                <span className="text-xs text-text-secondary whitespace-nowrap">min</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
        {error ? (
          <p className="text-xs text-error">{error}</p>
        ) : saved ? (
          <p className="text-xs text-success">Settings saved</p>
        ) : (
          <div />
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary rounded-button hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          <Save size={14} />
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </Card>
  );
}

function SettingRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">{label}</p>
        <p className="text-xs text-text-secondary mt-0.5">{description}</p>
      </div>
      <div className="flex-shrink-0 mt-0.5">
        <div
          onClick={onChange}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            checked ? 'bg-primary' : 'bg-border'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              checked ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </div>
      </div>
    </label>
  );
}

export default function AdminCourses() {
  const [courses, setCourses] = useState<CourseConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getAdminCourses()
      .then(setCourses)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-surface rounded w-32" />
          <div className="h-64 bg-surface rounded-card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <p className="text-error font-semibold">Failed to load courses</p>
        <p className="text-text-secondary mt-2">{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute w-[500px] h-[500px] rounded-full opacity-30 blur-[100px] animate-[meshFloat1_12s_ease-in-out_infinite]" style={{ background: 'var(--color-primary)', top: '-10%', left: '-5%' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-[100px] animate-[meshFloat2_14s_ease-in-out_infinite]" style={{ background: 'var(--color-primary-hover)', top: '20%', right: '-8%' }} />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 pt-10 pb-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-2 text-primary mb-2">
              <BookMarked size={16} />
              <span className="text-sm font-medium">Configuration</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Courses
            </h2>
            <p className="text-text-secondary mt-2 max-w-xl">
              Configure per-course learning requirements, AI features, and navigation rules.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="relative flex-1">
        <div className="absolute inset-0 -z-10 bg-surface/30" />
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="p-6 max-w-3xl mx-auto space-y-6"
        >
          {courses.map((course) => (
            <motion.div key={course.slug} variants={fadeInUp}>
              <CourseCard course={course} />
            </motion.div>
          ))}
          {courses.length === 0 && (
            <p className="text-center text-text-secondary py-12">No courses found.</p>
          )}
        </motion.div>
      </div>
    </>
  );
}
