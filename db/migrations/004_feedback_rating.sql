-- Add rating column to content_feedback (1-5 score)
ALTER TABLE content_feedback ADD COLUMN rating SMALLINT CHECK (rating >= 1 AND rating <= 5);
