-- Review annotations: lightweight page-level feedback for reviewer workflow
-- This table is designed for one-shot use and clean removal (DROP TABLE)

CREATE TABLE IF NOT EXISTS review_annotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    page_path VARCHAR(500) NOT NULL,
    page_title VARCHAR(500),
    annotation_text TEXT NOT NULL,
    annotation_type VARCHAR(30) NOT NULL DEFAULT 'general'
        CHECK (annotation_type IN ('general', 'bug', 'content', 'design', 'ux')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_annotations_page ON review_annotations(page_path);

-- Seed the feature flag (disabled by default — flip to 'true' to enable)
INSERT INTO platform_settings (key, value, updated_at)
VALUES ('review_mode_enabled', 'false', NOW())
ON CONFLICT (key) DO NOTHING;
