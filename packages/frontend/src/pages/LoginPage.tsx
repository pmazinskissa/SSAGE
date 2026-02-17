import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, AlertCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const PROVIDER_LABELS: Record<string, string> = {
  microsoft: 'Microsoft',
  google: 'Google',
  oidc: 'SSO',
};

export default function LoginPage() {
  const { user, loading, error, providers, login, devLogin, register, localLogin } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Local auth form state
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [loading, user, navigate]);

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(email, name, password);
      } else {
        await localLogin(email, password);
      }
    } catch {
      // Error is set in AuthContext
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <Card elevation={2} className="p-8">
          <div className="flex flex-col items-center mb-8">
            <img
              src="/api/themes/logo"
              alt={theme?.organization_name || 'Logo'}
              className="h-12 mb-4"
            />
            <h1
              className="text-xl font-bold text-text-primary text-center"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {theme?.organization_name || 'Practitioners Playbook'}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {providers?.localAuth
                ? (isRegister ? 'Create an account' : 'Sign in to continue')
                : 'Sign in to continue'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2 p-3 mb-4 rounded-card bg-error/10 border border-error/20"
              >
                <AlertCircle size={16} className="text-error flex-shrink-0 mt-0.5" />
                <p className="text-sm text-error">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            {providers?.oauth && (
              <Button onClick={login} className="w-full justify-center gap-2">
                <LogIn size={16} />
                Sign in with {PROVIDER_LABELS[providers.oauth] || providers.oauth}
              </Button>
            )}

            {providers?.devBypass && (
              <Button onClick={devLogin} className="w-full justify-center gap-2">
                <LogIn size={16} />
                Dev Login
              </Button>
            )}

            {providers?.localAuth && (
              <form onSubmit={handleLocalSubmit} className="space-y-3">
                {isRegister && (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    required
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-input focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                )}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-input focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  minLength={6}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-input focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full justify-center gap-2"
                >
                  {isRegister ? <UserPlus size={16} /> : <LogIn size={16} />}
                  {submitting
                    ? (isRegister ? 'Creating account...' : 'Signing in...')
                    : (isRegister ? 'Create Account' : 'Sign In')}
                </Button>
                <p className="text-xs text-text-secondary text-center">
                  {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => { setIsRegister(!isRegister); }}
                    className="text-link hover:underline font-medium"
                  >
                    {isRegister ? 'Sign in' : 'Register'}
                  </button>
                </p>
              </form>
            )}

            {!providers?.oauth && !providers?.devBypass && !providers?.localAuth && (
              <p className="text-sm text-text-secondary text-center">
                No authentication providers configured.
              </p>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
