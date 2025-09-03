-- Phase 0: Fix existing system and add course validation edge function
-- First let's improve the existing tables for better data integrity

-- Add better constraints and indexes for existing tables
ALTER TABLE user_career_history 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add trigger to user_career_history
DROP TRIGGER IF EXISTS update_user_career_history_updated_at ON public.user_career_history;
CREATE TRIGGER update_user_career_history_updated_at
    BEFORE UPDATE ON public.user_career_history
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Phase 1: Skill Assessment Tables
-- Table for skill quizzes (different types of skill assessments)
CREATE TABLE IF NOT EXISTS public.skill_quizzes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- e.g., 'technical', 'soft_skills', 'language'
    difficulty_level TEXT NOT NULL DEFAULT 'intermediate', -- beginner, intermediate, advanced
    duration_minutes INTEGER DEFAULT 30,
    total_questions INTEGER DEFAULT 20,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for skill assessment questions
CREATE TABLE IF NOT EXISTS public.skill_questions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_id UUID NOT NULL REFERENCES public.skill_quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice', -- multiple_choice, true_false, coding, text
    options JSONB, -- For multiple choice questions
    correct_answer TEXT, -- For scoring
    points INTEGER DEFAULT 1,
    explanation TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for user skill quiz attempts
CREATE TABLE IF NOT EXISTS public.skill_quiz_attempts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    quiz_id UUID NOT NULL REFERENCES public.skill_quizzes(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    total_score INTEGER DEFAULT 0,
    max_possible_score INTEGER DEFAULT 0,
    percentage_score DECIMAL(5,2),
    time_taken_minutes INTEGER,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for individual skill quiz responses
CREATE TABLE IF NOT EXISTS public.skill_quiz_responses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    attempt_id UUID NOT NULL REFERENCES public.skill_quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.skill_questions(id) ON DELETE CASCADE,
    user_answer TEXT NOT NULL,
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0,
    time_taken_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Phase 2: Enhanced Courses Table
-- Add more fields to existing courses table for better filtering
DO $$ 
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'price') THEN
        ALTER TABLE public.courses ADD COLUMN price DECIMAL(10,2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'price_type') THEN
        ALTER TABLE public.courses ADD COLUMN price_type TEXT DEFAULT 'free'; -- free, paid, freemium
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'provider') THEN
        ALTER TABLE public.courses ADD COLUMN provider TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'url') THEN
        ALTER TABLE public.courses ADD COLUMN url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'has_certificate') THEN
        ALTER TABLE public.courses ADD COLUMN has_certificate BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'is_trending') THEN
        ALTER TABLE public.courses ADD COLUMN is_trending BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'is_partner') THEN
        ALTER TABLE public.courses ADD COLUMN is_partner BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'rating') THEN
        ALTER TABLE public.courses ADD COLUMN rating DECIMAL(3,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'review_count') THEN
        ALTER TABLE public.courses ADD COLUMN review_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Phase 3: Jobs and Internships Tables
-- Table for job/internship listings
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    description TEXT NOT NULL,
    job_type TEXT NOT NULL, -- job, internship, part-time, contract
    location TEXT,
    is_remote BOOLEAN DEFAULT false,
    is_onsite BOOLEAN DEFAULT true,
    salary_range TEXT,
    required_skills TEXT[], -- Array of skill names
    experience_level TEXT DEFAULT 'entry', -- entry, mid, senior
    duration TEXT, -- For internships: "3 months", "6 months"
    application_deadline DATE,
    external_url TEXT,
    company_logo_url TEXT,
    is_urgent BOOLEAN DEFAULT false,
    is_high_opportunity BOOLEAN DEFAULT false,
    is_exclusive BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    posted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for user job applications tracking
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'applied', -- applied, in_review, interview, rejected, accepted
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    notes TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, job_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.skill_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for skill assessment tables
-- Skill quizzes - everyone can view active quizzes
CREATE POLICY "Anyone can view active skill quizzes" 
ON public.skill_quizzes 
FOR SELECT 
USING (is_active = true);

-- Skill questions - everyone can view questions for active quizzes
CREATE POLICY "Anyone can view questions for active quizzes" 
ON public.skill_questions 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.skill_quizzes sq 
    WHERE sq.id = quiz_id AND sq.is_active = true
));

-- Skill quiz attempts - users can only access their own attempts
CREATE POLICY "Users can view their own skill quiz attempts" 
ON public.skill_quiz_attempts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own skill quiz attempts" 
ON public.skill_quiz_attempts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skill quiz attempts" 
ON public.skill_quiz_attempts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Skill quiz responses - users can only access their own responses
CREATE POLICY "Users can view their own skill quiz responses" 
ON public.skill_quiz_responses 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.skill_quiz_attempts sqa 
    WHERE sqa.id = attempt_id AND sqa.user_id = auth.uid()
));

CREATE POLICY "Users can create their own skill quiz responses" 
ON public.skill_quiz_responses 
FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.skill_quiz_attempts sqa 
    WHERE sqa.id = attempt_id AND sqa.user_id = auth.uid()
));

-- Jobs policies - everyone can view active jobs
CREATE POLICY "Anyone can view active jobs" 
ON public.jobs 
FOR SELECT 
USING (is_active = true);

-- Job applications policies - users can only access their own applications
CREATE POLICY "Users can view their own job applications" 
ON public.job_applications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own job applications" 
ON public.job_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job applications" 
ON public.job_applications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_skill_quizzes_updated_at
    BEFORE UPDATE ON public.skill_quizzes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
    BEFORE UPDATE ON public.job_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_skill_quiz_attempts_updated_at
    BEFORE UPDATE ON public.skill_quiz_attempts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_skill_quizzes_category ON public.skill_quizzes(category);
CREATE INDEX IF NOT EXISTS idx_skill_quizzes_active ON public.skill_quizzes(is_active);
CREATE INDEX IF NOT EXISTS idx_skill_questions_quiz_id ON public.skill_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_skill_quiz_attempts_user_id ON public.skill_quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_quiz_attempts_quiz_id ON public.skill_quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON public.jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON public.jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);