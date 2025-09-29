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
CREATE POLICY "Anyone can view active NSQF qualifications" 
ON public.nsqf_qualifications 
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
CREATE POLICY "Anyone can view active skill categories" 
ON public.skill_categories 
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
CREATE POLICY "Users can manage their own skill assessments" 
ON public.comprehensive_skill_assessments 
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
CREATE POLICY "Anyone can view active certification providers" 
ON public.certification_providers 
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
CREATE POLICY "Users can manage their own certifications" 
ON public.user_certifications 
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
CREATE POLICY "Users can manage their own learning preferences" 
ON public.learning_preferences 
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
CREATE TRIGGER update_nsqf_qualifications_updated_at BEFORE UPDATE ON public.nsqf_qualifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comprehensive_skill_assessments_updated_at BEFORE UPDATE ON public.comprehensive_skill_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_certifications_updated_at BEFORE UPDATE ON public.user_certifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_preferences_updated_at BEFORE UPDATE ON public.learning_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();