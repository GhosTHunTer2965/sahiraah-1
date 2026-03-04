
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'light',
  ADD COLUMN IF NOT EXISTS language_preference text NOT NULL DEFAULT 'english',
  ADD COLUMN IF NOT EXISTS learning_style text NOT NULL DEFAULT 'visual',
  ADD COLUMN IF NOT EXISTS profile_visibility text NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS data_sharing boolean NOT NULL DEFAULT true;
