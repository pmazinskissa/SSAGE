import type { Request, Response, NextFunction } from 'express';
import type { AuthUser } from '@playbook/shared';
import { verifyToken, findUserById, getDevUser } from '../services/auth.service.js';
import { config } from '../config/env.js';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Dev bypass mode
  if (config.devAuthBypass) {
    req.user = getDevUser();
    return next();
  }

  const token = req.cookies?.session_token;
  if (!token) {
    return res.status(401).json({ error: { message: 'Authentication required' } });
  }

  try {
    const decoded = verifyToken(token);
    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: { message: 'User not found' } });
    }
    if (!user.is_active) {
      return res.status(403).json({ error: { message: 'Account deactivated' } });
    }
    req.user = { id: user.id, email: user.email, name: user.name, role: user.role };
    next();
  } catch {
    return res.status(401).json({ error: { message: 'Invalid or expired session' } });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'dev_admin')) {
    return res.status(403).json({ error: { message: 'Admin access required' } });
  }
  next();
}

export async function requireDevAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'dev_admin') {
    return res.status(403).json({ error: { message: 'Dev admin access required' } });
  }
  next();
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  // Dev bypass mode
  if (config.devAuthBypass) {
    req.user = getDevUser();
    return next();
  }

  const token = req.cookies?.session_token;
  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);
    const user = await findUserById(decoded.id);
    if (user && user.is_active) {
      req.user = { id: user.id, email: user.email, name: user.name, role: user.role };
    }
  } catch {
    // Token invalid — proceed without user
  }
  next();
}
