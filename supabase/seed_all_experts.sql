-- ====================================================================
-- SAHIRAAH SEED ALL EXPERTS SCRIPT
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  v_student_id UUID := 'b0000000-0000-0000-0000-000000000002';
  
  -- Expert 1: Dr. Rajesh Kumar (Tech & Architecture)
  v_e1_uid UUID := 'e1000000-0000-0000-0000-000000000001';
  v_e1_id  UUID := 'e1000000-0000-0000-0000-000000000011';
  
  -- Expert 2: Priya Sharma (Data Science & AI)
  v_e2_uid UUID := 'e2000000-0000-0000-0000-000000000002';
  v_e2_id  UUID := 'e2000000-0000-0000-0000-000000000022';
  
  -- Expert 3: Amit Patel (Product Management & Business)
  v_e3_uid UUID := 'e3000000-0000-0000-0000-000000000003';
  v_e3_id  UUID := 'e3000000-0000-0000-0000-000000000033';
  
  -- Expert 4: Sneha Desai (HR & Career Coaching)
  v_e4_uid UUID := 'e4000000-0000-0000-0000-000000000004';
  v_e4_id  UUID := 'e4000000-0000-0000-0000-000000000044';

BEGIN

  -- Clean up prior demo expert users if any
  -- First delete sessions referencing any existing experts with these names/emails
  DELETE FROM public.expert_sessions WHERE expert_id IN (
    SELECT id FROM public.experts 
    WHERE email IN ('admin@sahiraah.com', 'rajesh@sahiraah.com', 'priya@sahiraah.com', 'amit@sahiraah.com', 'sneha@sahiraah.com')
       OR name IN ('Dr. Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Desai')
       OR id IN (v_e1_id, v_e2_id, v_e3_id, v_e4_id)
  );
  DELETE FROM public.expert_availability WHERE expert_id IN (
    SELECT id FROM public.experts 
    WHERE email IN ('admin@sahiraah.com', 'rajesh@sahiraah.com', 'priya@sahiraah.com', 'amit@sahiraah.com', 'sneha@sahiraah.com')
       OR name IN ('Dr. Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Desai')
       OR id IN (v_e1_id, v_e2_id, v_e3_id, v_e4_id)
  );
  DELETE FROM public.experts 
  WHERE email IN ('admin@sahiraah.com', 'rajesh@sahiraah.com', 'priya@sahiraah.com', 'amit@sahiraah.com', 'sneha@sahiraah.com')
     OR name IN ('Dr. Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Desai')
     OR id IN (v_e1_id, v_e2_id, v_e3_id, v_e4_id);
  
  -- Now clean auth users
  DELETE FROM auth.identities WHERE identity_data->>'email' IN ('admin@sahiraah.com', 'rajesh@sahiraah.com', 'priya@sahiraah.com', 'amit@sahiraah.com', 'sneha@sahiraah.com');
  DELETE FROM auth.users WHERE email IN ('admin@sahiraah.com', 'rajesh@sahiraah.com', 'priya@sahiraah.com', 'amit@sahiraah.com', 'sneha@sahiraah.com');

  -- ==================================================================
  -- 1. DR. RAJESH KUMAR (Admin & Software Architect)
  -- Email: rajesh@sahiraah.com (or admin@sahiraah.com) | Pass: Expert123!
  -- ==================================================================
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
  VALUES (v_e1_uid, '00000000-0000-0000-0000-000000000000', 'admin@sahiraah.com', crypt('Expert123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Dr. Rajesh Kumar","full_name":"Dr. Rajesh Kumar"}'::jsonb, now(), now(), 'authenticated', 'authenticated');

  BEGIN
    INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (v_e1_uid::text, v_e1_uid, json_build_object('sub', v_e1_uid, 'email', 'admin@sahiraah.com')::jsonb, 'email', now(), now(), now());
  EXCEPTION WHEN others THEN
    BEGIN
      INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
      VALUES (v_e1_uid::text, v_e1_uid, json_build_object('sub', v_e1_uid, 'email', 'admin@sahiraah.com')::jsonb, 'email', v_e1_uid::text, now(), now(), now());
    EXCEPTION WHEN others THEN NULL; END;
  END;

  INSERT INTO public.user_roles (user_id, role) VALUES (v_e1_uid, 'admin'), (v_e1_uid, 'expert');
  INSERT INTO public.user_profiles (id, name, email, bio, location, preferred_language, profile_completion_percentage)
  VALUES (v_e1_uid, 'Dr. Rajesh Kumar', 'admin@sahiraah.com', 'Senior Software Architect & Ex-Google Lead. 15+ years mentoring engineering careers.', 'Bengaluru, India', 'english', 100);

  INSERT INTO public.experts (id, user_id, name, email, title, bio, expertise, hourly_rate, is_available)
  VALUES (v_e1_id, v_e1_uid, 'Dr. Rajesh Kumar', 'admin@sahiraah.com', 'Senior Software Architect', 'Ex-Google, 15+ years in tech industry. Specialized in System Design, Backend, and AI transitions.', '["Software Development", "System Design", "Cloud Architecture", "Career Guidance"]'::jsonb, 499.00, true);

  -- ==================================================================
  -- 2. PRIYA SHARMA (Data Science & ML Lead)
  -- Email: priya@sahiraah.com | Pass: Expert123!
  -- ==================================================================
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
  VALUES (v_e2_uid, '00000000-0000-0000-0000-000000000000', 'priya@sahiraah.com', crypt('Expert123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Priya Sharma","full_name":"Priya Sharma"}'::jsonb, now(), now(), 'authenticated', 'authenticated');

  BEGIN
    INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (v_e2_uid::text, v_e2_uid, json_build_object('sub', v_e2_uid, 'email', 'priya@sahiraah.com')::jsonb, 'email', now(), now(), now());
  EXCEPTION WHEN others THEN
    BEGIN
      INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
      VALUES (v_e2_uid::text, v_e2_uid, json_build_object('sub', v_e2_uid, 'email', 'priya@sahiraah.com')::jsonb, 'email', v_e2_uid::text, now(), now(), now());
    EXCEPTION WHEN others THEN NULL; END;
  END;

  INSERT INTO public.user_roles (user_id, role) VALUES (v_e2_uid, 'expert');
  INSERT INTO public.user_profiles (id, name, email, bio, location, preferred_language, profile_completion_percentage)
  VALUES (v_e2_uid, 'Priya Sharma', 'priya@sahiraah.com', 'Data Science Lead & AI Researcher with 10+ years experience in predictive modeling and ML.', 'Hyderabad, India', 'english', 100);

  INSERT INTO public.experts (id, user_id, name, email, title, bio, expertise, hourly_rate, is_available)
  VALUES (v_e2_id, v_e2_uid, 'Priya Sharma', 'priya@sahiraah.com', 'Data Science Lead', 'ML Expert with 10+ years experience. Passionate about helping students break into Data Science & AI.', '["Data Science", "Machine Learning", "Python", "Career Transition", "Deep Learning"]'::jsonb, 449.00, true);

  -- ==================================================================
  -- 3. AMIT PATEL (Product Manager & Business Strategy)
  -- Email: amit@sahiraah.com | Pass: Expert123!
  -- ==================================================================
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
  VALUES (v_e3_uid, '00000000-0000-0000-0000-000000000000', 'amit@sahiraah.com', crypt('Expert123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Amit Patel","full_name":"Amit Patel"}'::jsonb, now(), now(), 'authenticated', 'authenticated');

  BEGIN
    INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (v_e3_uid::text, v_e3_uid, json_build_object('sub', v_e3_uid, 'email', 'amit@sahiraah.com')::jsonb, 'email', now(), now(), now());
  EXCEPTION WHEN others THEN
    BEGIN
      INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
      VALUES (v_e3_uid::text, v_e3_uid, json_build_object('sub', v_e3_uid, 'email', 'amit@sahiraah.com')::jsonb, 'email', v_e3_uid::text, now(), now(), now());
    EXCEPTION WHEN others THEN NULL; END;
  END;

  INSERT INTO public.user_roles (user_id, role) VALUES (v_e3_uid, 'expert');
  INSERT INTO public.user_profiles (id, name, email, bio, location, preferred_language, profile_completion_percentage)
  VALUES (v_e3_uid, 'Amit Patel', 'amit@sahiraah.com', 'Principal Product Manager, Ex-Microsoft, MBA from IIM Ahmedabad.', 'Mumbai, India', 'english', 100);

  INSERT INTO public.experts (id, user_id, name, email, title, bio, expertise, hourly_rate, is_available)
  VALUES (v_e3_id, v_e3_uid, 'Amit Patel', 'amit@sahiraah.com', 'Product Manager', 'Ex-Microsoft PM, MBA from IIM. Guided 200+ candidates into top APM and Product roles.', '["Product Management", "Business Strategy", "Product Design", "Career Planning"]'::jsonb, 399.00, true);

  -- ==================================================================
  -- 4. SNEHA DESAI (HR Director & Interview Coach)
  -- Email: sneha@sahiraah.com | Pass: Expert123!
  -- ==================================================================
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
  VALUES (v_e4_uid, '00000000-0000-0000-0000-000000000000', 'sneha@sahiraah.com', crypt('Expert123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"name":"Sneha Desai","full_name":"Sneha Desai"}'::jsonb, now(), now(), 'authenticated', 'authenticated');

  BEGIN
    INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (v_e4_uid::text, v_e4_uid, json_build_object('sub', v_e4_uid, 'email', 'sneha@sahiraah.com')::jsonb, 'email', now(), now(), now());
  EXCEPTION WHEN others THEN
    BEGIN
      INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
      VALUES (v_e4_uid::text, v_e4_uid, json_build_object('sub', v_e4_uid, 'email', 'sneha@sahiraah.com')::jsonb, 'email', v_e4_uid::text, now(), now(), now());
    EXCEPTION WHEN others THEN NULL; END;
  END;

  INSERT INTO public.user_roles (user_id, role) VALUES (v_e4_uid, 'expert');
  INSERT INTO public.user_profiles (id, name, email, bio, location, preferred_language, profile_completion_percentage)
  VALUES (v_e4_uid, 'Sneha Desai', 'sneha@sahiraah.com', 'HR Director & Talent Acquisition Specialist with 12+ years experience in tech hiring.', 'Pune, India', 'english', 100);

  INSERT INTO public.experts (id, user_id, name, email, title, bio, expertise, hourly_rate, is_available)
  VALUES (v_e4_id, v_e4_uid, 'Sneha Desai', 'sneha@sahiraah.com', 'HR Director', 'Hiring expert across top tier startups and MNCs. Specializing in high-impact resumes and interview mastery.', '["Resume Review", "Interview Prep", "Salary Negotiation", "Career Development"]'::jsonb, 349.00, true);

  -- ==================================================================
  -- 5. WEEKLY AVAILABILITY (Monday to Friday, 10 AM to 6 PM)
  -- ==================================================================
  -- For each expert, add Mon(1), Tue(2), Wed(3), Thu(4), Fri(5)
  INSERT INTO public.expert_availability (expert_id, day_of_week, start_time, end_time, is_recurring, is_available)
  SELECT exp_id, d, '10:00:00'::time, '18:00:00'::time, true, true
  FROM unnest(ARRAY[v_e1_id, v_e2_id, v_e3_id, v_e4_id]) AS exp_id
  CROSS JOIN unnest(ARRAY[1, 2, 3, 4, 5]) AS d;

  -- ==================================================================
  -- 6. SAMPLE MEETINGS & SESSIONS FOR EACH EXPERT
  -- ==================================================================
  -- Priya Sharma Sessions
  INSERT INTO public.expert_sessions (expert_id, user_id, session_date, duration_minutes, session_status, amount_paid, meeting_link, notes)
  VALUES 
    (v_e2_id, v_student_id, now() - INTERVAL '4 days', 45, 'completed', 449.00, 'https://meet.jit.si/PriyaSharmaPast1', 'Reviewed ML project on sentiment analysis. Advised improving hyperparameter tuning.'),
    (v_e2_id, v_student_id, now() + INTERVAL '3 days', 60, 'scheduled', 449.00, 'https://meet.jit.si/PriyaSharmaUpcoming1', 'Deep dive into LLM fine-tuning techniques and career roadmap.');

  -- Amit Patel Sessions
  INSERT INTO public.expert_sessions (expert_id, user_id, session_date, duration_minutes, session_status, amount_paid, meeting_link, notes)
  VALUES 
    (v_e3_id, v_student_id, now() - INTERVAL '7 days', 60, 'completed', 399.00, 'https://meet.jit.si/AmitPatelPast1', 'Product sense interview practice. Discussed PRD frameworks.'),
    (v_e3_id, v_student_id, now() + INTERVAL '5 days', 45, 'scheduled', 399.00, 'https://meet.jit.si/AmitPatelUpcoming1', 'Resume critique for Associate Product Manager roles.');

  -- Sneha Desai Sessions
  INSERT INTO public.expert_sessions (expert_id, user_id, session_date, duration_minutes, session_status, amount_paid, meeting_link, notes)
  VALUES 
    (v_e4_id, v_student_id, now() - INTERVAL '2 days', 30, 'completed', 349.00, 'https://meet.jit.si/SnehaDesaiPast1', 'Behavioral interview practice and STAR method coaching.'),
    (v_e4_id, v_student_id, now() + INTERVAL '1 days', 45, 'scheduled', 349.00, 'https://meet.jit.si/SnehaDesaiUpcoming1', 'HR screening simulation and compensation expectations.');

  -- Dr. Rajesh Kumar Session (re-confirming)
  INSERT INTO public.expert_sessions (expert_id, user_id, session_date, duration_minutes, session_status, amount_paid, meeting_link, notes)
  VALUES 
    (v_e1_id, v_student_id, now() - INTERVAL '5 days', 45, 'completed', 499.00, 'https://meet.jit.si/RajeshKumarPast1', 'Initial software roadmap guidance and portfolio review.'),
    (v_e1_id, v_student_id, now() + INTERVAL '2 days', 60, 'scheduled', 499.00, 'https://meet.jit.si/RajeshKumarUpcoming1', 'System architecture review and mock coding interview.');

END
$$;