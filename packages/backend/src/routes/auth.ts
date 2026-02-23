import { Router } from 'express';
import crypto from 'crypto';
import type { AuthUser } from '@playbook/shared';
import { config } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { signToken, ensureDevUserInDb, getDevUser, registerLocalUser, authenticateLocalUser } from '../services/auth.service.js';
import { findOrCreateOAuthUser } from '../services/auth.service.js';
import { isOAuthEnabled, buildAuthUrl, handleCallback } from '../services/oauth.service.js';

const router = Router();

// In-memory store for OAuth state + PKCE (sufficient for single-instance)
const pendingAuths = new Map<string, { codeVerifier: string; createdAt: number }>();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of pendingAuths) {
    if (now - entry.createdAt > 10 * 60 * 1000) {
      pendingAuths.delete(key);
    }
  }
}, 5 * 60 * 1000);

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'strict' as const,
  maxAge: 24 * 60 * 60 * 1000, // 24h
  path: '/',
};

// GET /api/auth/providers — available auth methods
router.get('/providers', (_req, res) => {
  // Local auth is available when no OAuth provider is configured (OAUTH_PROVIDER=none)
  const localAuth = !isOAuthEnabled() && !config.devAuthBypass;
  res.json({
    data: {
      oauth: isOAuthEnabled() ? config.oauthProvider : null,
      devBypass: config.devAuthBypass,
      localAuth,
    },
  });
});

// GET /api/auth/login — redirect to IdP
router.get('/login', async (req, res) => {
  // Dev bypass: auto-login
  if (config.devAuthBypass) {
    return res.redirect(`${config.appUrl}/login?dev=true`);
  }

  if (!isOAuthEnabled()) {
    return res.status(400).json({ error: { message: 'No OAuth provider configured' } });
  }

  const state = crypto.randomBytes(32).toString('hex');
  const codeVerifier = crypto.randomBytes(32).toString('hex');
  pendingAuths.set(state, { codeVerifier, createdAt: Date.now() });

  const authUrl = await buildAuthUrl(state, codeVerifier);
  res.redirect(authUrl);
});

// GET /api/auth/callback — OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const state = req.query.state as string;
    if (!state) {
      return res.redirect(`${config.appUrl}/login?error=missing_state`);
    }

    const pending = pendingAuths.get(state);
    if (!pending) {
      return res.redirect(`${config.appUrl}/login?error=invalid_state`);
    }
    pendingAuths.delete(state);

    const callbackUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
    const { email, name, sub } = await handleCallback(callbackUrl, state, pending.codeVerifier);

    const user = await findOrCreateOAuthUser({
      email,
      name,
      oauth_provider: config.oauthProvider,
      oauth_subject_id: sub,
    });

    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    res.cookie('session_token', token, COOKIE_OPTIONS);
    res.redirect(config.appUrl);
  } catch (err: any) {
    console.error('[Auth] OAuth callback error:', err.message);
    res.redirect(`${config.appUrl}/login?error=auth_failed`);
  }
});

// POST /api/auth/dev-login — dev bypass only
router.post('/dev-login', async (req, res) => {
  if (!config.devAuthBypass) {
    return res.status(403).json({ error: { message: 'Dev login not available' } });
  }

  try {
    const user = await ensureDevUserInDb();
    const authUser = { id: user.id, email: user.email, name: user.name, role: user.role };
    const token = signToken(authUser);
    res.cookie('session_token', token, COOKIE_OPTIONS);
    res.json({ data: authUser });
  } catch (err: any) {
    console.error('[Auth] Dev login error:', err.message);
    res.status(500).json({ error: { message: 'Failed to create dev session' } });
  }
});

// POST /api/auth/register — local registration
router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: { message: 'Email, name, and password are required' } });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: { message: 'Password must be at least 6 characters' } });
    }

    const user = await registerLocalUser({ email, name, password });
    const authUser: AuthUser = { id: user.id, email: user.email, name: user.name, role: user.role };
    const token = signToken(authUser);
    res.cookie('session_token', token, COOKIE_OPTIONS);
    res.json({ data: authUser });
  } catch (err: any) {
    console.error('[Auth] Register error:', err.message);
    res.status(400).json({ error: { message: err.message || 'Registration failed' } });
  }
});

// POST /api/auth/local-login — email/password login
router.post('/local-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: { message: 'Email and password are required' } });
    }

    const user = await authenticateLocalUser(email, password);
    const authUser: AuthUser = { id: user.id, email: user.email, name: user.name, role: user.role };
    const token = signToken(authUser);
    res.cookie('session_token', token, COOKIE_OPTIONS);
    res.json({ data: authUser });
  } catch (err: any) {
    console.error('[Auth] Local login error:', err.message);
    res.status(401).json({ error: { message: err.message || 'Login failed' } });
  }
});

// POST /api/auth/logout — clear session
router.post('/logout', (_req, res) => {
  res.clearCookie('session_token', { path: '/' });
  res.json({ data: { message: 'Logged out' } });
});

// GET /api/auth/me — current user (requires auth)
router.get('/me', requireAuth, (req, res) => {
  res.json({ data: req.user });
});

export default router;
