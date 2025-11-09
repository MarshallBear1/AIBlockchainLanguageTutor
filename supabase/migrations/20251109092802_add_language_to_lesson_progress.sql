-- Add language_code to lesson_progress for per-language tracking
-- This allows users to track progress separately for each language

-- Add language_code column
ALTER TABLE public.lesson_progress 
ADD COLUMN IF NOT EXISTS language_code VARCHAR(5) DEFAULT 'es';

-- Drop old unique constraint
ALTER TABLE public.lesson_progress 
DROP CONSTRAINT IF EXISTS lesson_progress_user_id_lesson_id_key;

-- Add new unique constraint including language_code
ALTER TABLE public.lesson_progress 
ADD CONSTRAINT lesson_progress_user_id_lesson_id_language_key 
UNIQUE(user_id, lesson_id, language_code);

-- Create index for faster language-specific queries
CREATE INDEX IF NOT EXISTS idx_lesson_progress_language 
ON public.lesson_progress(user_id, language_code);

-- Update existing rows to have language_code (default to Spanish for existing progress)
UPDATE public.lesson_progress 
SET language_code = 'es' 
WHERE language_code IS NULL;

-- Make language_code NOT NULL after setting defaults
ALTER TABLE public.lesson_progress 
ALTER COLUMN language_code SET NOT NULL;
