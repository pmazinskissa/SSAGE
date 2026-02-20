import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Key, ShieldCheck, Zap, Settings as SettingsIcon } from 'lucide-react';
import { api } from '../../lib/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fadeInUp, stagger } from '../../lib/animations';

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI config form state
  const [anthropicKey, setAnthropicKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [aiModel, setAiModel] = useState('claude-sonnet-4-6');
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [aiTesting, setAiTesting] = useState(false);
  const [aiSaving, setAiSaving] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);

  useEffect(() => {
    api.getAdminSettings()
      .then((s) => {
        setSettings(s);
        // Hydrate form from settings
        // Provider-specific keys; fall back to legacy ai_api_key for migration
        const legacyKey = s['ai_api_key'] || '';
        const savedModel = s['ai_model'] || '';
        const isGpt = savedModel.startsWith('gpt-');
        setAnthropicKey(s['anthropic_api_key'] || (!isGpt ? legacyKey : ''));
        setOpenaiKey(s['openai_api_key'] || (isGpt ? legacyKey : ''));
        const VALID_MODELS = ['claude-sonnet-4-6', 'gpt-5.2'];
        setAiModel(VALID_MODELS.includes(savedModel) ? savedModel : 'claude-sonnet-4-6');
        setAiEnabled(s['ai_enabled'] === 'true');
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
        api.updateSetting('ai_enabled', String(aiEnabled)),
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
      {/* AI Configuration */}
      <motion.div variants={fadeInUp}>
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-primary" />
            <h3 className="text-sm font-semibold text-text-primary">AI Configuration</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Anthropic API Key <span className="text-text-secondary/50">(Claude)</span></label>
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
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">OpenAI API Key <span className="text-text-secondary/50">(GPT)</span></label>
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
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Model</label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-input focus:outline-none focus:border-primary"
              >
                <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
                <option value="gpt-5.2">GPT-5.2</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-primary">Enable AI features</span>
            </label>

            {aiEnabled && aiModel.startsWith('gpt-') && !openaiKey && (
              <p className="text-xs text-warning flex items-center gap-1">
                <Key size={12} />
                AI is enabled but no OpenAI API key is set
              </p>
            )}
            {aiEnabled && !aiModel.startsWith('gpt-') && !anthropicKey && (
              <p className="text-xs text-warning flex items-center gap-1">
                <Key size={12} />
                AI is enabled but no Anthropic API key is set
              </p>
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
