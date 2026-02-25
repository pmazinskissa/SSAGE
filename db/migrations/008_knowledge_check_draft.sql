-- Store in-progress knowledge check answers (drafts) before completion
CREATE TABLE IF NOT EXISTS knowledge_check_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_slug VARCHAR(100) NOT NULL,
    module_slug VARCHAR(100) NOT NULL,
    question_id VARCHAR(100) NOT NULL,
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    saved_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, course_slug, module_slug, question_id)
);

CREATE INDEX IF NOT EXISTS idx_kc_drafts_user_course_module
  ON knowledge_check_drafts(user_id, course_slug, module_slug);
