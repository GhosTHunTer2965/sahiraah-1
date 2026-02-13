
-- Fix: Expert email exposure - replace overly permissive SELECT policy
-- Drop the current policy that exposes all columns including email
DROP POLICY IF EXISTS "Anyone can view available experts" ON public.experts;

-- Create a public view that excludes sensitive fields (email, user_id)
CREATE OR REPLACE VIEW public.experts_public
WITH (security_invoker = on) AS
SELECT id, name, title, bio, expertise, hourly_rate, image_url, is_available, created_at
FROM public.experts
WHERE is_available = true;

-- Policy: Experts can view their own full profile (they need all fields)
CREATE POLICY "Experts can view own full profile"
  ON public.experts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users with bookings can view their expert's details (excluding email via app-level)
CREATE POLICY "Booked users can view expert details"
  ON public.experts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.expert_sessions
      WHERE expert_sessions.expert_id = experts.id
      AND expert_sessions.user_id = auth.uid()
    )
  );
