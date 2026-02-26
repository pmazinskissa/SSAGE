import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Key, ShieldCheck, Zap, Settings as SettingsIcon, BookOpen, Bot, ListOrdered, ClipboardCheck, Clock } from 'lucide-react';
import { api } from '../../lib/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fadeInUp, stagger } from '../../lib/animations';
import type { CourseConfig } from '@playbook/shared';

/* ------------------------------------------------------------------ */
/*  Course configuration components                                    */
/* ------------------------------------------------------------------ */

interface CourseSettingsState {
  ai_features_enabled: boolean;
  ordered_lessons: boolean;
  require_knowledge_checks: boolean;
  min_lesson_time_minutes: number;
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
    <Card className="p-6 mb-6">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen size={18} className="text-success" />
        <h3 className="text-sm font-semibold text-text-primary">Course Configuration</h3>
      </div>

      <div className="space-y-5">
        <SettingRow
          icon={<Bot size={15} className="text-primary" />}
          label="AI Features"
          description="Enable all AI-powered features for this course, including the chat assistant, prompt scoring, and adaptive feedback."
          checked={settings.ai_features_enabled}
          onChange={() => toggle('ai_features_enabled')}
        />
        <SettingRow
          icon={<ListOrdered size={15} className="text-primary" />}
          label="Ordered Lessons"
          description="Require learners to complete lessons in sequence before unlocking the next one."
          checked={settings.ordered_lessons}
          onChange={() => toggle('ordered_lessons')}
        />
        <SettingRow
          icon={<ClipboardCheck size={15} className="text-primary" />}
          label="Require Knowledge Checks"
          description="Learners must pass the knowledge check before advancing to the next module."
          checked={settings.require_knowledge_checks}
          onChange={() => toggle('require_knowledge_checks')}
        />

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

      <div className="mt-6 flex items-center gap-2">
        <Button onClick={handleSave} disabled={saving} className="text-xs">
          {saving ? 'Saving...' : 'Save Course Settings'}
        </Button>
        {error && <p className="text-xs text-error">{error}</p>}
        {saved && <p className="text-xs text-success">Settings saved</p>}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Settings component                                            */
/* ------------------------------------------------------------------ */

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [courses, setCourses] = useState<CourseConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI config form state
  const [anthropicKey, setAnthropicKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [aiModel, setAiModel] = useState('claude-sonnet-4-6');
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [aiTesting, setAiTesting] = useState(false);
  const [aiSaving, setAiSaving] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [azureEndpoint, setAzureEndpoint] = useState('');
  const [azureApiKey, setAzureApiKey] = useState('');
  const [azureApiVersion, setAzureApiVersion] = useState('2024-10-21');
  const [azureDeployment, setAzureDeployment] = useState('');
  const [showAzureKey, setShowAzureKey] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getAdminSettings(),
      api.getAdminCourses(),
    ])
      .then(([s, c]) => {
        setSettings(s);
        setCourses(c);
        // Hydrate form from settings
        // Provider-specific keys; fall back to legacy ai_api_key for migration
        const legacyKey = s['ai_api_key'] || '';
        const savedModel = s['ai_model'] || '';
        const isGpt = savedModel.startsWith('gpt-');
        setAnthropicKey(s['anthropic_api_key'] || (!isGpt ? legacyKey : ''));
        setOpenaiKey(s['openai_api_key'] || (isGpt ? legacyKey : ''));
        setAzureEndpoint(s['azure_openai_endpoint'] || '');
        setAzureApiKey(s['azure_openai_api_key'] || '');
        setAzureApiVersion(s['azure_openai_api_version'] || '2024-10-21');
        setAzureDeployment(s['azure_openai_deployment'] || '');
        const VALID_MODELS = ['claude-sonnet-4-6', 'gpt-5.2', 'azure-openai'];
        setAiModel(VALID_MODELS.includes(savedModel) ? savedModel : 'claude-sonnet-4-6');
        // ai_enabled is now controlled by the per-course AI Features toggle
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveAi = async () => {
    setAiSaving(true);
    try {
      await Promise.all([
        api.updateSetting('anthropic_api_key', anthropicKey),
        api.updateSetting('openai_api_key', openaiKey),
        api.updateSetting('ai_model', aiModel),
        api.updateSetting('ai_enabled', 'true'),
        api.updateSetting('azure_openai_endpoint', azureEndpoint),
        api.updateSetting('azure_openai_api_key', azureApiKey),
        api.updateSetting('azure_openai_api_version', azureApiVersion),
        api.updateSetting('azure_openai_deployment', azureDeployment),
      ]);
    } catch {
      alert('Failed to save AI settings');
    }
    setAiSaving(false);
  };

  const handleTestAi = async () => {
    setAiTestResult(null);
    setAiTesting(true);
    try {
      const result = await api.testAiConnection();
      setAiTestResult(result);
    } catch {
      setAiTestResult({ success: false, message: 'Connection test failed' });
    }
    setAiTesting(false);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-surface rounded w-32" />
          <div className="h-48 bg-surface rounded-card" />
          <div className="h-32 bg-surface rounded-card" />
          <div className="h-48 bg-surface rounded-card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <p className="text-error font-semibold">Failed to load settings</p>
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
              <SettingsIcon size={16} />
              <span className="text-sm font-medium">Configuration</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Settings
            </h2>
            <p className="text-text-secondary mt-2 max-w-xl">Configure AI integrations, authentication, and platform preferences.</p>
          </motion.div>
        </div>
      </section>

    <div className="relative flex-1">
      <div className="absolute inset-0 -z-10 bg-surface/30" />
      <div className="absolute inset-0 -z-10 opacity-[0.07]" style={{ backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 40px, var(--color-primary) 40px, var(--color-primary) 41px, transparent 41px, transparent 80px), repeating-radial-gradient(circle at 30% 70%, transparent 0, transparent 60px, var(--color-primary) 60px, var(--color-primary) 61px, transparent 61px, transparent 120px), repeating-radial-gradient(circle at 70% 30%, transparent 0, transparent 50px, var(--color-primary) 50px, var(--color-primary) 51px, transparent 51px, transparent 100px)' }} />
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="p-6 max-w-3xl mx-auto"
    >
      {/* Course Configuration */}
      {courses.map((course) => (
        <motion.div key={course.slug} variants={fadeInUp}>
          <CourseCard course={course} />
        </motion.div>
      ))}

      {/* AI Configuration */}
      <motion.div variants={fadeInUp}>
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-primary" />
            <h3 className="text-sm font-semibold text-text-primary">AI Configuration</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Model</label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-input focus:outline-none focus:border-primary"
              >
                <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
                <option value="gpt-5.2">GPT-5.2</option>
                <option value="azure-openai">Azure OpenAI</option>
              </select>
            </div>

            {aiModel === 'azure-openai' ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Azure Endpoint</label>
                  <input
                    type="text"
                    value={azureEndpoint}
                    onChange={(e) => setAzureEndpoint(e.target.value)}
                    placeholder="https://your-resource.openai.azure.com"
                    className="w-full px-3 py-2 text-sm border border-border rounded-input focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Azure API Key</label>
                  <div className="relative">
                    <input
                      type={showAzureKey ? 'text' : 'password'}
                      value={azureApiKey}
                      onChange={(e) => setAzureApiKey(e.target.value)}
                      placeholder="your-azure-api-key"
                      className="w-full px-3 py-2 pr-10 text-sm border border-border rounded-input focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAzureKey(!showAzureKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary transition-colors"
                      title={showAzureKey ? 'Hide key' : 'Show key'}
                    >
                      {showAzureKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {!azureApiKey && (
                    <p className="mt-1 text-xs text-warning flex items-center gap-1">
                      <Key size={12} />
                      No API key is set for Azure OpenAI
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">API Version</label>
                  <input
                    type="text"
                    value={azureApiVersion}
                    onChange={(e) => setAzureApiVersion(e.target.value)}
                    placeholder="2024-10-21"
                    className="w-full px-3 py-2 text-sm border border-border rounded-input focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Deployment Name</label>
                  <input
                    type="text"
                    value={azureDeployment}
                    onChange={(e) => setAzureDeployment(e.target.value)}
                    placeholder="my-gpt-4o-deployment"
                    className="w-full px-3 py-2 text-sm border border-border rounded-input focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
              </>
            ) : aiModel.startsWith('gpt-') ? (
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">OpenAI API Key</label>
                <div className="relative">
                  <input
                    type={showOpenaiKey ? 'text' : 'password'}
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 pr-10 text-sm border border-border rounded-input focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary transition-colors"
                    title={showOpenaiKey ? 'Hide key' : 'Show key'}
                  >
                    {showOpenaiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {!openaiKey && (
                  <p className="mt-1 text-xs text-warning flex items-center gap-1">
                    <Key size={12} />
                    No API key is set for the selected model
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Anthropic API Key</label>
                <div className="relative">
                  <input
                    type={showAnthropicKey ? 'text' : 'password'}
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    placeholder="sk-ant-..."
                    className="w-full px-3 py-2 pr-10 text-sm border border-border rounded-input focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary transition-colors"
                    title={showAnthropicKey ? 'Hide key' : 'Show key'}
                  >
                    {showAnthropicKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {!anthropicKey && (
                  <p className="mt-1 text-xs text-warning flex items-center gap-1">
                    <Key size={12} />
                    No API key is set for the selected model
                  </p>
                )}
              </div>
            )}

            <p className="text-xs text-text-secondary">
              AI features include intelligent tutoring and adaptive feedback. The API key is stored encrypted.
            </p>

            <div className="flex gap-2">
              <Button onClick={handleTestAi} variant="tertiary" className="text-xs" disabled={aiTesting}>
                {aiTesting ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button onClick={handleSaveAi} disabled={aiSaving} className="text-xs">
                {aiSaving ? 'Saving...' : 'Save AI Settings'}
              </Button>
            </div>

            {aiTestResult && (
              <div className={`text-xs flex items-center gap-2 ${aiTestResult.success ? 'text-success' : 'text-error'}`}>
                <span>{aiTestResult.message}</span>
                {aiTestResult.latencyMs !== undefined && aiTestResult.latencyMs > 0 && !aiTestResult.message.includes('ms') && (
                  <span className="text-text-secondary">({aiTestResult.latencyMs}ms)</span>
                )}
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* OAuth Configuration (Read-Only) */}
      <motion.div variants={fadeInUp}>
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={18} className="text-secondary" />
            <h3 className="text-sm font-semibold text-text-primary">OAuth Configuration</h3>
            <span className="text-xs text-text-secondary bg-surface px-2 py-0.5 rounded-full">Read-only</span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Provider</span>
              <span className="text-text-primary font-medium">{settings['oauth_provider'] || 'Not configured'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Issuer URL</span>
              <span className="text-text-primary font-medium truncate max-w-xs">{settings['oauth_issuer_url'] || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Client ID</span>
              <span className="text-text-primary font-medium">
                {settings['oauth_client_id'] ? '••••' + settings['oauth_client_id'].slice(-4) : '—'}
              </span>
            </div>
          </div>

          <p className="text-xs text-text-secondary mt-4">
            OAuth settings are configured at deployment via environment variables.
          </p>
        </Card>
      </motion.div>

    </motion.div>
    </div>
    </>
  );
}
