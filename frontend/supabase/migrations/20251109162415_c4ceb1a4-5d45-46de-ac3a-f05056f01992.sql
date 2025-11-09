-- Add banked_vibe column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN banked_vibe integer NOT NULL DEFAULT 0;

-- Add comment explaining the column
COMMENT ON COLUMN public.profiles.banked_vibe IS 'VIBE tokens earned but not yet withdrawn. Multiplied by streak bonus on withdrawal.';