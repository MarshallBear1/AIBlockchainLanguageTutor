-- Add name column to profiles table
ALTER TABLE public.profiles ADD COLUMN name text;

-- Update the handle_new_user function to include name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, selected_language, selected_level, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'selected_language', 'es'),
    COALESCE((NEW.raw_user_meta_data->>'selected_level')::INTEGER, 1),
    NEW.raw_user_meta_data->>'name'
  );
  RETURN NEW;
END;
$function$;