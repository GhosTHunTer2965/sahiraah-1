-- Add 'expert' to the app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'expert';

-- Add user_id and email columns to experts table
ALTER TABLE public.experts 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS email text UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_experts_user_id ON public.experts(user_id);
CREATE INDEX IF NOT EXISTS idx_experts_email ON public.experts(email);

-- Create expert_availability table
CREATE TABLE IF NOT EXISTS public.expert_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id uuid NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_recurring boolean DEFAULT true,
  specific_date date,
  is_available boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for expert_availability
CREATE INDEX IF NOT EXISTS idx_expert_availability_expert_id ON public.expert_availability(expert_id);
CREATE INDEX IF NOT EXISTS idx_expert_availability_day ON public.expert_availability(day_of_week);

-- Enable RLS on expert_availability
ALTER TABLE public.expert_availability ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can view availability (for booking)
CREATE POLICY "Anyone can view expert availability"
ON public.expert_availability
FOR SELECT
USING (true);

-- RLS: Experts can manage their own availability
CREATE POLICY "Experts can insert their own availability"
ON public.expert_availability
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.experts e
    WHERE e.id = expert_availability.expert_id
    AND e.user_id = auth.uid()
  )
);

CREATE POLICY "Experts can update their own availability"
ON public.expert_availability
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.experts e
    WHERE e.id = expert_availability.expert_id
    AND e.user_id = auth.uid()
  )
);

CREATE POLICY "Experts can delete their own availability"
ON public.expert_availability
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.experts e
    WHERE e.id = expert_availability.expert_id
    AND e.user_id = auth.uid()
  )
);

-- Update experts table RLS to allow experts to update their own profile
CREATE POLICY "Experts can update their own profile"
ON public.experts
FOR UPDATE
USING (user_id = auth.uid());

-- Allow experts to view their own sessions
CREATE POLICY "Experts can view sessions booked with them"
ON public.expert_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.experts e
    WHERE e.id = expert_sessions.expert_id
    AND e.user_id = auth.uid()
  )
);

-- Allow experts to update sessions (e.g., add meeting notes)
CREATE POLICY "Experts can update their sessions"
ON public.expert_sessions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.experts e
    WHERE e.id = expert_sessions.expert_id
    AND e.user_id = auth.uid()
  )
);

-- Create trigger for updated_at on expert_availability
CREATE TRIGGER update_expert_availability_updated_at
BEFORE UPDATE ON public.expert_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();