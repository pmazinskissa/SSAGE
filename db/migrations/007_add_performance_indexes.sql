-- Add composite indexes for dashboard aggregate queries that group by module_slug
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_course_module
  ON lesson_progress(user_id, course_slug, module_slug);

CREATE INDEX IF NOT EXISTS idx_knowledge_check_user_course_module
  ON knowledge_check_results(user_id, course_slug, module_slug);
