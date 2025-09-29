-- Create colleges table
CREATE TABLE public.colleges (
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
CREATE TABLE public.entrance_exams (
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
CREATE TABLE public.educational_pathways (
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
CREATE TABLE public.scholarship_opportunities (
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
CREATE TABLE public.career_success_stories (
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
CREATE POLICY "Anyone can view active colleges" 
ON public.colleges FOR SELECT 
USING (is_active = true);

CREATE POLICY "Anyone can view active entrance exams" 
ON public.entrance_exams FOR SELECT 
USING (is_active = true);

CREATE POLICY "Anyone can view educational pathways" 
ON public.educational_pathways FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view active scholarships" 
ON public.scholarship_opportunities FOR SELECT 
USING (is_active = true);

CREATE POLICY "Anyone can view success stories" 
ON public.career_success_stories FOR SELECT 
USING (true);

-- Add triggers for updated_at columns
CREATE TRIGGER update_colleges_updated_at
BEFORE UPDATE ON public.colleges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_entrance_exams_updated_at
BEFORE UPDATE ON public.entrance_exams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_educational_pathways_updated_at
BEFORE UPDATE ON public.educational_pathways
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scholarship_opportunities_updated_at
BEFORE UPDATE ON public.scholarship_opportunities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_career_success_stories_updated_at
BEFORE UPDATE ON public.career_success_stories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();