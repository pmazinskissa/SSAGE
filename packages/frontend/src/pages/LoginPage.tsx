import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, AlertCircle, UserPlus, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { NoiseOverlay, GradientMesh } from '../components/ui/Backgrounds';
import Footer from '../components/layout/Footer';

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
    <div className="min-h-screen bg-background relative flex flex-col">
      {/* Noise texture */}
      <NoiseOverlay />

      {/* Header — matches CourseCatalog */}
      <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-xl border-b border-white/50 shadow-elevation-1 px-6 h-14 flex items-center justify-center">
        <img
          src="/assets/Protective_Life_logo.svg.png"
          alt={theme?.organization_name || 'Protective Life'}
          className="h-7"
        />
      </header>

      {/* Thin accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden px-4 py-12">
        {/* Animated gradient mesh */}
        <GradientMesh />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
          className="w-full max-w-md relative z-10"
        >
          <Card elevation={2} className="p-10">
            {/* Heading */}
            <div className="flex flex-col items-center mb-8">
              <h1
                className="text-2xl font-semibold text-text-primary text-center tracking-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                SSAGE
              </h1>
              <p className="text-sm text-text-secondary mt-2">
                {providers?.localAuth
                  ? (isRegister ? 'Create your account to get started' : 'Sign in to continue learning')
                  : 'Sign in to continue learning'}
              </p>
            </div>

            {/* Error banner */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2.5 p-3.5 mb-6 rounded-card bg-error/10 border border-error/20"
                >
                  <AlertCircle size={16} className="text-error flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-error">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              {providers?.oauth && (
                <Button onClick={login} className="w-full justify-center gap-2">
                  <LogIn size={16} />
                  Sign in with {PROVIDER_LABELS[providers.oauth] || providers.oauth}
                </Button>
              )}

              {providers?.devBypass && (
                <Button onClick={devLogin} variant="tertiary" className="w-full justify-center gap-2">
                  <LogIn size={16} />
                  Dev Login
                </Button>
              )}

              {providers?.localAuth && (
                <form onSubmit={handleLocalSubmit} className="space-y-4">
                  <AnimatePresence mode="wait">
                    {isRegister && (
                      <motion.div
                        key="name-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="relative">
                          <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Full name"
                            required
                            className="w-full pl-10 pr-4 py-3 text-sm bg-surface/50 border border-border rounded-card focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all placeholder:text-text-secondary/40"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      required
                      className="w-full pl-10 pr-4 py-3 text-sm bg-surface/50 border border-border rounded-card focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all placeholder:text-text-secondary/40"
                    />
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-surface/50 border border-border rounded-card focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all placeholder:text-text-secondary/40"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full justify-center gap-2 py-3"
                  >
                    {isRegister ? <UserPlus size={16} /> : <LogIn size={16} />}
                    {submitting
                      ? (isRegister ? 'Creating account...' : 'Signing in...')
                      : (isRegister ? 'Create Account' : 'Sign In')}
                  </Button>

                  {/* Divider */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex-1 h-px bg-border/50" />
                    <span className="text-xs text-text-secondary/60">
                      {isRegister ? 'Already have an account?' : 'New here?'}
                    </span>
                    <div className="flex-1 h-px bg-border/50" />
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsRegister(!isRegister)}
                    className="w-full py-2.5 text-sm font-medium text-primary hover:text-primary-hover border-2 border-primary/20 hover:border-primary/40 rounded-button transition-all bg-white/50 hover:bg-white/80"
                  >
                    {isRegister ? 'Sign in instead' : 'Create an account'}
                  </button>
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

      <Footer />
    </div>
  );
}
