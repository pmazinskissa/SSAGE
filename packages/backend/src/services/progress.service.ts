import crypto from 'crypto';
import { pool } from '../config/database.js';
import { getCourseNavTree } from './content.service.js';
import type { CourseProgress, LessonProgressEntry, KnowledgeCheckSummaryEntry } from '@playbook/shared';

/** Idempotently add engagement columns to lesson_progress (run once on startup). */
export async function ensureEngagementColumns(): Promise<void> {
  await pool.query(`
    ALTER TABLE lesson_progress
      ADD COLUMN IF NOT EXISTS active_time_seconds INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS max_scroll_depth SMALLINT DEFAULT 0
  `);
}

export async function getCourseProgress(userId: string, courseSlug: string): Promise<CourseProgress | null> {
  // Course-level progress
  const cpResult = await pool.query(
    'SELECT * FROM course_progress WHERE user_id = $1 AND course_slug = $2',
    [userId, courseSlug]
  );

  if (cpResult.rows.length === 0) {
    return null;
  }

  const cp = cpResult.rows[0];

  // Lesson progress
  const lpResult = await pool.query(
    'SELECT module_slug, lesson_slug, status, time_spent_seconds, active_time_seconds, max_scroll_depth, first_viewed_at, completed_at FROM lesson_progress WHERE user_id = $1 AND course_slug = $2',
    [userId, courseSlug]
  );

  const lessons: LessonProgressEntry[] = lpResult.rows.map((row: any) => ({
    module_slug: row.module_slug,
    lesson_slug: row.lesson_slug,
    status: row.status,
    time_spent_seconds: row.time_spent_seconds || 0,
    active_time_seconds: row.active_time_seconds ?? 0,
    max_scroll_depth: row.max_scroll_depth ?? 0,
    first_viewed_at: row.first_viewed_at?.toISOString() || null,
    completed_at: row.completed_at?.toISOString() || null,
  }));

  // Knowledge check summaries (aggregated per module)
  const kcResult = await pool.query(
    `SELECT module_slug,
            COUNT(*)::int as total_questions,
            SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::int as correct_answers,
            MAX(attempted_at) as attempted_at
     FROM knowledge_check_results
     WHERE user_id = $1 AND course_slug = $2
     GROUP BY module_slug`,
    [userId, courseSlug]
  );

  const knowledge_checks: KnowledgeCheckSummaryEntry[] = kcResult.rows.map((row: any) => ({
    module_slug: row.module_slug,
    total_questions: row.total_questions,
    correct_answers: row.correct_answers,
    score: row.total_questions > 0 ? Math.round((row.correct_answers / row.total_questions) * 100) : 0,
    attempted_at: row.attempted_at?.toISOString() || '',
  }));

  return {
    course_slug: courseSlug,
    status: cp.status,
    current_module_slug: cp.current_module_slug,
    current_lesson_slug: cp.current_lesson_slug,
    started_at: cp.started_at?.toISOString() || null,
    completed_at: cp.completed_at?.toISOString() || null,
    total_time_seconds: cp.total_time_seconds || 0,
    lessons,
    knowledge_checks,
  };
}

export async function recordLessonView(
  userId: string,
  courseSlug: string,
  moduleSlug: string,
  lessonSlug: string
): Promise<void> {
  // Upsert lesson_progress as in_progress
  await pool.query(
    `INSERT INTO lesson_progress (id, user_id, course_slug, module_slug, lesson_slug, status, time_spent_seconds, active_time_seconds, max_scroll_depth, first_viewed_at)
     VALUES ($1, $2, $3, $4, $5, 'in_progress', 0, 0, 0, NOW())
     ON CONFLICT (user_id, course_slug, module_slug, lesson_slug) DO NOTHING`,
    [crypto.randomUUID(), userId, courseSlug, moduleSlug, lessonSlug]
  );

  // Upsert course_progress
  await pool.query(
    `INSERT INTO course_progress (id, user_id, course_slug, current_module_slug, current_lesson_slug, status, started_at, total_time_seconds)
     VALUES ($1, $2, $3, $4, $5, 'in_progress', NOW(), 0)
     ON CONFLICT (user_id, course_slug) DO UPDATE SET
       current_module_slug = $4,
       current_lesson_slug = $5,
       status = CASE WHEN course_progress.status = 'not_started' THEN 'in_progress' ELSE course_progress.status END`,
    [crypto.randomUUID(), userId, courseSlug, moduleSlug, lessonSlug]
  );
}

export async function updateTimeOnTask(
  userId: string,
  courseSlug: string,
  moduleSlug: string,
  lessonSlug: string,
  deltaSeconds: number,
  activeDeltaSeconds?: number,
  scrollDepth?: number
): Promise<void> {
  // Cap deltas to prevent inflation
  const cappedDelta = Math.min(Math.max(deltaSeconds, 0), 120);
  const cappedActiveDelta = Math.min(Math.max(activeDeltaSeconds ?? deltaSeconds, 0), 120);
  const clampedScrollDepth = scrollDepth != null ? Math.min(Math.max(Math.round(scrollDepth), 0), 100) : null;

  await pool.query(
    `UPDATE lesson_progress
     SET time_spent_seconds = time_spent_seconds + $1,
         active_time_seconds = active_time_seconds + $2,
         max_scroll_depth = GREATEST(max_scroll_depth, COALESCE($3, max_scroll_depth))
     WHERE user_id = $4 AND course_slug = $5 AND module_slug = $6 AND lesson_slug = $7`,
    [cappedDelta, cappedActiveDelta, clampedScrollDepth, userId, courseSlug, moduleSlug, lessonSlug]
  );

  await pool.query(
    `UPDATE course_progress
     SET total_time_seconds = total_time_seconds + $1
     WHERE user_id = $2 AND course_slug = $3`,
    [cappedDelta, userId, courseSlug]
  );

  // Update user last_active_at
  await pool.query(
    'UPDATE users SET last_active_at = NOW() WHERE id = $1',
    [userId]
  );
}

export async function completeLessonAndCheck(
  userId: string,
  courseSlug: string,
  moduleSlug: string,
  lessonSlug: string
): Promise<{ courseCompleted: boolean }> {
  // Mark lesson completed
  await pool.query(
    `UPDATE lesson_progress SET status = 'completed', completed_at = NOW()
     WHERE user_id = $1 AND course_slug = $2 AND module_slug = $3 AND lesson_slug = $4
       AND status != 'completed'`,
    [userId, courseSlug, moduleSlug, lessonSlug]
  );

  // Check if course is completed (all lessons done)
  return await checkCourseCompletion(userId, courseSlug);
}

export async function saveKnowledgeCheckResults(
  userId: string,
  courseSlug: string,
  moduleSlug: string,
  answers: { question_id: string; selected_answer: string; is_correct: boolean }[]
): Promise<{ courseCompleted: boolean }> {
  // Delete previous attempts for this module
  await pool.query(
    'DELETE FROM knowledge_check_results WHERE user_id = $1 AND course_slug = $2 AND module_slug = $3',
    [userId, courseSlug, moduleSlug]
  );

  // Insert new results
  for (const answer of answers) {
    await pool.query(
      `INSERT INTO knowledge_check_results (id, user_id, course_slug, module_slug, question_id, selected_answer, is_correct, attempted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [crypto.randomUUID(), userId, courseSlug, moduleSlug, answer.question_id, answer.selected_answer, answer.is_correct]
    );
  }

  // KC completion = module completion per spec; check course completion
  return await checkCourseCompletion(userId, courseSlug);
}

async function checkCourseCompletion(userId: string, courseSlug: string): Promise<{ courseCompleted: boolean }> {
  // Get actual total lessons from course content
  const navTree = getCourseNavTree(courseSlug);
  const totalLessons = navTree?.total_lessons || 0;
  if (totalLessons === 0) return { courseCompleted: false };

  const completedResult = await pool.query(
    `SELECT COUNT(*)::int as completed FROM lesson_progress WHERE user_id = $1 AND course_slug = $2 AND status = 'completed'`,
    [userId, courseSlug]
  );

  const completed = completedResult.rows[0]?.completed || 0;

  if (completed >= totalLessons) {
    await pool.query(
      `UPDATE course_progress SET status = 'completed', completed_at = NOW()
       WHERE user_id = $1 AND course_slug = $2 AND status != 'completed'`,
      [userId, courseSlug]
    );
    return { courseCompleted: true };
  }

  return { courseCompleted: false };
}
