import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { AuthUser } from '@playbook/shared';
import { api } from '../lib/api';

interface Providers {
  oauth: string | null;
  devBypass: boolean;
  localAuth: boolean;
}

interface BackendHealth {
  reachable: boolean;
  dbConnected: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  providers: Providers | null;
  backendHealth: BackendHealth | null;
  login: () => void;
  devLogin: () => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  localLogin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  error: null,
  providers: null,
  backendHealth: null,
  login: () => {},
  devLogin: async () => {},
  register: async () => {},
  localLogin: async () => {},
  logout: async () => {},
});

const ERROR_MESSAGES: Record<string, string> = {
  missing_state: 'Authentication failed: missing state parameter.',
  invalid_state: 'Authentication session expired. Please try again.',
  auth_failed: 'Authentication failed. Please try again.',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<Providers | null>(null);
  const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Check for error from OAuth redirect
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(ERROR_MESSAGES[errorParam] || 'An authentication error occurred.');
      // Clear the error param from URL
      searchParams.delete('error');
      setSearchParams(searchParams, { replace: true });
    }

    // Load session + providers + health in parallel
    Promise.all([
      api.getMe().catch(() => null),
      api.getProviders().catch(() => null),
      api.getHealth(),
    ]).then(([me, prov, health]) => {
      if (me) setUser(me);
      if (prov) setProviders(prov);
      setBackendHealth({
        reachable: health.reachable,
        dbConnected: health.reachable ? (health as any).db ?? false : false,
      });
      setLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(() => {
    window.location.href = '/api/auth/login';
  }, []);

  const devLogin = useCallback(async () => {
    try {
      setError(null);
      const me = await api.devLogin();
      setUser(me);
    } catch (err: any) {
      setError(err.message || 'Dev login failed');
    }
  }, []);

  const register = useCallback(async (email: string, name: string, password: string) => {
    try {
      setError(null);
      const me = await api.register({ email, name, password });
      setUser(me);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  }, []);

  const localLogin = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      const me = await api.localLogin({ email, password });
      setUser(me);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
      setUser(null);
    } catch {
      // Clear user anyway
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, error, providers, backendHealth, login, devLogin, register, localLogin, logout }),
    [user, loading, error, providers, backendHealth, login, devLogin, register, localLogin, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
