-- ====================================================================
-- SAHIRAAH DEMO DATA & ADMIN/EXPERT ACCOUNTS SEED SCRIPT
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ensure any optional columns exist
ALTER TABLE public.user_career_history ADD COLUMN IF NOT EXISTS is_selected BOOLEAN DEFAULT false;

DO $$
DECLARE
  v_admin_id UUID := 'a0000000-0000-0000-0000-000000000001';
  v_student_id UUID := 'b0000000-0000-0000-0000-000000000002';
  v_expert_id UUID := 'e0000000-0000-0000-0000-000000000001';
  v_session_id UUID := 'c0000000-0000-0000-0000-000000000001';
  v_course_1 UUID;
  v_course_2 UUID;
  v_course_3 UUID;
BEGIN

  -- ------------------------------------------------------------------
  -- 1. CREATE ADMIN / EXPERT USER (admin@sahiraah.com / AdminPassword123!)
  -- ------------------------------------------------------------------
  DELETE FROM auth.identities WHERE user_id = v_admin_id OR identity_data->>'email' = 'admin@sahiraah.com';
  DELETE FROM auth.users WHERE id = v_admin_id OR email = 'admin@sahiraah.com';

  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
  ) VALUES (
    v_admin_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@sahiraah.com',
    crypt('AdminPassword123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Dr. Rajesh Kumar","full_name":"Dr. Rajesh Kumar"}'::jsonb,
    now(),
    now(),
    'authenticated',
    'authenticated'
  );

  BEGIN
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      v_admin_id::text,
      v_admin_id,
      json_build_object('sub', v_admin_id, 'email', 'admin@sahiraah.com')::jsonb,
      'email',
      now(),
      now(),
      now()
    );
  EXCEPTION WHEN others THEN
    BEGIN
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        v_admin_id::text,
        v_admin_id,
        json_build_object('sub', v_admin_id, 'email', 'admin@sahiraah.com')::jsonb,
        'email',
        v_admin_id::text,
        now(),
        now(),
        now()
      );
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END;

  -- Assign admin & expert roles
  DELETE FROM public.user_roles WHERE user_id = v_admin_id;
  INSERT INTO public.user_roles (user_id, role) VALUES 
    (v_admin_id, 'admin'),
    (v_admin_id, 'expert');

  -- Admin user profile
  INSERT INTO public.user_profiles (id, name, email, bio, location, preferred_language, profile_completion_percentage)
  VALUES (
    v_admin_id,
    'Dr. Rajesh Kumar',
    'admin@sahiraah.com',
    'Senior Software Architect & Chief Career Mentor at SahiRaah',
    'Bengaluru, India',
    'english',
    100
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    bio = EXCLUDED.bio;

  -- Link / Create Expert profile for Admin
  DELETE FROM public.experts WHERE id = v_expert_id OR email = 'admin@sahiraah.com';
  INSERT INTO public.experts (
    id,
    user_id,
    name,
    email,
    title,
    bio,
    expertise,
    hourly_rate,
    is_available
  ) VALUES (
    v_expert_id,
    v_admin_id,
    'Dr. Rajesh Kumar',
    'admin@sahiraah.com',
    'Senior Software Architect & Career Mentor',
    'Ex-Google Lead Engineer with 15+ years experience in Full-Stack, Cloud Systems, and AI Career Guidance.',
    '["Software Development", "System Design", "Cloud Architecture", "Career Strategy"]'::jsonb,
    499.00,
    true
  );

  -- ------------------------------------------------------------------
  -- 2. CREATE STUDENT DEMO USER (student@sahiraah.com / StudentPassword123!)
  -- ------------------------------------------------------------------
  DELETE FROM auth.identities WHERE user_id = v_student_id OR identity_data->>'email' = 'student@sahiraah.com';
  DELETE FROM auth.users WHERE id = v_student_id OR email = 'student@sahiraah.com';

  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
  ) VALUES (
    v_student_id,
    '00000000-0000-0000-0000-000000000000',
    'student@sahiraah.com',
    crypt('StudentPassword123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Aarav Sharma","full_name":"Aarav Sharma"}'::jsonb,
    now(),
    now(),
    'authenticated',
    'authenticated'
  );

  BEGIN
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      v_student_id::text,
      v_student_id,
      json_build_object('sub', v_student_id, 'email', 'student@sahiraah.com')::jsonb,
      'email',
      now(),
      now(),
      now()
    );
  EXCEPTION WHEN others THEN
    BEGIN
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        v_student_id::text,
        v_student_id,
        json_build_object('sub', v_student_id, 'email', 'student@sahiraah.com')::jsonb,
        'email',
        v_student_id::text,
        now(),
        now(),
        now()
      );
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END;

  -- Assign user role
  DELETE FROM public.user_roles WHERE user_id = v_student_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_student_id, 'user');

  -- Student user profile
  INSERT INTO public.user_profiles (
    id,
    name,
    email,
    bio,
    location,
    state,
    preferred_language,
    current_qualification,
    profile_completion_percentage,
    skills_interests,
    career_aspirations
  ) VALUES (
    v_student_id,
    'Aarav Sharma',
    'student@sahiraah.com',
    'Passionate about software development, cloud systems, and problem-solving.',
    'Bengaluru',
    'Karnataka',
    'english',
    'B.Tech 3rd Year (Computer Science)',
    95,
    '["Python", "Full Stack Web", "Algorithms", "Cloud Computing"]'::jsonb,
    '["Full-Stack Software Engineer", "Cloud Architect"]'::jsonb
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    profile_completion_percentage = EXCLUDED.profile_completion_percentage;

  -- Student Preferences
  INSERT INTO public.user_preferences (
    user_id,
    theme,
    language_preference,
    learning_style,
    learning_pace,
    profile_visibility,
    data_sharing
  ) VALUES (
    v_student_id,
    'light',
    'en',
    'visual',
    'moderate',
    'public',
    true
  ) ON CONFLICT (user_id) DO NOTHING;

  -- ------------------------------------------------------------------
  -- 3. SEED STUDENT QUIZ RESULTS & CAREER RECOMMENDATIONS
  -- ------------------------------------------------------------------
  DELETE FROM public.user_quiz_answers WHERE user_id = v_student_id;
  DELETE FROM public.user_quiz_sessions WHERE user_id = v_student_id;

  INSERT INTO public.user_quiz_sessions (
    id,
    user_id,
    student_name,
    education_level,
    total_questions,
    current_question_index,
    is_completed,
    session_started_at,
    session_completed_at,
    strengths,
    weaknesses,
    career_recommendations
  ) VALUES (
    v_session_id,
    v_student_id,
    'Aarav Sharma',
    'College/University',
    25,
    25,
    true,
    now() - INTERVAL '3 days',
    now() - INTERVAL '3 days',
    '["Analytical Thinking", "Coding Consistency", "System Architecture"]'::jsonb,
    '["Database Query Optimization", "Docker Containerization"]'::jsonb,
    '[{"title": "Software Developer", "match": 95, "field": "Technology"}, {"title": "Cloud Architect", "match": 88, "field": "Cloud Systems"}]'::jsonb
  );

  -- Completed quiz answers
  INSERT INTO public.user_quiz_answers (
    session_id,
    user_id,
    question_number,
    question_category,
    question_text,
    answer_text
  ) VALUES 
    (v_session_id, v_student_id, 1, 'interests', 'What type of problems do you enjoy solving?', 'Building applications and automating tasks with code'),
    (v_session_id, v_student_id, 2, 'work_environment', 'Preferred work environment?', 'Collaborative tech team working on high-impact products'),
    (v_session_id, v_student_id, 3, 'skills', 'Strongest skill set?', 'Logical reasoning, Python programming, and frontend design');

  -- Legacy quiz responses (for backward compatibility)
  DELETE FROM public.user_quiz_responses WHERE user_id = v_student_id;
  INSERT INTO public.user_quiz_responses (user_id, question, answer) VALUES
    (v_student_id, 'What type of problems do you enjoy solving?', 'Building applications and automating tasks with code'),
    (v_student_id, 'Preferred work environment?', 'Collaborative tech team working on high-impact products'),
    (v_student_id, 'Strongest skill set?', 'Logical reasoning, Python programming, and frontend design');

  -- Career history & personalized roadmap
  DELETE FROM public.user_career_history WHERE user_id = v_student_id;
  INSERT INTO public.user_career_history (
    user_id,
    session_id,
    career,
    reason,
    roadmap_summary,
    strengths,
    weaknesses,
    improvement_areas,
    tags,
    courses,
    is_selected,
    links_clicked
  ) VALUES (
    v_student_id,
    v_session_id,
    'Software Developer',
    'High algorithmic aptitude, exceptional pattern recognition, and strong interest in modern web and cloud architecture.',
    'Stage 1: Master DSA & Version Control -> Stage 2: Full-Stack React & Node.js -> Stage 3: Microservices & Cloud Deployment',
    '["Analytical Thinking", "Coding Consistency", "System Architecture"]'::jsonb,
    '["Database Query Optimization", "Docker Containerization"]'::jsonb,
    '["Practice System Design interview questions", "Build and deploy 2 production projects"]'::jsonb,
    ARRAY['Software Development', 'Full-Stack', 'High-Growth Tech', 'AI Tools'],
    '[{"title": "Programming Fundamentals", "duration": "4 weeks"}, {"title": "Full-Stack Web Development", "duration": "8 weeks"}]'::jsonb,
    true,
    true
  );

  -- ------------------------------------------------------------------
  -- 4. SEED COURSE PROGRESS
  -- ------------------------------------------------------------------
  SELECT id INTO v_course_1 FROM public.courses WHERE career_path = 'Software Developer' LIMIT 1;
  SELECT id INTO v_course_2 FROM public.courses WHERE career_path = 'Software Developer' OFFSET 1 LIMIT 1;
  SELECT id INTO v_course_3 FROM public.courses WHERE career_path != 'Software Developer' LIMIT 1;

  IF v_course_1 IS NOT NULL THEN
    DELETE FROM public.user_course_progress WHERE user_id = v_student_id;
    
    INSERT INTO public.user_course_progress (user_id, course_id, completed, started_at, completed_at)
    VALUES (v_student_id, v_course_1, true, now() - INTERVAL '14 days', now() - INTERVAL '2 days');

    IF v_course_2 IS NOT NULL THEN
      INSERT INTO public.user_course_progress (user_id, course_id, completed, started_at, completed_at)
      VALUES (v_student_id, v_course_2, false, now() - INTERVAL '2 days', NULL);
    END IF;

    IF v_course_3 IS NOT NULL THEN
      INSERT INTO public.user_learning_paths (user_id, career_path, course_id, is_active)
      VALUES (v_student_id, 'Software Developer', v_course_1, true)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- ------------------------------------------------------------------
  -- 5. SEED 1-ON-1 EXPERT SESSIONS
  -- ------------------------------------------------------------------
  DELETE FROM public.expert_sessions WHERE user_id = v_student_id OR expert_id = v_expert_id;

  -- Past completed session
  INSERT INTO public.expert_sessions (
    expert_id,
    user_id,
    session_date,
    duration_minutes,
    session_status,
    amount_paid,
    meeting_link,
    notes
  ) VALUES (
    v_expert_id,
    v_student_id,
    now() - INTERVAL '5 days',
    45,
    'completed',
    499.00,
    'https://meet.jit.si/CareerGuidanceSahiraahPast',
    'Initial mentorship session. Discussed Aarav''s software roadmap and recommended focusing on React + TypeScript.'
  );

  -- Upcoming scheduled session
  INSERT INTO public.expert_sessions (
    expert_id,
    user_id,
    session_date,
    duration_minutes,
    session_status,
    amount_paid,
    meeting_link,
    notes
  ) VALUES (
    v_expert_id,
    v_student_id,
    now() + INTERVAL '2 days',
    60,
    'scheduled',
    499.00,
    'https://meet.jit.si/CareerGuidanceSahiraahUpcoming',
    'Follow-up: Full-stack portfolio review and mock system design interview.'
  );

END
$$;