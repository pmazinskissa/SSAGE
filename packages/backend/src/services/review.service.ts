import crypto from 'crypto';
import { pool } from '../config/database.js';
import type { ReviewAnnotation } from '@playbook/shared';

export async function createAnnotation(
  userId: string,
  pagePath: string,
  text: string,
  pageTitle?: string,
  annotationType?: string,
): Promise<ReviewAnnotation> {
  const id = crypto.randomUUID();
  const type = annotationType || 'general';

  await pool.query(
    `INSERT INTO review_annotations (id, user_id, page_path, page_title, annotation_text, annotation_type, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
    [id, userId, pagePath, pageTitle || null, text, type]
  );

  const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);

  return {
    id,
    user_id: userId,
    user_name: userResult.rows[0]?.name || 'Unknown',
    page_path: pagePath,
    page_title: pageTitle || null,
    annotation_text: text,
    annotation_type: type as ReviewAnnotation['annotation_type'],
    created_at: new Date().toISOString(),
  };
}

export async function exportAnnotations(): Promise<string> {
  const result = await pool.query(
    `SELECT ra.page_path, ra.page_title, ra.annotation_type, ra.annotation_text,
            ra.created_at, u.name as user_name
     FROM review_annotations ra
     LEFT JOIN users u ON ra.user_id = u.id
     ORDER BY ra.page_path, ra.created_at`
  );

  if (result.rows.length === 0) {
    return '# REVIEW ANNOTATIONS\n# No annotations found.\n';
  }

  const grouped: Record<string, typeof result.rows> = {};
  for (const row of result.rows) {
    const key = row.page_path;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(row);
  }

  const now = new Date().toISOString().split('T')[0];
  const lines: string[] = [
    '# REVIEW ANNOTATIONS',
    `# Generated: ${now}`,
    `# Total: ${result.rows.length} annotations`,
    '',
  ];

  for (const [pagePath, annotations] of Object.entries(grouped)) {
    const title = annotations[0].page_title;
    lines.push('---');
    lines.push(`## Page: ${pagePath}${title ? ` (${title})` : ''}`);
    lines.push('');

    for (const ann of annotations) {
      const date = new Date(ann.created_at);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      const typeTag = ann.annotation_type.toUpperCase();
      lines.push(`[${typeTag}] ${dateStr} — ${ann.user_name}`);
      lines.push(ann.annotation_text);
      lines.push('');
    }
  }

  lines.push('---');
  return lines.join('\n');
}
