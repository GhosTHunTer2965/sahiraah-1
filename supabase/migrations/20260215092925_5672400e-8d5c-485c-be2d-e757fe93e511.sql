-- Allow authenticated users to create their own expert profile
CREATE POLICY "Users can create their own expert profile"
ON public.experts
FOR INSERT
WITH CHECK (auth.uid() = user_id);
