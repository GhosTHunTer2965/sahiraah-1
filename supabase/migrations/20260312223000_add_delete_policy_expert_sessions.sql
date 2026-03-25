-- Allow experts to delete their own sessions from the expert dashboard feature
DROP POLICY IF EXISTS "Experts can delete their sessions" ON public.expert_sessions;

CREATE POLICY "Experts can delete their sessions"
  ON public.expert_sessions
  FOR DELETE
  USING (
    expert_id IN (
      SELECT id FROM experts WHERE user_id = auth.uid()
    )
  );
