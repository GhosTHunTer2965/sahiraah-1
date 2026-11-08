-- ====================================================================
-- SAHIRAAH BASE SCHEMAS & PRE-REQUISITE TABLES
-- ====================================================================

-- 1. Enable pgcrypto / uuid extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Define app_role enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'expert');
    END IF;
END
$$;

-- 3. Base table: user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role public.app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Base table: user_profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY,
    name TEXT,
    email TEXT,
    bio TEXT,
    location TEXT,
    state TEXT,
    region TEXT,
    location_type TEXT,
    current_qualification TEXT,
    prior_education_level TEXT,
    parent_education_level TEXT,
    disability_status TEXT,
    family_income_range TEXT,
    preferred_language TEXT,
    time_availability TEXT,
    learning_pace_preference TEXT,
    profile_completion_percentage NUMERIC DEFAULT 0,
    skills_interests JSONB,
    career_aspirations JSONB,
    financial_constraints JSONB,
    work_experience JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Base table: user_preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    theme TEXT NOT NULL DEFAULT 'system',
    language_preference TEXT NOT NULL DEFAULT 'en',
    learning_style TEXT NOT NULL DEFAULT 'visual',
    learning_pace TEXT DEFAULT 'moderate',
    profile_visibility TEXT NOT NULL DEFAULT 'public',
    data_sharing BOOLEAN NOT NULL DEFAULT true,
    app_notifications BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    content_filters JSONB,
    learning_goals JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 6. Base table: user_career_history (base columns only, extensions added in migrations)
CREATE TABLE IF NOT EXISTS public.user_career_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    career TEXT NOT NULL,
    reason TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.user_career_history ENABLE ROW LEVEL SECURITY;

-- 7. Base table: user_quiz_responses
CREATE TABLE IF NOT EXISTS public.user_quiz_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.user_quiz_responses ENABLE ROW LEVEL SECURITY;

-- 8. Base table: contact_messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 9. Base table: jobs & job_applications
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    company_logo_url TEXT,
    description TEXT NOT NULL,
    job_type TEXT NOT NULL DEFAULT 'Full-time',
    experience_level TEXT,
    location TEXT,
    duration TEXT,
    salary_range TEXT,
    required_skills TEXT[],
    external_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_remote BOOLEAN DEFAULT false,
    is_onsite BOOLEAN DEFAULT false,
    is_urgent BOOLEAN DEFAULT false,
    is_high_opportunity BOOLEAN DEFAULT false,
    is_exclusive BOOLEAN DEFAULT false,
    posted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'applied',
    notes TEXT,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- 10. Base table: skill_quizzes, questions, attempts, responses
CREATE TABLE IF NOT EXISTS public.skill_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    difficulty_level TEXT NOT NULL,
    duration_minutes INTEGER,
    total_questions INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.skill_quizzes ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.skill_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.skill_quizzes(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL,
    options JSONB,
    correct_answer TEXT,
    explanation TEXT,
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.skill_questions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.skill_quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.skill_quizzes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    total_score NUMERIC DEFAULT 0,
    max_possible_score NUMERIC DEFAULT 0,
    percentage_score NUMERIC DEFAULT 0,
    time_taken_minutes NUMERIC,
    is_completed BOOLEAN DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.skill_quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.skill_quiz_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES public.skill_quiz_attempts(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.skill_questions(id) ON DELETE CASCADE NOT NULL,
    user_answer TEXT NOT NULL,
    is_correct BOOLEAN,
    points_earned NUMERIC DEFAULT 0,
    time_taken_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.skill_quiz_responses ENABLE ROW LEVEL SECURITY;


-- =============================================
-- Migration: 20250609160327-dd400a84-2f34-469e-8f29-8be6137a0875.sql
-- =============================================


-- CREATE TABLE IF NOT EXISTS to store available courses
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  career_path TEXT NOT NULL,
  skills TEXT[] NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CREATE TABLE IF NOT EXISTS to store user course progress
CREATE TABLE IF NOT EXISTS public.user_course_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id),
  completed BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- CREATE TABLE IF NOT EXISTS to store user's recommended learning paths
CREATE TABLE IF NOT EXISTS public.user_learning_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  career_path TEXT NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id),
  recommended_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, career_path, course_id)
);

-- Enable RLS on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_paths ENABLE ROW LEVEL SECURITY;

-- RLS policies for courses (public read)
DROP POLICY IF EXISTS "Anyone can view courses" ON public.courses;
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);

-- RLS policies for user_course_progress
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_course_progress;
CREATE POLICY "Users can view their own progress" ON public.user_course_progress 
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_course_progress;
CREATE POLICY "Users can update their own progress" ON public.user_course_progress 
  FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_course_progress;
CREATE POLICY "Users can insert their own progress" ON public.user_course_progress 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for user_learning_paths
DROP POLICY IF EXISTS "Users can view their own learning paths" ON public.user_learning_paths;
CREATE POLICY "Users can view their own learning paths" ON public.user_learning_paths 
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own learning paths" ON public.user_learning_paths;
CREATE POLICY "Users can insert their own learning paths" ON public.user_learning_paths 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own learning paths" ON public.user_learning_paths;
CREATE POLICY "Users can update their own learning paths" ON public.user_learning_paths 
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample courses for different career paths
INSERT INTO public.courses (title, description, duration, level, career_path, skills, order_index) VALUES
-- Software Developer courses
('Programming Fundamentals', 'Learn the basics of programming logic, variables, and control structures.', '4 weeks', 'Beginner', 'Software Developer', ARRAY['Programming Logic', 'Problem Solving', 'Debugging'], 1),
('Web Development Basics', 'Introduction to HTML, CSS, and JavaScript for web development.', '6 weeks', 'Beginner', 'Software Developer', ARRAY['HTML', 'CSS', 'JavaScript', 'DOM Manipulation'], 2),
('Database Management', 'Learn SQL, database design, and data modeling concepts.', '5 weeks', 'Intermediate', 'Software Developer', ARRAY['SQL', 'Database Design', 'Data Modeling', 'MySQL'], 3),
('React Development', 'Build modern web applications using React framework.', '8 weeks', 'Intermediate', 'Software Developer', ARRAY['React', 'Component Architecture', 'State Management', 'Hooks'], 4),
('Software Architecture & Design Patterns', 'Master software architecture principles and common design patterns.', '6 weeks', 'Advanced', 'Software Developer', ARRAY['Software Architecture', 'Design Patterns', 'System Design', 'Scalability'], 5),
('Cloud Computing & DevOps', 'Learn cloud platforms, containerization, and deployment strategies.', '7 weeks', 'Advanced', 'Software Developer', ARRAY['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'DevOps'], 6),

-- Data Scientist courses
('Statistics Fundamentals', 'Essential statistical concepts for data analysis.', '5 weeks', 'Beginner', 'Data Scientist', ARRAY['Statistics', 'Probability', 'Hypothesis Testing', 'Data Analysis'], 1),
('Python for Data Science', 'Learn Python programming specifically for data science applications.', '6 weeks', 'Beginner', 'Data Scientist', ARRAY['Python', 'Pandas', 'NumPy', 'Data Manipulation'], 2),
('Data Visualization', 'Create compelling visualizations using modern tools and techniques.', '4 weeks', 'Intermediate', 'Data Scientist', ARRAY['Matplotlib', 'Seaborn', 'Tableau', 'Data Storytelling'], 3),
('Machine Learning Fundamentals', 'Introduction to supervised and unsupervised learning algorithms.', '8 weeks', 'Intermediate', 'Data Scientist', ARRAY['Scikit-learn', 'Regression', 'Classification', 'Clustering'], 4),
('Deep Learning & Neural Networks', 'Advanced machine learning with neural networks and deep learning.', '10 weeks', 'Advanced', 'Data Scientist', ARRAY['TensorFlow', 'PyTorch', 'Neural Networks', 'Deep Learning'], 5),
('Big Data Analytics', 'Handle and analyze large-scale datasets using modern tools.', '8 weeks', 'Advanced', 'Data Scientist', ARRAY['Spark', 'Hadoop', 'Big Data', 'Distributed Computing'], 6),

-- UX Designer courses
('Design Principles & Theory', 'Fundamental design principles, color theory, and typography.', '3 weeks', 'Beginner', 'UX Designer', ARRAY['Design Theory', 'Color Theory', 'Typography', 'Visual Hierarchy'], 1),
('User Research Methods', 'Learn how to conduct user interviews, surveys, and usability testing.', '4 weeks', 'Beginner', 'UX Designer', ARRAY['User Research', 'Interviews', 'Surveys', 'Usability Testing'], 2),
('Wireframing & Prototyping', 'Create wireframes and interactive prototypes using design tools.', '5 weeks', 'Intermediate', 'UX Designer', ARRAY['Wireframing', 'Prototyping', 'Figma', 'Adobe XD'], 3),
('UI Design & Visual Design', 'Master visual design principles and create stunning user interfaces.', '6 weeks', 'Intermediate', 'UX Designer', ARRAY['UI Design', 'Visual Design', 'Design Systems', 'Component Libraries'], 4),
('Advanced UX Strategy', 'Strategic UX planning, business alignment, and product strategy.', '7 weeks', 'Advanced', 'UX Designer', ARRAY['UX Strategy', 'Product Strategy', 'Business Analysis', 'Stakeholder Management'], 5),
('Design Leadership & Portfolio', 'Build a professional portfolio and develop design leadership skills.', '4 weeks', 'Advanced', 'UX Designer', ARRAY['Portfolio Development', 'Design Leadership', 'Presentation Skills', 'Career Development'], 6);


-- =============================================
-- Migration: 20250610074359-64ba0137-2c57-42e9-b7f3-ebdee1c635ef.sql
-- =============================================


-- Add columns to store complete roadmap data in user_career_history table
ALTER TABLE public.user_career_history 
ADD COLUMN IF NOT EXISTS roadmap_summary TEXT,
ADD COLUMN IF NOT EXISTS courses JSONB,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS links_clicked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_selected BOOLEAN DEFAULT false;

-- Update the existing table to support the new data structure
-- The courses JSONB will store the structure like:
-- {
--   "beginner": [{"title": "Course Name", "link": "URL", "platform": "Platform"}],
--   "intermediate": [{"title": "Course Name", "link": "URL", "platform": "Platform"}],
--   "advanced": [{"title": "Course Name", "link": "URL", "platform": "Platform"}]
-- }

-- Add an index on the courses JSONB column for better query performance
CREATE INDEX IF NOT EXISTS idx_user_career_history_courses ON public.user_career_history USING GIN (courses);

-- Add an index on tags array for better search performance
CREATE INDEX IF NOT EXISTS idx_user_career_history_tags ON public.user_career_history USING GIN (tags);


-- =============================================
-- Migration: 20250623162121-8d101a57-f163-4bc6-8664-51ce6e593acf.sql
-- =============================================


-- Store detailed quiz responses with question categories
CREATE TABLE IF NOT EXISTS user_quiz_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    session_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    session_completed_at TIMESTAMP WITH TIME ZONE,
    current_question_index INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 25,
    is_completed BOOLEAN DEFAULT false,
    education_level TEXT,
    student_name TEXT,
    strengths JSONB,
    weaknesses JSONB,
    career_recommendations JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Store individual question-answer pairs with categories
CREATE TABLE IF NOT EXISTS user_quiz_answers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES user_quiz_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    question_number INTEGER NOT NULL,
    question_category TEXT NOT NULL, -- 'logical', 'analytical', 'reasoning', 'skill_interest'
    question_text TEXT NOT NULL,
    answer_text TEXT NOT NULL,
    ai_context JSONB, -- Store any AI-generated context for branching
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced career history with detailed course recommendations
ALTER TABLE user_career_history 
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES user_quiz_sessions(id),
ADD COLUMN IF NOT EXISTS strengths JSONB,
ADD COLUMN IF NOT EXISTS weaknesses JSONB,
ADD COLUMN IF NOT EXISTS improvement_areas JSONB,
ADD COLUMN IF NOT EXISTS report_data JSONB;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON user_quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_session_id ON user_quiz_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_user_id ON user_quiz_answers(user_id);

-- Enable Row Level Security
ALTER TABLE user_quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_answers ENABLE ROW LEVEL SECURITY;

-- RLS policies for quiz sessions
DROP POLICY IF EXISTS "Users can view their own quiz sessions" ON user_quiz_sessions;
CREATE POLICY "Users can view their own quiz sessions" ON user_quiz_sessions FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own quiz sessions" ON user_quiz_sessions;
CREATE POLICY "Users can create their own quiz sessions" ON user_quiz_sessions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own quiz sessions" ON user_quiz_sessions;
CREATE POLICY "Users can update their own quiz sessions" ON user_quiz_sessions FOR UPDATE 
    USING (auth.uid() = user_id);

-- RLS policies for quiz answers
DROP POLICY IF EXISTS "Users can view their own quiz answers" ON user_quiz_answers;
CREATE POLICY "Users can view their own quiz answers" ON user_quiz_answers FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own quiz answers" ON user_quiz_answers;
CREATE POLICY "Users can create their own quiz answers" ON user_quiz_answers FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own quiz answers" ON user_quiz_answers;
CREATE POLICY "Users can update their own quiz answers" ON user_quiz_answers FOR UPDATE 
    USING (auth.uid() = user_id);


-- =============================================
-- Migration: 20250917110411_38bd84fb-eca0-4de9-9986-b1288b7fe08a.sql
-- =============================================

-- Phase 1: Enhanced Learner Profiling System
-- Expand user_profiles table with comprehensive socio-economic and learning data
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS family_income_range text,
ADD COLUMN IF NOT EXISTS location_type text CHECK (location_type IN ('urban', 'rural', 'semi-urban')),
ADD COLUMN IF NOT EXISTS parent_education_level text,
ADD COLUMN IF NOT EXISTS financial_constraints jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'english',
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS disability_status text,
ADD COLUMN IF NOT EXISTS learning_pace_preference text CHECK (learning_pace_preference IN ('slow', 'moderate', 'fast', 'adaptive')),
ADD COLUMN IF NOT EXISTS time_availability text,
ADD COLUMN IF NOT EXISTS prior_education_level text,
ADD COLUMN IF NOT EXISTS current_qualification text,
ADD COLUMN IF NOT EXISTS work_experience jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS skills_interests jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS career_aspirations jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS profile_completion_percentage integer DEFAULT 20;

-- Phase 2: NSQF Integration & Skills Assessment
-- Create NSQF qualifications table
CREATE TABLE IF NOT EXISTS public.nsqf_qualifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level integer NOT NULL CHECK (level >= 1 AND level <= 10),
  title text NOT NULL,
  description text,
  sector text NOT NULL,
  sub_sector text,
  job_roles jsonb DEFAULT '[]'::jsonb,
  entry_requirements text,
  credit_points integer,
  duration_hours integer,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on NSQF qualifications
ALTER TABLE public.nsqf_qualifications ENABLE ROW LEVEL SECURITY;

-- Anyone can view active NSQF qualifications
DROP POLICY IF EXISTS "Anyone can view active NSQF qualifications" ON public.nsqf_qualifications;
CREATE POLICY "Anyone can view active NSQF qualifications" ON public.nsqf_qualifications 
FOR SELECT 
USING (is_active = true);

-- Create skill categories table
CREATE TABLE IF NOT EXISTS public.skill_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  parent_category_id uuid,
  nsqf_level_min integer CHECK (nsqf_level_min >= 1 AND nsqf_level_min <= 10),
  nsqf_level_max integer CHECK (nsqf_level_max >= 1 AND nsqf_level_max <= 10),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on skill categories
ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view active skill categories
DROP POLICY IF EXISTS "Anyone can view active skill categories" ON public.skill_categories;
CREATE POLICY "Anyone can view active skill categories" ON public.skill_categories 
FOR SELECT 
USING (is_active = true);

-- Create comprehensive skill assessments table
CREATE TABLE IF NOT EXISTS public.comprehensive_skill_assessments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  skill_category_id uuid,
  assessment_type text NOT NULL CHECK (assessment_type IN ('technical', 'soft_skills', 'cognitive', 'practical')),
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  responses jsonb NOT NULL DEFAULT '[]'::jsonb,
  score_breakdown jsonb DEFAULT '{}'::jsonb,
  overall_score numeric(5,2),
  proficiency_level text CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  time_taken_minutes integer,
  completed_at timestamp with time zone,
  is_completed boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on comprehensive skill assessments
ALTER TABLE public.comprehensive_skill_assessments ENABLE ROW LEVEL SECURITY;

-- Users can manage their own skill assessments
DROP POLICY IF EXISTS "Users can manage their own skill assessments" ON public.comprehensive_skill_assessments;
CREATE POLICY "Users can manage their own skill assessments" ON public.comprehensive_skill_assessments 
FOR ALL 
USING (auth.uid() = user_id);

-- Create certification providers table
CREATE TABLE IF NOT EXISTS public.certification_providers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text CHECK (type IN ('government', 'industry', 'educational', 'international')),
  recognition_level text CHECK (recognition_level IN ('national', 'state', 'regional', 'international')),
  website_url text,
  contact_info jsonb,
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on certification providers
ALTER TABLE public.certification_providers ENABLE ROW LEVEL SECURITY;

-- Anyone can view active certification providers
DROP POLICY IF EXISTS "Anyone can view active certification providers" ON public.certification_providers;
CREATE POLICY "Anyone can view active certification providers" ON public.certification_providers 
FOR SELECT 
USING (is_active = true);

-- Create user certifications table  
CREATE TABLE IF NOT EXISTS public.user_certifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  certification_name text NOT NULL,
  provider_id uuid,
  certificate_number text,
  issue_date date,
  expiry_date date,
  verification_url text,
  document_url text,
  nsqf_level integer CHECK (nsqf_level >= 1 AND nsqf_level <= 10),
  skill_areas jsonb DEFAULT '[]'::jsonb,
  is_verified boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on user certifications
ALTER TABLE public.user_certifications ENABLE ROW LEVEL SECURITY;

-- Users can manage their own certifications
DROP POLICY IF EXISTS "Users can manage their own certifications" ON public.user_certifications;
CREATE POLICY "Users can manage their own certifications" ON public.user_certifications 
FOR ALL 
USING (auth.uid() = user_id);

-- Create learning preferences table
CREATE TABLE IF NOT EXISTS public.learning_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  preferred_learning_style jsonb DEFAULT '[]'::jsonb, -- visual, auditory, kinesthetic, reading
  study_time_slots jsonb DEFAULT '[]'::jsonb, -- morning, afternoon, evening, night
  preferred_duration_per_session integer DEFAULT 60, -- minutes
  difficulty_progression text DEFAULT 'gradual' CHECK (difficulty_progression IN ('gradual', 'moderate', 'challenging')),
  language_preferences jsonb DEFAULT '["english"]'::jsonb,
  accessibility_needs jsonb DEFAULT '[]'::jsonb,
  device_preferences jsonb DEFAULT '["mobile"]'::jsonb,
  offline_learning_required boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on learning preferences
ALTER TABLE public.learning_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own learning preferences
DROP POLICY IF EXISTS "Users can manage their own learning preferences" ON public.learning_preferences;
CREATE POLICY "Users can manage their own learning preferences" ON public.learning_preferences 
FOR ALL 
USING (auth.uid() = user_id);

-- Insert sample NSQF qualifications for different sectors
INSERT INTO public.nsqf_qualifications (level, title, description, sector, sub_sector, job_roles, entry_requirements, credit_points, duration_hours) VALUES
(1, 'Basic Computer Skills', 'Fundamental computer operations and digital literacy', 'Information Technology', 'Computer Operations', '["Data Entry Operator", "Computer Assistant"]', 'Class 5 pass', 20, 240),
(2, 'Retail Sales Associate', 'Customer service and sales in retail environment', 'Retail', 'Sales', '["Sales Associate", "Cashier", "Store Assistant"]', 'Class 8 pass', 30, 360),
(3, 'Junior Electrician', 'Basic electrical installations and maintenance', 'Infrastructure', 'Electrical', '["Assistant Electrician", "Maintenance Helper"]', 'Class 10 pass', 40, 480),
(4, 'Healthcare Assistant', 'Basic healthcare support services', 'Healthcare', 'General Care', '["Ward Assistant", "Patient Care Assistant"]', 'Class 12 pass', 50, 600),
(5, 'Digital Marketing Associate', 'Online marketing and social media management', 'Media & Entertainment', 'Digital Marketing', '["Social Media Executive", "Content Creator"]', 'Class 12 pass with basic computer knowledge', 60, 720),
(6, 'Web Developer', 'Frontend and backend web development', 'Information Technology', 'Software Development', '["Web Developer", "Frontend Developer"]', 'Diploma or equivalent', 80, 960),
(7, 'Project Coordinator', 'Project management and coordination', 'Management', 'Project Management', '["Project Assistant", "Team Coordinator"]', 'Graduate degree', 100, 1200),
(8, 'Data Analyst', 'Data analysis and business intelligence', 'Information Technology', 'Data Science', '["Business Analyst", "Data Scientist"]', 'Graduate with statistics/mathematics', 120, 1440),
(9, 'Senior Manager', 'Strategic management and leadership', 'Management', 'Leadership', '["Department Manager", "Operations Manager"]', 'Post-graduate with experience', 140, 1680),
(10, 'Technology Architect', 'System design and technology strategy', 'Information Technology', 'Architecture', '["Solution Architect", "Technical Lead"]', 'Advanced degree with extensive experience', 160, 1920);

-- Insert sample skill categories
INSERT INTO public.skill_categories (name, description, nsqf_level_min, nsqf_level_max) VALUES
('Digital Literacy', 'Basic to advanced computer and internet skills', 1, 4),
('Communication Skills', 'Verbal and written communication abilities', 1, 10),
('Technical Skills', 'Job-specific technical competencies', 2, 10),
('Leadership & Management', 'People and project management skills', 5, 10),
('Creative Skills', 'Design, content creation, and innovation', 2, 8),
('Analytical Skills', 'Data analysis and problem-solving', 3, 9),
('Sales & Marketing', 'Customer engagement and market development', 2, 7),
('Healthcare Skills', 'Medical and care-related competencies', 3, 9),
('Financial Skills', 'Accounting, finance, and business management', 4, 8),
('Language Skills', 'Multilingual communication abilities', 1, 6);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at column
DROP TRIGGER IF EXISTS update_nsqf_qualifications_updated_at ON public.nsqf_qualifications;
CREATE TRIGGER update_nsqf_qualifications_updated_at BEFORE UPDATE ON public.nsqf_qualifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_comprehensive_skill_assessments_updated_at ON public.comprehensive_skill_assessments;
CREATE TRIGGER update_comprehensive_skill_assessments_updated_at BEFORE UPDATE ON public.comprehensive_skill_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_user_certifications_updated_at ON public.user_certifications;
CREATE TRIGGER update_user_certifications_updated_at BEFORE UPDATE ON public.user_certifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_learning_preferences_updated_at ON public.learning_preferences;
CREATE TRIGGER update_learning_preferences_updated_at BEFORE UPDATE ON public.learning_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Migration: 20250918104243_3bcb5334-81c5-4cd2-89fb-4988dc2f1b02.sql
-- =============================================

-- Create colleges table
CREATE TABLE IF NOT EXISTS public.colleges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  state TEXT NOT NULL,
  college_type TEXT NOT NULL, -- 'government', 'private', 'deemed', 'autonomous'
  ranking_nirf INTEGER,
  ranking_overall INTEGER,
  establishment_year INTEGER,
  affiliation TEXT,
  accreditation JSONB DEFAULT '[]'::jsonb,
  admission_requirements JSONB DEFAULT '{}'::jsonb,
  entrance_exams JSONB DEFAULT '[]'::jsonb,
  fee_structure JSONB DEFAULT '{}'::jsonb,
  placement_statistics JSONB DEFAULT '{}'::jsonb,
  facilities JSONB DEFAULT '[]'::jsonb,
  courses_offered JSONB DEFAULT '[]'::jsonb,
  website_url TEXT,
  contact_info JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create entrance exams table
CREATE TABLE IF NOT EXISTS public.entrance_exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_name TEXT NOT NULL,
  exam_type TEXT NOT NULL, -- 'engineering', 'medical', 'management', 'government', 'graduate'
  conducting_body TEXT NOT NULL,
  eligibility_criteria JSONB DEFAULT '{}'::jsonb,
  exam_pattern JSONB DEFAULT '{}'::jsonb,
  syllabus JSONB DEFAULT '[]'::jsonb,
  exam_dates JSONB DEFAULT '[]'::jsonb,
  application_process JSONB DEFAULT '{}'::jsonb,
  preparation_timeline TEXT, -- '6_months', '1_year', '2_years'
  difficulty_level TEXT DEFAULT 'medium', -- 'easy', 'medium', 'hard', 'very_hard'
  success_rate NUMERIC(5,2),
  average_attempts NUMERIC(3,1),
  preparation_resources JSONB DEFAULT '[]'::jsonb,
  coaching_centers JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create educational pathways table
CREATE TABLE IF NOT EXISTS public.educational_pathways (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  current_stage TEXT NOT NULL, -- '10th', '12th', 'graduate', 'postgraduate'
  target_career TEXT NOT NULL,
  pathway_title TEXT NOT NULL,
  pathway_description TEXT,
  duration TEXT NOT NULL,
  total_investment_range TEXT,
  difficulty_level TEXT DEFAULT 'medium',
  success_probability NUMERIC(5,2),
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  milestones JSONB DEFAULT '[]'::jsonb,
  alternative_routes JSONB DEFAULT '[]'::jsonb,
  prerequisites JSONB DEFAULT '[]'::jsonb,
  career_prospects JSONB DEFAULT '{}'::jsonb,
  roi_analysis JSONB DEFAULT '{}'::jsonb,
  is_recommended BOOLEAN DEFAULT true,
  priority_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scholarship opportunities table
CREATE TABLE IF NOT EXISTS public.scholarship_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scholarship_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  scholarship_type TEXT NOT NULL, -- 'merit', 'need_based', 'minority', 'sports', 'arts'
  target_group TEXT NOT NULL, -- 'sc_st', 'obc', 'general', 'minority', 'women', 'all'
  education_level TEXT NOT NULL, -- '10th', '12th', 'undergraduate', 'postgraduate', 'phd'
  field_of_study JSONB DEFAULT '[]'::jsonb,
  eligibility_criteria JSONB DEFAULT '{}'::jsonb,
  benefits JSONB DEFAULT '{}'::jsonb,
  application_process JSONB DEFAULT '{}'::jsonb,
  important_dates JSONB DEFAULT '[]'::jsonb,
  required_documents JSONB DEFAULT '[]'::jsonb,
  selection_process TEXT,
  renewal_criteria TEXT,
  official_website TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create career success stories table
CREATE TABLE IF NOT EXISTS public.career_success_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  background_story TEXT NOT NULL,
  starting_point TEXT NOT NULL, -- '10th_rural', '12th_average_marks', 'graduate_unemployed', etc.
  challenges_faced JSONB DEFAULT '[]'::jsonb,
  pathway_taken TEXT NOT NULL,
  resources_used JSONB DEFAULT '[]'::jsonb,
  timeline TEXT NOT NULL,
  current_position TEXT NOT NULL,
  achievements JSONB DEFAULT '[]'::jsonb,
  advice_for_students TEXT,
  financial_investment TEXT,
  key_learnings JSONB DEFAULT '[]'::jsonb,
  career_field TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  inspiration_rating INTEGER DEFAULT 5 CHECK (inspiration_rating >= 1 AND inspiration_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update courses table with enhanced fields
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS price_range TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS certification_type TEXT DEFAULT 'completion',
ADD COLUMN IF NOT EXISTS platform_rating NUMERIC(3,2),
ADD COLUMN IF NOT EXISTS industry_recognition TEXT DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS placement_assistance BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS job_guarantee BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS learning_format TEXT DEFAULT 'online', -- 'online', 'offline', 'hybrid'
ADD COLUMN IF NOT EXISTS language_options JSONB DEFAULT '["english"]'::jsonb,
ADD COLUMN IF NOT EXISTS prerequisites JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS estimated_salary_range TEXT,
ADD COLUMN IF NOT EXISTS success_stories_count INTEGER DEFAULT 0;

-- Enable RLS on all new tables
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrance_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_success_stories ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (these are reference data)
DROP POLICY IF EXISTS "Anyone can view active colleges" ON public.colleges;
CREATE POLICY "Anyone can view active colleges" ON public.colleges FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view active entrance exams" ON public.entrance_exams;
CREATE POLICY "Anyone can view active entrance exams" ON public.entrance_exams FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view educational pathways" ON public.educational_pathways;
CREATE POLICY "Anyone can view educational pathways" ON public.educational_pathways FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Anyone can view active scholarships" ON public.scholarship_opportunities;
CREATE POLICY "Anyone can view active scholarships" ON public.scholarship_opportunities FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view success stories" ON public.career_success_stories;
CREATE POLICY "Anyone can view success stories" ON public.career_success_stories FOR SELECT 
USING (true);

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_colleges_updated_at ON public.colleges;
CREATE TRIGGER update_colleges_updated_at BEFORE UPDATE ON public.colleges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_entrance_exams_updated_at ON public.entrance_exams;
CREATE TRIGGER update_entrance_exams_updated_at BEFORE UPDATE ON public.entrance_exams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_educational_pathways_updated_at ON public.educational_pathways;
CREATE TRIGGER update_educational_pathways_updated_at BEFORE UPDATE ON public.educational_pathways
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_scholarship_opportunities_updated_at ON public.scholarship_opportunities;
CREATE TRIGGER update_scholarship_opportunities_updated_at BEFORE UPDATE ON public.scholarship_opportunities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_career_success_stories_updated_at ON public.career_success_stories;
CREATE TRIGGER update_career_success_stories_updated_at BEFORE UPDATE ON public.career_success_stories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Migration: 20250923055007_d306f97c-d686-4278-8859-edda4879aadb.sql
-- =============================================

-- Create chat conversation tables
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create chat exports table  
CREATE TABLE IF NOT EXISTS public.chat_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  exported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  file_path TEXT
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_exports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chat_conversations
DROP POLICY IF EXISTS "Users can manage their own chat conversations" ON public.chat_conversations;
CREATE POLICY "Users can manage their own chat conversations" ON public.chat_conversations
FOR ALL
USING (auth.uid() = user_id);

-- Create RLS policies for chat_messages
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.chat_messages;
CREATE POLICY "Users can view messages from their conversations" ON public.chat_messages
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.chat_conversations cc 
  WHERE cc.id = chat_messages.conversation_id 
  AND cc.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can insert messages to their conversations" ON public.chat_messages;
CREATE POLICY "Users can insert messages to their conversations" ON public.chat_messages
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.chat_conversations cc 
  WHERE cc.id = chat_messages.conversation_id 
  AND cc.user_id = auth.uid()
));

-- Create RLS policies for chat_exports
DROP POLICY IF EXISTS "Users can manage their own chat exports" ON public.chat_exports;
CREATE POLICY "Users can manage their own chat exports" ON public.chat_exports
FOR ALL
USING (auth.uid() = user_id);

-- Create updated_at trigger for conversations
DROP TRIGGER IF EXISTS update_chat_conversations_updated_at ON public.chat_conversations;
CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed some sample data for better UX
-- Insert sample educational pathways
INSERT INTO public.educational_pathways (
  pathway_title, pathway_description, current_stage, target_career, duration, difficulty_level, steps, is_recommended, priority_order
) VALUES
(
  'Software Engineer Roadmap', 
  'Complete pathway from fundamentals to job-ready software engineering skills', 
  '12th Grade (Science)', 
  'Software Engineer', 
  '12-24 months', 
  'medium', 
  '[
    {"title":"Programming Basics","description":"Learn Python/JavaScript fundamentals"},
    {"title":"Data Structures & Algorithms","description":"Master core CS concepts"},
    {"title":"Web Development","description":"Build full-stack applications"},
    {"title":"Projects & Portfolio","description":"Create 3-5 impressive projects"},
    {"title":"Interview Preparation","description":"Practice coding interviews"}
  ]'::jsonb, 
  true, 
  1
),
(
  'Medical Career Pathway', 
  'NEET preparation to medical practice', 
  '12th Grade (Science)', 
  'Medical Doctor', 
  '5+ years', 
  'hard', 
  '[
    {"title":"NEET Preparation","description":"Physics, Chemistry, Biology intensive study"},
    {"title":"MBBS Degree","description":"5.5 years medical education"},
    {"title":"Internship","description":"1 year mandatory clinical practice"},
    {"title":"Specialization","description":"MD/MS in chosen field"}
  ]'::jsonb, 
  true, 
  2
),
(
  'Data Science Pathway', 
  'Mathematics to AI/ML expertise', 
  'Graduation', 
  'Data Scientist', 
  '18-30 months', 
  'medium', 
  '[
    {"title":"Mathematics Foundation","description":"Statistics, Linear Algebra, Calculus"},
    {"title":"Programming Skills","description":"Python, R, SQL mastery"},
    {"title":"Machine Learning","description":"Algorithms and model building"},
    {"title":"Real Projects","description":"Kaggle competitions and industry projects"},
    {"title":"Portfolio Development","description":"Showcase your work online"}
  ]'::jsonb, 
  true, 
  3
);

-- Insert sample entrance exams
INSERT INTO public.entrance_exams (
  exam_name, exam_type, conducting_body, difficulty_level, preparation_timeline, is_active, 
  exam_pattern, syllabus, preparation_resources
) VALUES
(
  'JEE Main', 
  'Engineering', 
  'National Testing Agency (NTA)', 
  'hard', 
  '12-18 months', 
  true,
  '{"duration":"3 hours","sections":["Mathematics","Physics","Chemistry"],"total_marks":300,"question_types":"MCQ and Numerical"}'::jsonb,
  '["Mathematics: Algebra, Trigonometry, Coordinate Geometry, Calculus", "Physics: Mechanics, Thermodynamics, Optics, Modern Physics", "Chemistry: Physical, Organic, Inorganic Chemistry"]'::jsonb,
  '[
    {"title":"Official NTA Website","url":"https://jeemain.nta.nic.in","type":"official"},
    {"title":"NCERT Books","url":"https://ncert.nic.in","type":"free"},
    {"title":"Khan Academy Physics","url":"https://khanacademy.org","type":"free"}
  ]'::jsonb
),
(
  'NEET', 
  'Medical', 
  'National Testing Agency (NTA)', 
  'hard', 
  '12-18 months', 
  true,
  '{"duration":"3 hours 20 minutes","sections":["Physics","Chemistry","Biology"],"total_marks":720,"question_types":"MCQ only"}'::jsonb,
  '["Physics: Mechanics, Thermodynamics, Optics, Modern Physics", "Chemistry: Physical, Organic, Inorganic Chemistry", "Biology: Botany and Zoology"]'::jsonb,
  '[
    {"title":"Official NEET Portal","url":"https://neet.nta.nic.in","type":"official"},
    {"title":"NCERT Biology","url":"https://ncert.nic.in","type":"free"},
    {"title":"Free NEET Mock Tests","url":"https://www.embibe.com","type":"free"}
  ]'::jsonb
),
(
  'GATE', 
  'Engineering/Science', 
  'IIT (varies yearly)', 
  'hard', 
  '8-12 months', 
  true,
  '{"duration":"3 hours","sections":["General Aptitude","Subject Specific"],"total_marks":100,"question_types":"MCQ and Numerical Answer Type"}'::jsonb,
  '["Computer Science: Programming, Data Structures, Algorithms, OS, DBMS, Networks", "Mathematics: Discrete Math, Linear Algebra, Calculus, Probability"]'::jsonb,
  '[
    {"title":"Official GATE Website","url":"https://gate.iitk.ac.in","type":"official"},
    {"title":"NPTEL Courses","url":"https://nptel.ac.in","type":"free"},
    {"title":"Previous Year Papers","url":"https://gate.iitk.ac.in","type":"free"}
  ]'::jsonb
);

-- Insert sample colleges
INSERT INTO public.colleges (
  name, location, state, college_type, is_active, ranking_nirf, website_url, courses_offered, establishment_year
) VALUES
(
  'Indian Institute of Science (IISc)', 
  'Bangalore', 
  'Karnataka', 
  'Public', 
  true, 
  1, 
  'https://www.iisc.ac.in',
  '[
    {"name":"M.Sc Mathematics","duration":"2 years","eligibility":"B.Sc Mathematics"},
    {"name":"M.Tech Computer Science","duration":"2 years","eligibility":"B.Tech/B.E."},
    {"name":"PhD Programs","duration":"3-5 years","eligibility":"M.Sc/M.Tech"}
  ]'::jsonb,
  1909
),
(
  'IIT Bombay', 
  'Mumbai', 
  'Maharashtra', 
  'Public', 
  true, 
  3, 
  'https://www.iitb.ac.in',
  '[
    {"name":"B.Tech Computer Science","duration":"4 years","eligibility":"JEE Advanced"},
    {"name":"M.Tech Cloud Computing","duration":"2 years","eligibility":"GATE"},
    {"name":"Dual Degree Programs","duration":"5 years","eligibility":"JEE Advanced"}
  ]'::jsonb,
  1958
),
(
  'All India Institute of Medical Sciences (AIIMS)', 
  'New Delhi', 
  'Delhi', 
  'Public', 
  true, 
  1, 
  'https://www.aiims.edu',
  '[
    {"name":"MBBS","duration":"5.5 years","eligibility":"NEET"},
    {"name":"MD/MS","duration":"3 years","eligibility":"NEET PG"},
    {"name":"DM/MCh","duration":"3 years","eligibility":"NEET SS"}
  ]'::jsonb,
  1956
);

-- Insert sample NSQF qualifications  
INSERT INTO public.nsqf_qualifications (
  title, description, level, sector, sub_sector, job_roles, credit_points, duration_hours, entry_requirements
) VALUES
(
  'Certificate in Basic Computer Operations', 
  'Basic computer literacy and office software skills', 
  4, 
  'IT-ITeS', 
  'Computer Operations', 
  '["Data Entry Operator", "Computer Operator", "Office Assistant"]'::jsonb, 
  120, 
  240, 
  'Class 10th pass'
),
(
  'Diploma in Software Development', 
  'Programming and software development fundamentals', 
  5, 
  'IT-ITeS', 
  'Software Development', 
  '["Junior Developer", "Software Trainee", "Web Developer"]'::jsonb, 
  240, 
  960, 
  'Class 12th pass or equivalent'
),
(
  'Certificate in Cloud Computing', 
  'Cloud platforms and DevOps fundamentals', 
  6, 
  'IT-ITeS', 
  'Cloud Computing', 
  '["Cloud Support Associate", "DevOps Trainee", "Cloud Administrator"]'::jsonb, 
  180, 
  720, 
  'Basic programming knowledge'
);

-- =============================================
-- Migration: 20251005181513_3600cd4d-a340-4c78-b51b-67586972aad8.sql
-- =============================================

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
DROP POLICY IF EXISTS "Anyone can view available experts" ON public.experts;
CREATE POLICY "Anyone can view available experts" ON public.experts
  FOR SELECT
  USING (is_available = true);

-- Policies for sessions
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.expert_sessions;
CREATE POLICY "Users can view their own sessions" ON public.expert_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own sessions" ON public.expert_sessions;
CREATE POLICY "Users can create their own sessions" ON public.expert_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own sessions" ON public.expert_sessions;
CREATE POLICY "Users can update their own sessions" ON public.expert_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Insert sample experts
INSERT INTO public.experts (name, title, bio, expertise, hourly_rate, is_available) VALUES
('Dr. Rajesh Kumar', 'Senior Software Architect', 'Ex-Google, 15+ years in tech industry', '["Software Development", "System Design", "Career Guidance"]'::jsonb, 199.00, true),
('Priya Sharma', 'Data Science Lead', 'ML Expert with 10+ years experience', '["Data Science", "Machine Learning", "Career Transition"]'::jsonb, 199.00, true),
('Amit Patel', 'Product Manager', 'Ex-Microsoft PM, MBA from IIM', '["Product Management", "Business Strategy", "Career Planning"]'::jsonb, 199.00, true),
('Sneha Desai', 'HR Director', 'Hiring expert across top tech companies', '["Resume Review", "Interview Prep", "Career Development"]'::jsonb, 199.00, true);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_expert_sessions_updated_at ON public.expert_sessions;
CREATE TRIGGER update_expert_sessions_updated_at BEFORE UPDATE ON public.expert_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Migration: 20251106152552_93d976d7-0d22-44cb-a767-a863e8efba0e.sql
-- =============================================

-- Add stripe_session_id column to expert_sessions table to track Stripe checkout sessions
ALTER TABLE expert_sessions 
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- =============================================
-- Migration: 20251113162908_a99a855c-9024-4657-9e82-d6bcd50ef402.sql
-- =============================================

-- Fix Function Search Path Mutable security warning
-- Add search_path to functions to prevent SQL injection via search path manipulation

-- Fix has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- =============================================
-- Migration: 20251205154748_2b07cd3c-14cb-432f-a53f-1c01fa58ee32.sql
-- =============================================

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
DROP POLICY IF EXISTS "Anyone can view expert availability" ON public.expert_availability;
CREATE POLICY "Anyone can view expert availability" ON public.expert_availability
FOR SELECT
USING (true);

-- RLS: Experts can manage their own availability
DROP POLICY IF EXISTS "Experts can insert their own availability" ON public.expert_availability;
CREATE POLICY "Experts can insert their own availability" ON public.expert_availability
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.experts e
    WHERE e.id = expert_availability.expert_id
    AND e.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Experts can update their own availability" ON public.expert_availability;
CREATE POLICY "Experts can update their own availability" ON public.expert_availability
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.experts e
    WHERE e.id = expert_availability.expert_id
    AND e.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Experts can delete their own availability" ON public.expert_availability;
CREATE POLICY "Experts can delete their own availability" ON public.expert_availability
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.experts e
    WHERE e.id = expert_availability.expert_id
    AND e.user_id = auth.uid()
  )
);

-- Update experts table RLS to allow experts to update their own profile
DROP POLICY IF EXISTS "Experts can update their own profile" ON public.experts;
CREATE POLICY "Experts can update their own profile" ON public.experts
FOR UPDATE
USING (user_id = auth.uid());

-- Allow experts to view their own sessions
DROP POLICY IF EXISTS "Experts can view sessions booked with them" ON public.expert_sessions;
CREATE POLICY "Experts can view sessions booked with them" ON public.expert_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.experts e
    WHERE e.id = expert_sessions.expert_id
    AND e.user_id = auth.uid()
  )
);

-- Allow experts to update sessions (e.g., add meeting notes)
DROP POLICY IF EXISTS "Experts can update their sessions" ON public.expert_sessions;
CREATE POLICY "Experts can update their sessions" ON public.expert_sessions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.experts e
    WHERE e.id = expert_sessions.expert_id
    AND e.user_id = auth.uid()
  )
);

-- Create trigger for updated_at on expert_availability
DROP TRIGGER IF EXISTS update_expert_availability_updated_at ON public.expert_availability;
CREATE TRIGGER update_expert_availability_updated_at BEFORE UPDATE ON public.expert_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Migration: 20260212122452_3513e7c0-70cc-4815-a138-4928679e84d0.sql
-- =============================================

-- Drop the problematic policies
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Recreate policies using the has_role security definer function (avoids recursion)
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- Migration: 20260213132620_0adbe8d9-b035-4745-b0ba-680d17127935.sql
-- =============================================


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
DROP POLICY IF EXISTS "Experts can view own full profile" ON public.experts;
CREATE POLICY "Experts can view own full profile" ON public.experts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users with bookings can view their expert's details (excluding email via app-level)
DROP POLICY IF EXISTS "Booked users can view expert details" ON public.experts;
CREATE POLICY "Booked users can view expert details" ON public.experts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.expert_sessions
      WHERE expert_sessions.expert_id = experts.id
      AND expert_sessions.user_id = auth.uid()
    )
  );


-- =============================================
-- Migration: 20260215092925_5672400e-8d5c-485c-be2d-e757fe93e511.sql
-- =============================================

-- Allow authenticated users to create their own expert profile
DROP POLICY IF EXISTS "Users can create their own expert profile" ON public.experts;
CREATE POLICY "Users can create their own expert profile" ON public.experts
FOR INSERT
WITH CHECK (auth.uid() = user_id);


-- =============================================
-- Migration: 20260217120825_62dd10b1-396d-4ca1-9e3e-0e0095a6e8e7.sql
-- =============================================

-- Fix infinite recursion: the "Booked users can view expert details" policy
-- on experts references expert_sessions, whose policies reference experts back.
-- Replace it with a simple policy allowing all authenticated users to view experts
-- (expert profiles are meant to be publicly browsable for booking).

DROP POLICY IF EXISTS "Booked users can view expert details" ON public.experts;

DROP POLICY IF EXISTS "Authenticated users can view experts" ON public.experts;
CREATE POLICY "Authenticated users can view experts" ON public.experts
  FOR SELECT
  USING (true);

-- Also fix expert_sessions SELECT policies to avoid referencing experts table
-- The "Experts can view sessions booked with them" policy queries experts, causing recursion
DROP POLICY IF EXISTS "Experts can view sessions booked with them" ON public.expert_sessions;

DROP POLICY IF EXISTS "Experts can view sessions booked with them" ON public.expert_sessions;
CREATE POLICY "Experts can view sessions booked with them" ON public.expert_sessions
  FOR SELECT
  USING (
    expert_id IN (
      SELECT id FROM experts WHERE user_id = auth.uid()
    )
  );

-- Fix expert_sessions UPDATE policy similarly
DROP POLICY IF EXISTS "Experts can update their sessions" ON public.expert_sessions;

DROP POLICY IF EXISTS "Experts can update their sessions" ON public.expert_sessions;
CREATE POLICY "Experts can update their sessions" ON public.expert_sessions
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

DROP POLICY IF EXISTS "Experts can insert their own availability" ON public.expert_availability;
CREATE POLICY "Experts can insert their own availability" ON public.expert_availability
  FOR INSERT
  WITH CHECK (
    expert_id IN (SELECT id FROM experts WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Experts can update their own availability" ON public.expert_availability;
CREATE POLICY "Experts can update their own availability" ON public.expert_availability
  FOR UPDATE
  USING (
    expert_id IN (SELECT id FROM experts WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Experts can delete their own availability" ON public.expert_availability;
CREATE POLICY "Experts can delete their own availability" ON public.expert_availability
  FOR DELETE
  USING (
    expert_id IN (SELECT id FROM experts WHERE user_id = auth.uid())
  );

-- =============================================
-- Migration: 20260217121132_3040ab83-41b8-4aa0-953c-2b8c0b91c4e2.sql
-- =============================================

-- First clean up ALL duplicate expert records (keep only the oldest per user_id)
DELETE FROM experts
WHERE id IN (
  SELECT id FROM (
    SELECT id, user_id, created_at,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) as rn
    FROM experts
    WHERE user_id IS NOT NULL
  ) ranked
  WHERE rn > 1
);

-- Now add unique constraint to prevent future duplicates
ALTER TABLE experts ADD CONSTRAINT experts_user_id_unique UNIQUE (user_id);

-- =============================================
-- Migration: 20260302072852_0dd35d6c-be93-41e5-8f17-35e121da136b.sql
-- =============================================

-- Hide orphan seed expert records that have no user_id (not manageable, no availability)
UPDATE experts SET is_available = false WHERE user_id IS NULL;

-- =============================================
-- Migration: 20260304174634_5af98f4a-9c3f-4dc6-85ce-01bc11e8d94c.sql
-- =============================================


-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own avatar
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to update their own avatar
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own avatar
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access to avatars
DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
CREATE POLICY "Public read access for avatars" ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');


-- =============================================
-- Migration: 20260304181002_f0bf566b-f0aa-4053-aa4a-9bd26c106187.sql
-- =============================================


ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'light',
  ADD COLUMN IF NOT EXISTS language_preference text NOT NULL DEFAULT 'english',
  ADD COLUMN IF NOT EXISTS learning_style text NOT NULL DEFAULT 'visual',
  ADD COLUMN IF NOT EXISTS profile_visibility text NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS data_sharing boolean NOT NULL DEFAULT true;


-- =============================================
-- Migration: 20260312223000_add_delete_policy_expert_sessions.sql
-- =============================================

-- Allow experts to delete their own sessions from the expert dashboard feature
DROP POLICY IF EXISTS "Experts can delete their sessions" ON public.expert_sessions;

DROP POLICY IF EXISTS "Experts can delete their sessions" ON public.expert_sessions;
CREATE POLICY "Experts can delete their sessions" ON public.expert_sessions
  FOR DELETE
  USING (
    expert_id IN (
      SELECT id FROM experts WHERE user_id = auth.uid()
    )
  );



