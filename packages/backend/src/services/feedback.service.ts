import crypto from 'crypto';
import { pool } from '../config/database.js';
import type { ContentFeedback } from '@playbook/shared';

interface FeedbackFilters {
  module?: string;
  resolved?: boolean;
  course?: string;
}

export async function listFeedback(filters?: FeedbackFilters): Promise<ContentFeedback[]> {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIdx = 1;

  if (filters?.module) {
    conditions.push(`cf.module_slug = $${paramIdx++}`);
    params.push(filters.module);
  }
  if (filters?.course) {
    conditions.push(`cf.course_slug = $${paramIdx++}`);
    params.push(filters.course);
  }
  if (filters?.resolved !== undefined) {
    conditions.push(`cf.is_resolved = $${paramIdx++}`);
    params.push(filters.resolved);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT cf.id, cf.user_id, u.name as user_name, cf.course_slug, cf.module_slug,
            cf.lesson_slug, cf.feedback_text, cf.submitter_name, cf.rating, cf.is_resolved, cf.created_at
     FROM content_feedback cf
     LEFT JOIN users u ON cf.user_id = u.id
     ${whereClause}
     ORDER BY cf.created_at DESC`,
    params
  );

  return result.rows.map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    user_name: row.user_name || 'Unknown',
    course_slug: row.course_slug,
    module_slug: row.module_slug || '',
    lesson_slug: row.lesson_slug || '',
    feedback_text: row.feedback_text,
    submitter_name: row.submitter_name || null,
    rating: row.rating ?? null,
    is_resolved: row.is_resolved,
    created_at: row.created_at?.toISOString() || '',
  }));
}

export async function createFeedback(
  userId: string,
  courseSlug: string,
  text: string,
  submitterName?: string,
  rating?: number,
): Promise<ContentFeedback> {
  const id = crypto.randomUUID();
  await pool.query(
    `INSERT INTO content_feedback (id, user_id, course_slug, feedback_text, submitter_name, rating, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
    [id, userId, courseSlug, text, submitterName || null, rating ?? null]
  );

  const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
  return {
    id,
    user_id: userId,
    user_name: userResult.rows[0]?.name || 'Unknown',
    course_slug: courseSlug,
    module_slug: '',
    lesson_slug: '',
    feedback_text: text,
    submitter_name: submitterName || null,
    rating: rating ?? null,
    is_resolved: false,
    created_at: new Date().toISOString(),
  };
}

export async function resolveFeedback(id: string): Promise<void> {
  await pool.query('UPDATE content_feedback SET is_resolved = true WHERE id = $1', [id]);
}

export async function unresolveFeedback(id: string): Promise<void> {
  await pool.query('UPDATE content_feedback SET is_resolved = false WHERE id = $1', [id]);
}

export async function deleteFeedback(id: string): Promise<void> {
  await pool.query('DELETE FROM content_feedback WHERE id = $1', [id]);
}
