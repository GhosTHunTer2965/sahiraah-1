-- Create experts table
CREATE TABLE IF NOT EXISTS public.experts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT,
  expertise JSONB DEFAULT '[]'::jsonb,
  hourly_rate NUMERIC DEFAULT 199.00,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create expert sessions/bookings table
CREATE TABLE IF NOT EXISTS public.expert_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  expert_id UUID NOT NULL REFERENCES public.experts(id),
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  amount_paid NUMERIC DEFAULT 199.00,
  payment_status TEXT DEFAULT 'pending',
  session_status TEXT DEFAULT 'scheduled',
  meeting_link TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for experts (public view)
CREATE POLICY "Anyone can view available experts"
  ON public.experts
  FOR SELECT
  USING (is_available = true);

-- Policies for sessions
CREATE POLICY "Users can view their own sessions"
  ON public.expert_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON public.expert_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.expert_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Insert sample experts
INSERT INTO public.experts (name, title, bio, expertise, hourly_rate, is_available) VALUES
('Dr. Rajesh Kumar', 'Senior Software Architect', 'Ex-Google, 15+ years in tech industry', '["Software Development", "System Design", "Career Guidance"]'::jsonb, 199.00, true),
('Priya Sharma', 'Data Science Lead', 'ML Expert with 10+ years experience', '["Data Science", "Machine Learning", "Career Transition"]'::jsonb, 199.00, true),
('Amit Patel', 'Product Manager', 'Ex-Microsoft PM, MBA from IIM', '["Product Management", "Business Strategy", "Career Planning"]'::jsonb, 199.00, true),
('Sneha Desai', 'HR Director', 'Hiring expert across top tech companies', '["Resume Review", "Interview Prep", "Career Development"]'::jsonb, 199.00, true);

-- Add trigger for updated_at
CREATE TRIGGER update_expert_sessions_updated_at
  BEFORE UPDATE ON public.expert_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();