import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requireAuth, requireAdmin } from './middleware/auth.js';
import healthRouter from './routes/health.js';
import themesRouter from './routes/themes.js';
import coursesRouter from './routes/courses.js';
import authRouter from './routes/auth.js';
import progressRouter from './routes/progress.js';
import adminRouter from './routes/admin.js';
import aiRouter from './routes/ai.js';
import feedbackRouter from './routes/feedback.js';
import reviewRouter from './routes/review.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));
  app.use(cors({ origin: config.appUrl, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(requestLogger);

  // Rate limiting
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { message: 'Too many requests, please try again later' } },
  });

  const generalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { message: 'Too many requests, please try again later' } },
  });

  app.use('/api/', generalLimiter);
  app.use('/api/auth/local-login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // Public routes
  app.use('/api/health', healthRouter);
  app.use('/api/themes', themesRouter);
  app.use('/api/auth', authRouter);

  // Authenticated routes
  app.use('/api/courses', requireAuth, coursesRouter);
  app.use('/api/progress', requireAuth, progressRouter);

  // AI routes (authenticated)
  app.use('/api/ai', requireAuth, aiRouter);

  // Feedback route (any authenticated user)
  app.use('/api/feedback', requireAuth, feedbackRouter);

  // Review annotations (authenticated, export requires admin)
  app.use('/api/review', requireAuth, reviewRouter);

  // Admin routes
  app.use('/api/admin', requireAuth, requireAdmin, adminRouter);

  // Catch-all for unknown /api/* routes — return JSON 404 instead of HTML
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: { message: 'Not found' } });
  });

  // Serve static frontend in production
  const frontendDist = path.resolve(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });

  app.use(errorHandler);

  return app;
}
