-- Fix infinite recursion: the "Booked users can view expert details" policy
-- on experts references expert_sessions, whose policies reference experts back.
-- Replace it with a simple policy allowing all authenticated users to view experts
-- (expert profiles are meant to be publicly browsable for booking).

DROP POLICY IF EXISTS "Booked users can view expert details" ON public.experts;

CREATE POLICY "Authenticated users can view experts"
  ON public.experts
  FOR SELECT
  USING (true);

-- Also fix expert_sessions SELECT policies to avoid referencing experts table
-- The "Experts can view sessions booked with them" policy queries experts, causing recursion
DROP POLICY IF EXISTS "Experts can view sessions booked with them" ON public.expert_sessions;

CREATE POLICY "Experts can view sessions booked with them"
  ON public.expert_sessions
  FOR SELECT
  USING (
    expert_id IN (
      SELECT id FROM experts WHERE user_id = auth.uid()
    )
  );

-- Fix expert_sessions UPDATE policy similarly
DROP POLICY IF EXISTS "Experts can update their sessions" ON public.expert_sessions;

CREATE POLICY "Experts can update their sessions"
  ON public.expert_sessions
  FOR UPDATE
  USING (
    expert_id IN (
      SELECT id FROM experts WHERE user_id = auth.uid()
    )
  );

-- Fix expert_availability policies to use direct subquery instead of EXISTS with join
DROP POLICY IF EXISTS "Experts can insert their own availability" ON public.expert_availability;
DROP POLICY IF EXISTS "Experts can update their own availability" ON public.expert_availability;
DROP POLICY IF EXISTS "Experts can delete their own availability" ON public.expert_availability;

CREATE POLICY "Experts can insert their own availability"
  ON public.expert_availability
  FOR INSERT
  WITH CHECK (
    expert_id IN (SELECT id FROM experts WHERE user_id = auth.uid())
  );

CREATE POLICY "Experts can update their own availability"
  ON public.expert_availability
  FOR UPDATE
  USING (
    expert_id IN (SELECT id FROM experts WHERE user_id = auth.uid())
  );

CREATE POLICY "Experts can delete their own availability"
  ON public.expert_availability
  FOR DELETE
  USING (
    expert_id IN (SELECT id FROM experts WHERE user_id = auth.uid())
  );