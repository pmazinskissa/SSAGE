-- Rename module 03-prioritization lesson slugs to follow NN-slug convention
-- Old: prioritization-methods-overview -> 02-prioritization-methods-overview
-- Old: 02-wsjf-scoring-method -> 03-wsjf-scoring-method
-- Old: 03-value-complexity-matrix -> 04-value-complexity-matrix

UPDATE lesson_progress
SET lesson_slug = '02-prioritization-methods-overview'
WHERE module_slug = '03-prioritization'
  AND lesson_slug = 'prioritization-methods-overview';

UPDATE lesson_progress
SET lesson_slug = '03-wsjf-scoring-method'
WHERE module_slug = '03-prioritization'
  AND lesson_slug = '02-wsjf-scoring-method';

UPDATE lesson_progress
SET lesson_slug = '04-value-complexity-matrix'
WHERE module_slug = '03-prioritization'
  AND lesson_slug = '03-value-complexity-matrix';
