-- Create chat conversation tables
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create chat exports table  
CREATE TABLE public.chat_exports (
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
CREATE POLICY "Users can manage their own chat conversations"
ON public.chat_conversations
FOR ALL
USING (auth.uid() = user_id);

-- Create RLS policies for chat_messages
CREATE POLICY "Users can view messages from their conversations"
ON public.chat_messages
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.chat_conversations cc 
  WHERE cc.id = chat_messages.conversation_id 
  AND cc.user_id = auth.uid()
));

CREATE POLICY "Users can insert messages to their conversations"
ON public.chat_messages
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.chat_conversations cc 
  WHERE cc.id = chat_messages.conversation_id 
  AND cc.user_id = auth.uid()
));

-- Create RLS policies for chat_exports
CREATE POLICY "Users can manage their own chat exports"
ON public.chat_exports
FOR ALL
USING (auth.uid() = user_id);

-- Create updated_at trigger for conversations
CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON public.chat_conversations
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