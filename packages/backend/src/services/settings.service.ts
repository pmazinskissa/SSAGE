import { pool } from '../config/database.js';
import type { PlatformSetting } from '@playbook/shared';

export async function getAllSettings(): Promise<Record<string, string>> {
  const result = await pool.query('SELECT key, value FROM platform_settings');
  const settings: Record<string, string> = {};
  for (const row of result.rows) {
    settings[row.key] = row.value;
  }
  return settings;
}

export async function getSetting(key: string): Promise<string | null> {
  const result = await pool.query('SELECT value FROM platform_settings WHERE key = $1', [key]);
  return result.rows.length > 0 ? result.rows[0].value : null;
}

export async function upsertSetting(key: string, value: string): Promise<void> {
  await pool.query(
    `INSERT INTO platform_settings (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
    [key, value]
  );
}

export async function deleteSetting(key: string): Promise<void> {
  await pool.query('DELETE FROM platform_settings WHERE key = $1', [key]);
}

export async function getCourseSettings(slug: string): Promise<Record<string, string>> {
  const prefix = `course.${slug}.`;
  const result = await pool.query(
    "SELECT key, value FROM platform_settings WHERE key LIKE $1",
    [`${prefix}%`]
  );
  const settings: Record<string, string> = {};
  for (const row of result.rows) {
    settings[row.key.slice(prefix.length)] = row.value;
  }
  return settings;
}
