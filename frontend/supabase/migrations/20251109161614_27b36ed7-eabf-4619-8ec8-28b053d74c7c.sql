-- Add unique constraint to lesson_progress table to enable upsert operations
-- This prevents duplicate lesson completions for the same user, lesson, and language
ALTER TABLE public.lesson_progress 
ADD CONSTRAINT lesson_progress_user_lesson_language_unique 
UNIQUE (user_id, lesson_id, language_code);