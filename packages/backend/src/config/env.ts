import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Project root is 4 levels up from packages/backend/src/config/
const projectRoot = path.resolve(__dirname, '../../../../');

dotenv.config({ path: path.resolve(projectRoot, '.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://playbook:playbook@localhost:5432/playbook',
  contentDir: path.resolve(projectRoot, process.env.CONTENT_DIR || 'content'),
  activeTheme: process.env.ACTIVE_THEME || 'default',

  // JWT
  jwtSecret: (() => {
    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is required in production');
    }
    return secret || 'dev-secret-change-in-production';
  })(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  // OAuth
  oauthProvider: (process.env.OAUTH_PROVIDER || 'none') as 'microsoft' | 'google' | 'oidc' | 'none',
  oauthIssuerUrl: process.env.OAUTH_ISSUER_URL || '',
  oauthClientId: process.env.OAUTH_CLIENT_ID || '',
  oauthClientSecret: process.env.OAUTH_CLIENT_SECRET || '',
  oauthCallbackUrl: process.env.OAUTH_CALLBACK_URL || 'http://localhost:3001/api/auth/callback',
  oauthScopes: process.env.OAUTH_SCOPES || 'openid email profile',

  // Admin
  initialAdminEmail: process.env.INITIAL_ADMIN_EMAIL || '',

  // Dev auth bypass — only when env var explicitly set AND not in production
  devAuthBypass:
    process.env.DEV_AUTH_BYPASS === 'true' && process.env.NODE_ENV !== 'production',

  // App URL (frontend)
  appUrl: process.env.APP_URL || 'http://localhost:5173',
};
