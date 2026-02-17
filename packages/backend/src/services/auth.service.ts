import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { config } from '../config/env.js';
import type { AuthUser, User } from '@playbook/shared';

export function signToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    config.jwtSecret,
    { subject: user.id, expiresIn: config.jwtExpiresIn as any }
  );
}

export function verifyToken(token: string): AuthUser {
  const payload = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload & AuthUser;
  return { id: payload.id, email: payload.email, name: payload.name, role: payload.role };
}

export async function findOrCreateOAuthUser(params: {
  email: string;
  name: string;
  oauth_provider: string;
  oauth_subject_id: string;
}): Promise<User> {
  const { email, name, oauth_provider, oauth_subject_id } = params;

  // Check for pre-enrollment
  const preEnrolled = await pool.query(
    'SELECT id FROM pre_enrolled_users WHERE email = $1',
    [email]
  );

  // Determine role: admin if matches INITIAL_ADMIN_EMAIL
  const role = config.initialAdminEmail && email.toLowerCase() === config.initialAdminEmail.toLowerCase()
    ? 'admin'
    : 'learner';

  // Upsert user
  const result = await pool.query(
    `INSERT INTO users (id, email, name, oauth_provider, oauth_subject_id, role, is_active, created_at, last_active_at)
     VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
     ON CONFLICT (email) DO UPDATE SET
       name = EXCLUDED.name,
       oauth_provider = EXCLUDED.oauth_provider,
       oauth_subject_id = EXCLUDED.oauth_subject_id,
       last_active_at = NOW()
     RETURNING *`,
    [crypto.randomUUID(), email, name, oauth_provider, oauth_subject_id, role]
  );

  // Remove pre-enrollment record if it existed
  if (preEnrolled.rows.length > 0) {
    await pool.query('DELETE FROM pre_enrolled_users WHERE email = $1', [email]);
  }

  return result.rows[0] as User;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return (result.rows[0] as User) || null;
}

const DEV_USER: AuthUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'dev@localhost',
  name: 'Dev User',
  role: 'admin',
};

export function getDevUser(): AuthUser {
  return DEV_USER;
}

export async function ensureDevUserInDb(): Promise<User> {
  const result = await pool.query(
    `INSERT INTO users (id, email, name, oauth_provider, oauth_subject_id, role, is_active, created_at, last_active_at)
     VALUES ($1, $2, $3, 'dev', 'dev', 'admin', true, NOW(), NOW())
     ON CONFLICT (email) DO UPDATE SET last_active_at = NOW()
     RETURNING *`,
    [DEV_USER.id, DEV_USER.email, DEV_USER.name]
  );
  return result.rows[0] as User;
}

export async function registerLocalUser(params: {
  email: string;
  name: string;
  password: string;
}): Promise<User> {
  const { email, name, password } = params;

  // Check if user already exists
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length > 0) {
    throw new Error('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Check if pre-enrolled (may have a role assigned)
  const preEnrolled = await pool.query('SELECT role FROM pre_enrolled_users WHERE email = $1', [email.toLowerCase()]);
  const preRole = preEnrolled.rows[0]?.role;

  // Determine role: initial admin email gets admin, pre-enrolled role, or learner
  let role = 'learner';
  if (config.initialAdminEmail && email.toLowerCase() === config.initialAdminEmail.toLowerCase()) {
    role = 'admin';
  } else if (preRole) {
    role = preRole;
  }

  const result = await pool.query(
    `INSERT INTO users (id, email, name, password_hash, role, is_active, created_at, last_active_at)
     VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
     RETURNING *`,
    [crypto.randomUUID(), email.toLowerCase(), name, passwordHash, role]
  );

  // Clean up pre-enrollment
  if (preEnrolled.rows.length > 0) {
    await pool.query('DELETE FROM pre_enrolled_users WHERE email = $1', [email.toLowerCase()]);
  }

  return result.rows[0] as User;
}

export async function authenticateLocalUser(email: string, password: string): Promise<User> {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  const user = result.rows[0];

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.password_hash) {
    throw new Error('This account uses SSO login. Please sign in with your identity provider.');
  }

  if (!user.is_active) {
    throw new Error('Account deactivated');
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  // Update last active
  await pool.query('UPDATE users SET last_active_at = NOW() WHERE id = $1', [user.id]);

  return user as User;
}
