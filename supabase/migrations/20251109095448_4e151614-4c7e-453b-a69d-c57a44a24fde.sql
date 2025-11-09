-- Add vibe_coins column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS vibe_coins integer DEFAULT 0;

-- Add language_code column to lesson_progress table to track progress per language
ALTER TABLE public.lesson_progress 
ADD COLUMN IF NOT EXISTS language_code text DEFAULT 'es';