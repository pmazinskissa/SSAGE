import crypto from 'crypto';
import { pool } from '../config/database.js';
import { getCourseNavTree, listCourses } from './content.service.js';
import type { UserWithProgress, UserDetail, DashboardMetrics, UserWithModuleAnalytics, UserModuleProgress, CourseEnrollment } from '@playbook/shared';

export async function listUsers(): Promise<UserWithProgress[]> {
  const usersResult = await pool.query(
    'SELECT * FROM users ORDER BY created_at DESC'
  );

  const userIds = usersResult.rows.map((r: any) => r.id);
  if (userIds.length === 0) return [];

  const cpResult = await pool.query(
    `SELECT user_id, course_slug, status, total_time_seconds, completed_at
     FROM course_progress WHERE user_id = ANY($1::uuid[])`,
    [userIds]
  );

  const cpMap = new Map<string, any[]>();
  for (const cp of cpResult.rows) {
    const list = cpMap.get(cp.user_id) || [];
    list.push(cp);
    cpMap.set(cp.user_id, list);
  }

  return usersResult.rows.map((row: any) => ({
    ...row,
    created_at: row.created_at?.toISOString() || '',
    last_active_at: row.last_active_at?.toISOString() || '',
    course_progress: (cpMap.get(row.id) || []).map((cp: any) => ({
      course_slug: cp.course_slug,
      status: cp.status,
      total_time_seconds: cp.total_time_seconds || 0,
      completed_at: cp.completed_at?.toISOString() || null,
    })),
  }));
}

export async function getUserDetail(userId: string): Promise<UserDetail | null> {
  const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  if (userResult.rows.length === 0) return null;

  const user = userResult.rows[0];

  const lpResult = await pool.query(
    'SELECT course_slug, module_slug, lesson_slug, status, time_spent_seconds, first_viewed_at, completed_at FROM lesson_progress WHERE user_id = $1',
    [userId]
  );

  const kcResult = await pool.query(
    `SELECT course_slug, module_slug,
            COUNT(*)::int as total_questions,
            SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::int as correct_answers,
            MAX(attempted_at) as attempted_at
     FROM knowledge_check_results WHERE user_id = $1
     GROUP BY course_slug, module_slug`,
    [userId]
  );

  const cpResult = await pool.query(
    'SELECT * FROM course_progress WHERE user_id = $1',
    [userId]
  );

  const enrollments = await getEnrollmentsForEmail(user.email);

  return {
    ...user,
    created_at: user.created_at?.toISOString() || '',
    last_active_at: user.last_active_at?.toISOString() || '',
    lesson_progress: lpResult.rows.map((row: any) => ({
      course_slug: row.course_slug,
      module_slug: row.module_slug,
      lesson_slug: row.lesson_slug,
      status: row.status,
      time_spent_seconds: row.time_spent_seconds || 0,
      first_viewed_at: row.first_viewed_at?.toISOString() || null,
      completed_at: row.completed_at?.toISOString() || null,
    })),
    knowledge_check_scores: kcResult.rows.map((row: any) => ({
      course_slug: row.course_slug,
      module_slug: row.module_slug,
      total_questions: row.total_questions,
      correct_answers: row.correct_answers,
      score: row.total_questions > 0 ? Math.round((row.correct_answers / row.total_questions) * 100) : 0,
      attempted_at: row.attempted_at?.toISOString() || '',
    })),
    course_progress: cpResult.rows.map((cp: any) => ({
      course_slug: cp.course_slug,
      status: cp.status,
      current_module_slug: cp.current_module_slug,
      current_lesson_slug: cp.current_lesson_slug,
      started_at: cp.started_at?.toISOString() || null,
      completed_at: cp.completed_at?.toISOString() || null,
      total_time_seconds: cp.total_time_seconds || 0,
      lessons: [],
      knowledge_checks: [],
    })),
    enrollments,
  };
}

export async function updateUserRole(userId: string, role: 'learner' | 'admin' | 'dev_admin'): Promise<void> {
  await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);
}

export async function deactivateUser(userId: string): Promise<void> {
  await pool.query('UPDATE users SET is_active = false WHERE id = $1', [userId]);
}

export async function activateUser(userId: string): Promise<void> {
  await pool.query('UPDATE users SET is_active = true WHERE id = $1', [userId]);
}

export async function deleteUser(userId: string): Promise<void> {
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
}

export async function bulkDeleteUsers(userIds: string[]): Promise<void> {
  if (userIds.length === 0) return;
  await pool.query('DELETE FROM users WHERE id = ANY($1::uuid[])', [userIds]);
}

export async function bulkDeactivateUsers(userIds: string[]): Promise<void> {
  if (userIds.length === 0) return;
  await pool.query('UPDATE users SET is_active = false WHERE id = ANY($1::uuid[])', [userIds]);
}

export async function bulkActivateUsers(userIds: string[]): Promise<void> {
  if (userIds.length === 0) return;
  await pool.query('UPDATE users SET is_active = true WHERE id = ANY($1::uuid[])', [userIds]);
}

export async function bulkEnrollUsers(emails: string[], courseSlugs: string[], enrolledBy: string): Promise<void> {
  for (const email of emails) {
    for (const slug of courseSlugs) {
      await pool.query(
        `INSERT INTO course_enrollments (id, email, course_slug, enrolled_at, enrolled_by)
         VALUES ($1, $2, $3, NOW(), $4)
         ON CONFLICT (email, course_slug) DO NOTHING`,
        [crypto.randomUUID(), email.toLowerCase(), slug, enrolledBy]
      );
    }
  }
}

export async function bulkUnenrollUsers(emails: string[], courseSlug: string): Promise<void> {
  if (emails.length === 0) return;
  await pool.query(
    'DELETE FROM course_enrollments WHERE email = ANY($1) AND course_slug = $2',
    [emails.map((e) => e.toLowerCase()), courseSlug]
  );
}

export async function updateUserProfile(userId: string, name: string, email: string): Promise<void> {
  const current = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
  if (current.rows.length === 0) throw new Error('User not found');
  const oldEmail = current.rows[0].email;

  if (email.toLowerCase() !== oldEmail.toLowerCase()) {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email.toLowerCase(), userId]);
    if (existing.rows.length > 0) throw new Error('Email already in use');
  }

  await pool.query('UPDATE users SET name = $1, email = $2 WHERE id = $3', [name, email.toLowerCase(), userId]);

  if (email.toLowerCase() !== oldEmail.toLowerCase()) {
    await pool.query('UPDATE course_enrollments SET email = $1 WHERE email = $2', [email.toLowerCase(), oldEmail.toLowerCase()]);
  }
}

export async function listPreEnrolledUsers(): Promise<{ id: string; email: string; name: string; role: string; enrolled_at: string; enrolled_by: string | null }[]> {
  const result = await pool.query(
    'SELECT id, email, name, role, enrolled_at, enrolled_by FROM pre_enrolled_users ORDER BY enrolled_at DESC'
  );
  return result.rows.map((row: any) => ({
    id: row.id,
    email: row.email,
    name: row.name || '',
    role: row.role,
    enrolled_at: row.enrolled_at?.toISOString() || '',
    enrolled_by: row.enrolled_by,
  }));
}

export async function deletePreEnrolledUser(id: string): Promise<void> {
  await pool.query('DELETE FROM pre_enrolled_users WHERE id = $1', [id]);
}

export async function preEnrollUsers(
  entries: { name: string; email: string; role: 'learner' | 'admin' | 'dev_admin'; courses?: string[] }[],
  enrolledBy: string,
): Promise<{ added: number; skipped: number }> {
  let added = 0;
  let skipped = 0;

  for (const entry of entries) {
    const email = entry.email.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      skipped++;
      continue;
    }

    const name = entry.name?.trim() || '';
    const role = entry.role === 'admin' ? 'admin' : entry.role === 'dev_admin' ? 'dev_admin' : 'learner';

    // Skip if user already exists
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (existing.rows.length > 0) {
      // Still enroll in courses even if user exists
      if (entry.courses && entry.courses.length > 0) {
        await enrollUserInCourses(email, entry.courses, enrolledBy);
      }
      skipped++;
      continue;
    }

    // Skip if already pre-enrolled
    const preExisting = await pool.query(
      'SELECT id FROM pre_enrolled_users WHERE email = $1',
      [email]
    );
    if (preExisting.rows.length > 0) {
      // Still enroll in courses even if already pre-enrolled
      if (entry.courses && entry.courses.length > 0) {
        await enrollUserInCourses(email, entry.courses, enrolledBy);
      }
      skipped++;
      continue;
    }

    await pool.query(
      'INSERT INTO pre_enrolled_users (id, email, name, role, enrolled_at, enrolled_by) VALUES ($1, $2, $3, $4, NOW(), $5)',
      [crypto.randomUUID(), email, name, role, enrolledBy]
    );

    // Create course enrollments
    if (entry.courses && entry.courses.length > 0) {
      await enrollUserInCourses(email, entry.courses, enrolledBy);
    }

    added++;
  }

  return { added, skipped };
}

// --- Course Enrollments ---

export async function getEnrollmentsForEmail(email: string): Promise<CourseEnrollment[]> {
  const result = await pool.query(
    'SELECT id, email, course_slug, enrolled_at, enrolled_by FROM course_enrollments WHERE email = $1 ORDER BY enrolled_at DESC',
    [email.toLowerCase()]
  );
  return result.rows.map((row: any) => ({
    id: row.id,
    email: row.email,
    course_slug: row.course_slug,
    enrolled_at: row.enrolled_at?.toISOString() || '',
    enrolled_by: row.enrolled_by,
  }));
}

export async function enrollUserInCourses(email: string, courseSlugs: string[], enrolledBy: string): Promise<void> {
  for (const slug of courseSlugs) {
    await pool.query(
      `INSERT INTO course_enrollments (id, email, course_slug, enrolled_at, enrolled_by)
       VALUES ($1, $2, $3, NOW(), $4)
       ON CONFLICT (email, course_slug) DO NOTHING`,
      [crypto.randomUUID(), email.toLowerCase(), slug, enrolledBy]
    );
  }
}

export async function unenrollUserFromCourse(email: string, courseSlug: string): Promise<void> {
  await pool.query(
    'DELETE FROM course_enrollments WHERE email = $1 AND course_slug = $2',
    [email.toLowerCase(), courseSlug]
  );
}

export async function getDashboardMetrics(courseSlug?: string, userId?: string): Promise<DashboardMetrics> {
  // Total enrolled = users + pre_enrolled_users (always aggregate)
  const usersCount = await pool.query('SELECT COUNT(*)::int as count FROM users');
  const preEnrolledCount = await pool.query('SELECT COUNT(*)::int as count FROM pre_enrolled_users');
  const totalUsers = usersCount.rows[0].count + preEnrolledCount.rows[0].count;

  // Build dynamic WHERE conditions for status breakdown
  const statusConditions: string[] = [];
  const statusParams: any[] = [];
  let paramIdx = 1;
  if (courseSlug) { statusConditions.push(`course_slug = $${paramIdx++}`); statusParams.push(courseSlug); }
  if (userId) { statusConditions.push(`user_id = $${paramIdx++}`); statusParams.push(userId); }
  const statusWhere = statusConditions.length > 0 ? `WHERE ${statusConditions.join(' AND ')}` : '';

  const statusResult = await pool.query(
    `SELECT status, COUNT(*)::int as count FROM course_progress ${statusWhere} GROUP BY status`,
    statusParams
  );
  const statusMap: Record<string, number> = {};
  for (const row of statusResult.rows) {
    statusMap[row.status] = row.count;
  }
  const completed = statusMap['completed'] || 0;
  const inProgress = statusMap['in_progress'] || 0;
  const withProgress = completed + inProgress + (statusMap['not_started'] || 0);
  const denominator = userId ? 1 : totalUsers;
  const notStarted = Math.max(0, denominator - withProgress) + (statusMap['not_started'] || 0);

  // Average time to completion
  const avgTimeConditions: string[] = ["status = 'completed'"];
  const avgTimeParams: any[] = [];
  let atIdx = 1;
  if (courseSlug) { avgTimeConditions.push(`course_slug = $${atIdx++}`); avgTimeParams.push(courseSlug); }
  if (userId) { avgTimeConditions.push(`user_id = $${atIdx++}`); avgTimeParams.push(userId); }
  const avgTimeResult = await pool.query(
    `SELECT COALESCE(AVG(total_time_seconds), 0)::int as avg_time FROM course_progress WHERE ${avgTimeConditions.join(' AND ')}`,
    avgTimeParams
  );
  const avgTime = avgTimeResult.rows[0].avg_time;

  // Average completion % — per-module averaging
  const courses = listCourses();
  const targetSlug = courseSlug || courses[0]?.slug;
  const navTree = targetSlug ? getCourseNavTree(targetSlug) : null;

  const activeUsersCount = userId ? 1 : usersCount.rows[0].count;

  let avgCompletionPct = 0;
  if (navTree && navTree.modules.length > 0 && activeUsersCount > 0) {
    const lpConditions: string[] = ["status = 'completed'"];
    const lpParams: any[] = [];
    let lpIdx = 1;
    if (targetSlug) { lpConditions.push(`course_slug = $${lpIdx++}`); lpParams.push(targetSlug); }
    if (userId) { lpConditions.push(`user_id = $${lpIdx++}`); lpParams.push(userId); }

    const lpResult = await pool.query(
      `SELECT user_id, module_slug, COUNT(*)::int as completed
       FROM lesson_progress WHERE ${lpConditions.join(' AND ')}
       GROUP BY user_id, module_slug`,
      lpParams
    );

    const userModules: Record<string, Record<string, number>> = {};
    for (const row of lpResult.rows) {
      if (!userModules[row.user_id]) userModules[row.user_id] = {};
      userModules[row.user_id][row.module_slug] = row.completed;
    }

    const moduleTotals: Record<string, number> = {};
    for (const mod of navTree.modules) {
      moduleTotals[mod.slug] = mod.lessons.length;
    }

    let totalUserPct = 0;
    for (const _userId of Object.keys(userModules)) {
      let moduleSum = 0;
      for (const mod of navTree.modules) {
        const completedCount = userModules[_userId][mod.slug] || 0;
        const total = moduleTotals[mod.slug] || 1;
        moduleSum += Math.min(completedCount / total, 1) * 100;
      }
      totalUserPct += moduleSum / navTree.modules.length;
    }

    avgCompletionPct = Math.round(totalUserPct / activeUsersCount) || 0;
  }

  // Knowledge check score
  const kcConditions: string[] = [];
  const kcParams: any[] = [];
  let kcIdx = 1;
  if (courseSlug) { kcConditions.push(`course_slug = $${kcIdx++}`); kcParams.push(courseSlug); }
  if (userId) { kcConditions.push(`user_id = $${kcIdx++}`); kcParams.push(userId); }
  const kcWhere = kcConditions.length > 0 ? `WHERE ${kcConditions.join(' AND ')}` : '';

  const kcScoreResult = await pool.query(
    `SELECT AVG(score)::int as avg_score FROM (
      SELECT user_id,
        ROUND(SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100) as score
      FROM knowledge_check_results
      ${kcWhere}
      GROUP BY user_id
    ) sub`,
    kcParams
  );
  const avgKcScore = kcScoreResult.rows[0]?.avg_score || 0;

  // Module funnel
  const moduleFunnel: DashboardMetrics['module_funnel'] = [];
  if (navTree && activeUsersCount > 0) {
    for (const mod of navTree.modules) {
      const funnelParams: any[] = [mod.slug];
      let funnelIdx = 2;
      const funnelExtra: string[] = [];
      if (targetSlug) { funnelExtra.push(`course_slug = $${funnelIdx++}`); funnelParams.push(targetSlug); }
      if (userId) { funnelExtra.push(`user_id = $${funnelIdx++}`); funnelParams.push(userId); }
      const extraWhere = funnelExtra.length > 0 ? `AND ${funnelExtra.join(' AND ')}` : '';

      const modResult = await pool.query(
        `SELECT user_id, COUNT(*)::int as completed_count FROM lesson_progress
         WHERE module_slug = $1 AND status = 'completed' ${extraWhere}
         GROUP BY user_id`,
        funnelParams
      );
      const totalModLessons = mod.lessons.length || 1;
      const sumPct = modResult.rows.reduce(
        (sum: number, row: any) => sum + Math.min(row.completed_count / totalModLessons, 1) * 100,
        0
      );
      moduleFunnel.push({
        module_slug: mod.slug,
        module_title: mod.title,
        completion_pct: Math.round(sumPct / activeUsersCount),
      });
    }
  }

  return {
    total_users: totalUsers,
    completed,
    in_progress: inProgress,
    not_started: notStarted,
    avg_completion_pct: avgCompletionPct,
    avg_time_to_completion_seconds: avgTime,
    avg_kc_score: avgKcScore,
    module_funnel: moduleFunnel,
  };
}

export async function getUsersWithModuleProgress(courseSlug: string): Promise<UserWithModuleAnalytics[]> {
  const navTree = getCourseNavTree(courseSlug);
  if (!navTree) return [];

  const modules = navTree.modules.map((m) => ({
    slug: m.slug,
    title: m.title,
    lessonCount: m.lessons.length,
  }));

  const usersResult = await pool.query('SELECT id, name, email, role FROM users ORDER BY name ASC');
  const userIds = usersResult.rows.map((r: any) => r.id);
  if (userIds.length === 0) return [];

  const [cpResult, lpResult, kcResult] = await Promise.all([
    pool.query(
      'SELECT user_id, status, total_time_seconds FROM course_progress WHERE user_id = ANY($1::uuid[]) AND course_slug = $2',
      [userIds, courseSlug]
    ),
    pool.query(
      `SELECT user_id, module_slug,
              COUNT(*) FILTER (WHERE status = 'completed')::int as completed,
              COALESCE(SUM(time_spent_seconds), 0)::int as time_seconds
       FROM lesson_progress
       WHERE user_id = ANY($1::uuid[]) AND course_slug = $2
       GROUP BY user_id, module_slug`,
      [userIds, courseSlug]
    ),
    pool.query(
      `SELECT user_id, module_slug,
              COUNT(*)::int as total,
              SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::int as correct
       FROM knowledge_check_results
       WHERE user_id = ANY($1::uuid[]) AND course_slug = $2
       GROUP BY user_id, module_slug`,
      [userIds, courseSlug]
    ),
  ]);

  const cpMap = new Map<string, any>();
  for (const row of cpResult.rows) {
    cpMap.set(row.user_id, row);
  }

  const lpMap = new Map<string, Record<string, { completed: number; time_seconds: number }>>();
  for (const row of lpResult.rows) {
    if (!lpMap.has(row.user_id)) lpMap.set(row.user_id, {});
    lpMap.get(row.user_id)![row.module_slug] = { completed: row.completed, time_seconds: row.time_seconds };
  }

  const kcMap = new Map<string, Record<string, { total: number; correct: number }>>();
  for (const row of kcResult.rows) {
    if (!kcMap.has(row.user_id)) kcMap.set(row.user_id, {});
    kcMap.get(row.user_id)![row.module_slug] = { total: row.total, correct: row.correct };
  }

  return usersResult.rows.map((user: any) => {
    const cp = cpMap.get(user.id);
    const userLp = lpMap.get(user.id) || {};
    const userKc = kcMap.get(user.id) || {};

    const moduleProgress: UserModuleProgress[] = modules.map((m) => {
      const lp = userLp[m.slug];
      const kc = userKc[m.slug];
      return {
        module_slug: m.slug,
        module_title: m.title,
        lessons_completed: lp?.completed || 0,
        total_lessons: m.lessonCount,
        time_spent_seconds: lp?.time_seconds || 0,
        kc_score: kc && kc.total > 0 ? Math.round((kc.correct / kc.total) * 100) : null,
      };
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: cp?.status || 'not_started',
      total_time_seconds: cp?.total_time_seconds || 0,
      modules: moduleProgress,
    };
  });
}

export async function exportUsersCSV(courseSlug?: string): Promise<string> {
  // Fetch users + course progress in batch (same as listUsers but inline to avoid double query)
  const usersResult = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
  const userIds = usersResult.rows.map((r: any) => r.id);

  if (userIds.length === 0) return '"Name","Email","Role","Status","Total Time (min)","Enrolled","Last Active"';

  const cpResult = await pool.query(
    `SELECT user_id, course_slug, status, total_time_seconds, completed_at
     FROM course_progress WHERE user_id = ANY($1::uuid[])`,
    [userIds]
  );
  const cpMap = new Map<string, any[]>();
  for (const cp of cpResult.rows) {
    const list = cpMap.get(cp.user_id) || [];
    list.push(cp);
    cpMap.set(cp.user_id, list);
  }

  // If a course is specified, get its nav tree for per-module columns
  let modules: { slug: string; title: string; lessonCount: number }[] = [];
  let lpMap = new Map<string, Record<string, { completed: number; time_seconds: number }>>();
  let kcMap = new Map<string, Record<string, { total: number; correct: number }>>();

  if (courseSlug) {
    const navTree = getCourseNavTree(courseSlug);
    if (navTree) {
      modules = navTree.modules.map((m) => ({
        slug: m.slug,
        title: m.title,
        lessonCount: m.lessons.length,
      }));
    }

    if (modules.length > 0) {
      const [lpResult, kcResult] = await Promise.all([
        pool.query(
          `SELECT user_id, module_slug,
                  COUNT(*) FILTER (WHERE status = 'completed')::int as completed,
                  COALESCE(SUM(time_spent_seconds), 0)::int as time_seconds
           FROM lesson_progress
           WHERE user_id = ANY($1::uuid[]) AND course_slug = $2
           GROUP BY user_id, module_slug`,
          [userIds, courseSlug]
        ),
        pool.query(
          `SELECT user_id, module_slug,
                  COUNT(*)::int as total,
                  SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::int as correct
           FROM knowledge_check_results
           WHERE user_id = ANY($1::uuid[]) AND course_slug = $2
           GROUP BY user_id, module_slug`,
          [userIds, courseSlug]
        ),
      ]);

      for (const row of lpResult.rows) {
        if (!lpMap.has(row.user_id)) lpMap.set(row.user_id, {});
        lpMap.get(row.user_id)![row.module_slug] = { completed: row.completed, time_seconds: row.time_seconds };
      }
      for (const row of kcResult.rows) {
        if (!kcMap.has(row.user_id)) kcMap.set(row.user_id, {});
        kcMap.get(row.user_id)![row.module_slug] = { total: row.total, correct: row.correct };
      }
    }
  }

  // Build header
  const baseHeaders = ['Name', 'Email', 'Role', 'Status', 'Total Time (min)', 'Enrolled', 'Last Active'];
  const moduleHeaders = modules.flatMap((m) => [
    `${m.title} - Status`,
    `${m.title} - Lessons Completed`,
    `${m.title} - Time (min)`,
    `${m.title} - KC Score %`,
  ]);
  const header = [...baseHeaders, ...moduleHeaders].map((h) => `"${h}"`).join(',');

  // Build rows
  const rows: string[] = [];
  for (const u of usersResult.rows) {
    const userCp = cpMap.get(u.id) || [];
    const cp = courseSlug
      ? userCp.find((p: any) => p.course_slug === courseSlug)
      : userCp[0];
    const status = cp?.status || 'not_started';
    const totalTime = Math.round((cp?.total_time_seconds || 0) / 60);

    const baseCols = [
      u.name,
      u.email,
      u.role,
      status,
      String(totalTime),
      u.created_at?.toISOString() || '',
      u.last_active_at?.toISOString() || '',
    ];

    let moduleCols: string[] = [];
    if (courseSlug && modules.length > 0) {
      const userLp = lpMap.get(u.id) || {};
      const userKc = kcMap.get(u.id) || {};

      moduleCols = modules.flatMap((m) => {
        const lp = userLp[m.slug];
        const kc = userKc[m.slug];
        const lessonsCompleted = lp?.completed || 0;
        const moduleStatus = lessonsCompleted >= m.lessonCount ? 'completed' : lessonsCompleted > 0 ? 'in_progress' : 'not_started';
        const timeMin = Math.round((lp?.time_seconds || 0) / 60);
        const kcScore = kc && kc.total > 0 ? Math.round((kc.correct / kc.total) * 100) : '';
        return [moduleStatus, `${lessonsCompleted}/${m.lessonCount}`, String(timeMin), String(kcScore)];
      });
    }

    const allCols = [...baseCols, ...moduleCols].map((c) => `"${c}"`).join(',');
    rows.push(allCols);
  }

  return [header, ...rows].join('\n');
}
