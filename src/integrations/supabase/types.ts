export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      career_success_stories: {
        Row: {
          achievements: Json | null
          advice_for_students: string | null
          background_story: string
          career_field: string
          challenges_faced: Json | null
          created_at: string
          current_position: string
          financial_investment: string | null
          id: string
          inspiration_rating: number | null
          is_featured: boolean | null
          key_learnings: Json | null
          pathway_taken: string
          resources_used: Json | null
          starting_point: string
          student_name: string
          timeline: string
          updated_at: string
        }
        Insert: {
          achievements?: Json | null
          advice_for_students?: string | null
          background_story: string
          career_field: string
          challenges_faced?: Json | null
          created_at?: string
          current_position: string
          financial_investment?: string | null
          id?: string
          inspiration_rating?: number | null
          is_featured?: boolean | null
          key_learnings?: Json | null
          pathway_taken: string
          resources_used?: Json | null
          starting_point: string
          student_name: string
          timeline: string
          updated_at?: string
        }
        Update: {
          achievements?: Json | null
          advice_for_students?: string | null
          background_story?: string
          career_field?: string
          challenges_faced?: Json | null
          created_at?: string
          current_position?: string
          financial_investment?: string | null
          id?: string
          inspiration_rating?: number | null
          is_featured?: boolean | null
          key_learnings?: Json | null
          pathway_taken?: string
          resources_used?: Json | null
          starting_point?: string
          student_name?: string
          timeline?: string
          updated_at?: string
        }
        Relationships: []
      }
      certification_providers: {
        Row: {
          contact_info: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          name: string
          recognition_level: string | null
          type: string | null
          website_url: string | null
        }
        Insert: {
          contact_info?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          name: string
          recognition_level?: string | null
          type?: string | null
          website_url?: string | null
        }
        Update: {
          contact_info?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          name?: string
          recognition_level?: string | null
          type?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_exports: {
        Row: {
          conversation_id: string
          exported_at: string
          file_path: string | null
          id: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          exported_at?: string
          file_path?: string | null
          id?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          exported_at?: string
          file_path?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_exports_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          id: string
          metadata: Json | null
          role: string
          timestamp: string
        }
        Insert: {
          content: string
          conversation_id: string
          id?: string
          metadata?: Json | null
          role: string
          timestamp?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          id?: string
          metadata?: Json | null
          role?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      colleges: {
        Row: {
          accreditation: Json | null
          admission_requirements: Json | null
          affiliation: string | null
          college_type: string
          contact_info: Json | null
          courses_offered: Json | null
          created_at: string
          entrance_exams: Json | null
          establishment_year: number | null
          facilities: Json | null
          fee_structure: Json | null
          id: string
          is_active: boolean | null
          location: string
          name: string
          placement_statistics: Json | null
          ranking_nirf: number | null
          ranking_overall: number | null
          state: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          accreditation?: Json | null
          admission_requirements?: Json | null
          affiliation?: string | null
          college_type: string
          contact_info?: Json | null
          courses_offered?: Json | null
          created_at?: string
          entrance_exams?: Json | null
          establishment_year?: number | null
          facilities?: Json | null
          fee_structure?: Json | null
          id?: string
          is_active?: boolean | null
          location: string
          name: string
          placement_statistics?: Json | null
          ranking_nirf?: number | null
          ranking_overall?: number | null
          state: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          accreditation?: Json | null
          admission_requirements?: Json | null
          affiliation?: string | null
          college_type?: string
          contact_info?: Json | null
          courses_offered?: Json | null
          created_at?: string
          entrance_exams?: Json | null
          establishment_year?: number | null
          facilities?: Json | null
          fee_structure?: Json | null
          id?: string
          is_active?: boolean | null
          location?: string
          name?: string
          placement_statistics?: Json | null
          ranking_nirf?: number | null
          ranking_overall?: number | null
          state?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      comprehensive_skill_assessments: {
        Row: {
          assessment_type: string
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean | null
          overall_score: number | null
          proficiency_level: string | null
          questions: Json
          responses: Json
          score_breakdown: Json | null
          skill_category_id: string | null
          time_taken_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_type: string
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          overall_score?: number | null
          proficiency_level?: string | null
          questions?: Json
          responses?: Json
          score_breakdown?: Json | null
          skill_category_id?: string | null
          time_taken_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_type?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          overall_score?: number | null
          proficiency_level?: string | null
          questions?: Json
          responses?: Json
          score_breakdown?: Json | null
          skill_category_id?: string | null
          time_taken_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          career_path: string
          certification_type: string | null
          created_at: string
          description: string
          duration: string
          estimated_salary_range: string | null
          has_certificate: boolean | null
          id: string
          industry_recognition: string | null
          is_partner: boolean | null
          is_trending: boolean | null
          job_guarantee: boolean | null
          language_options: Json | null
          learning_format: string | null
          level: string
          order_index: number
          placement_assistance: boolean | null
          platform_rating: number | null
          prerequisites: Json | null
          price: number | null
          price_range: string | null
          price_type: string | null
          provider: string | null
          rating: number | null
          review_count: number | null
          skills: string[]
          success_stories_count: number | null
          target_audience: string | null
          title: string
          url: string | null
        }
        Insert: {
          career_path: string
          certification_type?: string | null
          created_at?: string
          description: string
          duration: string
          estimated_salary_range?: string | null
          has_certificate?: boolean | null
          id?: string
          industry_recognition?: string | null
          is_partner?: boolean | null
          is_trending?: boolean | null
          job_guarantee?: boolean | null
          language_options?: Json | null
          learning_format?: string | null
          level: string
          order_index?: number
          placement_assistance?: boolean | null
          platform_rating?: number | null
          prerequisites?: Json | null
          price?: number | null
          price_range?: string | null
          price_type?: string | null
          provider?: string | null
          rating?: number | null
          review_count?: number | null
          skills: string[]
          success_stories_count?: number | null
          target_audience?: string | null
          title: string
          url?: string | null
        }
        Update: {
          career_path?: string
          certification_type?: string | null
          created_at?: string
          description?: string
          duration?: string
          estimated_salary_range?: string | null
          has_certificate?: boolean | null
          id?: string
          industry_recognition?: string | null
          is_partner?: boolean | null
          is_trending?: boolean | null
          job_guarantee?: boolean | null
          language_options?: Json | null
          learning_format?: string | null
          level?: string
          order_index?: number
          placement_assistance?: boolean | null
          platform_rating?: number | null
          prerequisites?: Json | null
          price?: number | null
          price_range?: string | null
          price_type?: string | null
          provider?: string | null
          rating?: number | null
          review_count?: number | null
          skills?: string[]
          success_stories_count?: number | null
          target_audience?: string | null
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      educational_pathways: {
        Row: {
          alternative_routes: Json | null
          career_prospects: Json | null
          created_at: string
          current_stage: string
          difficulty_level: string | null
          duration: string
          id: string
          is_recommended: boolean | null
          milestones: Json | null
          pathway_description: string | null
          pathway_title: string
          prerequisites: Json | null
          priority_order: number | null
          roi_analysis: Json | null
          steps: Json
          success_probability: number | null
          target_career: string
          total_investment_range: string | null
          updated_at: string
        }
        Insert: {
          alternative_routes?: Json | null
          career_prospects?: Json | null
          created_at?: string
          current_stage: string
          difficulty_level?: string | null
          duration: string
          id?: string
          is_recommended?: boolean | null
          milestones?: Json | null
          pathway_description?: string | null
          pathway_title: string
          prerequisites?: Json | null
          priority_order?: number | null
          roi_analysis?: Json | null
          steps?: Json
          success_probability?: number | null
          target_career: string
          total_investment_range?: string | null
          updated_at?: string
        }
        Update: {
          alternative_routes?: Json | null
          career_prospects?: Json | null
          created_at?: string
          current_stage?: string
          difficulty_level?: string | null
          duration?: string
          id?: string
          is_recommended?: boolean | null
          milestones?: Json | null
          pathway_description?: string | null
          pathway_title?: string
          prerequisites?: Json | null
          priority_order?: number | null
          roi_analysis?: Json | null
          steps?: Json
          success_probability?: number | null
          target_career?: string
          total_investment_range?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      entrance_exams: {
        Row: {
          application_process: Json | null
          average_attempts: number | null
          coaching_centers: Json | null
          conducting_body: string
          created_at: string
          difficulty_level: string | null
          eligibility_criteria: Json | null
          exam_dates: Json | null
          exam_name: string
          exam_pattern: Json | null
          exam_type: string
          id: string
          is_active: boolean | null
          preparation_resources: Json | null
          preparation_timeline: string | null
          success_rate: number | null
          syllabus: Json | null
          updated_at: string
        }
        Insert: {
          application_process?: Json | null
          average_attempts?: number | null
          coaching_centers?: Json | null
          conducting_body: string
          created_at?: string
          difficulty_level?: string | null
          eligibility_criteria?: Json | null
          exam_dates?: Json | null
          exam_name: string
          exam_pattern?: Json | null
          exam_type: string
          id?: string
          is_active?: boolean | null
          preparation_resources?: Json | null
          preparation_timeline?: string | null
          success_rate?: number | null
          syllabus?: Json | null
          updated_at?: string
        }
        Update: {
          application_process?: Json | null
          average_attempts?: number | null
          coaching_centers?: Json | null
          conducting_body?: string
          created_at?: string
          difficulty_level?: string | null
          eligibility_criteria?: Json | null
          exam_dates?: Json | null
          exam_name?: string
          exam_pattern?: Json | null
          exam_type?: string
          id?: string
          is_active?: boolean | null
          preparation_resources?: Json | null
          preparation_timeline?: string | null
          success_rate?: number | null
          syllabus?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      expert_availability: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          expert_id: string
          id: string
          is_available: boolean | null
          is_recurring: boolean | null
          specific_date: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          expert_id: string
          id?: string
          is_available?: boolean | null
          is_recurring?: boolean | null
          specific_date?: string | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          expert_id?: string
          id?: string
          is_available?: boolean | null
          is_recurring?: boolean | null
          specific_date?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_availability_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_availability_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts_public"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_sessions: {
        Row: {
          amount_paid: number | null
          created_at: string | null
          duration_minutes: number | null
          expert_id: string
          id: string
          meeting_link: string | null
          notes: string | null
          payment_status: string | null
          session_date: string
          session_status: string | null
          stripe_session_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string | null
          duration_minutes?: number | null
          expert_id: string
          id?: string
          meeting_link?: string | null
          notes?: string | null
          payment_status?: string | null
          session_date: string
          session_status?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          created_at?: string | null
          duration_minutes?: number | null
          expert_id?: string
          id?: string
          meeting_link?: string | null
          notes?: string | null
          payment_status?: string | null
          session_date?: string
          session_status?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_sessions_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_sessions_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts_public"
            referencedColumns: ["id"]
          },
        ]
      }
      experts: {
        Row: {
          bio: string | null
          created_at: string | null
          email: string | null
          expertise: Json | null
          hourly_rate: number | null
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
          title: string
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          expertise?: Json | null
          hourly_rate?: number | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
          title: string
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          expertise?: Json | null
          hourly_rate?: number | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applied_at: string
          created_at: string
          follow_up_date: string | null
          id: string
          job_id: string
          notes: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string
          created_at?: string
          follow_up_date?: string | null
          id?: string
          job_id: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string
          created_at?: string
          follow_up_date?: string | null
          id?: string
          job_id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          application_deadline: string | null
          company_logo_url: string | null
          company_name: string
          created_at: string
          description: string
          duration: string | null
          experience_level: string | null
          external_url: string | null
          id: string
          is_active: boolean | null
          is_exclusive: boolean | null
          is_high_opportunity: boolean | null
          is_onsite: boolean | null
          is_remote: boolean | null
          is_urgent: boolean | null
          job_type: string
          location: string | null
          posted_at: string
          required_skills: string[] | null
          salary_range: string | null
          title: string
          updated_at: string
        }
        Insert: {
          application_deadline?: string | null
          company_logo_url?: string | null
          company_name: string
          created_at?: string
          description: string
          duration?: string | null
          experience_level?: string | null
          external_url?: string | null
          id?: string
          is_active?: boolean | null
          is_exclusive?: boolean | null
          is_high_opportunity?: boolean | null
          is_onsite?: boolean | null
          is_remote?: boolean | null
          is_urgent?: boolean | null
          job_type: string
          location?: string | null
          posted_at?: string
          required_skills?: string[] | null
          salary_range?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          application_deadline?: string | null
          company_logo_url?: string | null
          company_name?: string
          created_at?: string
          description?: string
          duration?: string | null
          experience_level?: string | null
          external_url?: string | null
          id?: string
          is_active?: boolean | null
          is_exclusive?: boolean | null
          is_high_opportunity?: boolean | null
          is_onsite?: boolean | null
          is_remote?: boolean | null
          is_urgent?: boolean | null
          job_type?: string
          location?: string | null
          posted_at?: string
          required_skills?: string[] | null
          salary_range?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_preferences: {
        Row: {
          accessibility_needs: Json | null
          created_at: string
          device_preferences: Json | null
          difficulty_progression: string | null
          id: string
          language_preferences: Json | null
          offline_learning_required: boolean | null
          preferred_duration_per_session: number | null
          preferred_learning_style: Json | null
          study_time_slots: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accessibility_needs?: Json | null
          created_at?: string
          device_preferences?: Json | null
          difficulty_progression?: string | null
          id?: string
          language_preferences?: Json | null
          offline_learning_required?: boolean | null
          preferred_duration_per_session?: number | null
          preferred_learning_style?: Json | null
          study_time_slots?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accessibility_needs?: Json | null
          created_at?: string
          device_preferences?: Json | null
          difficulty_progression?: string | null
          id?: string
          language_preferences?: Json | null
          offline_learning_required?: boolean | null
          preferred_duration_per_session?: number | null
          preferred_learning_style?: Json | null
          study_time_slots?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nsqf_qualifications: {
        Row: {
          created_at: string
          credit_points: number | null
          description: string | null
          duration_hours: number | null
          entry_requirements: string | null
          id: string
          is_active: boolean | null
          job_roles: Json | null
          level: number
          sector: string
          sub_sector: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credit_points?: number | null
          description?: string | null
          duration_hours?: number | null
          entry_requirements?: string | null
          id?: string
          is_active?: boolean | null
          job_roles?: Json | null
          level: number
          sector: string
          sub_sector?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credit_points?: number | null
          description?: string | null
          duration_hours?: number | null
          entry_requirements?: string | null
          id?: string
          is_active?: boolean | null
          job_roles?: Json | null
          level?: number
          sector?: string
          sub_sector?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      scholarship_opportunities: {
        Row: {
          application_process: Json | null
          benefits: Json | null
          created_at: string
          education_level: string
          eligibility_criteria: Json | null
          field_of_study: Json | null
          id: string
          important_dates: Json | null
          is_active: boolean | null
          official_website: string | null
          provider: string
          renewal_criteria: string | null
          required_documents: Json | null
          scholarship_name: string
          scholarship_type: string
          selection_process: string | null
          target_group: string
          updated_at: string
        }
        Insert: {
          application_process?: Json | null
          benefits?: Json | null
          created_at?: string
          education_level: string
          eligibility_criteria?: Json | null
          field_of_study?: Json | null
          id?: string
          important_dates?: Json | null
          is_active?: boolean | null
          official_website?: string | null
          provider: string
          renewal_criteria?: string | null
          required_documents?: Json | null
          scholarship_name: string
          scholarship_type: string
          selection_process?: string | null
          target_group: string
          updated_at?: string
        }
        Update: {
          application_process?: Json | null
          benefits?: Json | null
          created_at?: string
          education_level?: string
          eligibility_criteria?: Json | null
          field_of_study?: Json | null
          id?: string
          important_dates?: Json | null
          is_active?: boolean | null
          official_website?: string | null
          provider?: string
          renewal_criteria?: string | null
          required_documents?: Json | null
          scholarship_name?: string
          scholarship_type?: string
          selection_process?: string | null
          target_group?: string
          updated_at?: string
        }
        Relationships: []
      }
      skill_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          nsqf_level_max: number | null
          nsqf_level_min: number | null
          parent_category_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          nsqf_level_max?: number | null
          nsqf_level_min?: number | null
          parent_category_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          nsqf_level_max?: number | null
          nsqf_level_min?: number | null
          parent_category_id?: string | null
        }
        Relationships: []
      }
      skill_questions: {
        Row: {
          correct_answer: string | null
          created_at: string
          explanation: string | null
          id: string
          options: Json | null
          order_index: number
          points: number | null
          question_text: string
          question_type: string
          quiz_id: string
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json | null
          order_index?: number
          points?: number | null
          question_text: string
          question_type?: string
          quiz_id: string
        }
        Update: {
          correct_answer?: string | null
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json | null
          order_index?: number
          points?: number | null
          question_text?: string
          question_type?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "skill_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_quiz_attempts: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean | null
          max_possible_score: number | null
          percentage_score: number | null
          quiz_id: string
          started_at: string
          time_taken_minutes: number | null
          total_score: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          max_possible_score?: number | null
          percentage_score?: number | null
          quiz_id: string
          started_at?: string
          time_taken_minutes?: number | null
          total_score?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          max_possible_score?: number | null
          percentage_score?: number | null
          quiz_id?: string
          started_at?: string
          time_taken_minutes?: number | null
          total_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "skill_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_quiz_responses: {
        Row: {
          attempt_id: string
          created_at: string
          id: string
          is_correct: boolean | null
          points_earned: number | null
          question_id: string
          time_taken_seconds: number | null
          user_answer: string
        }
        Insert: {
          attempt_id: string
          created_at?: string
          id?: string
          is_correct?: boolean | null
          points_earned?: number | null
          question_id: string
          time_taken_seconds?: number | null
          user_answer: string
        }
        Update: {
          attempt_id?: string
          created_at?: string
          id?: string
          is_correct?: boolean | null
          points_earned?: number | null
          question_id?: string
          time_taken_seconds?: number | null
          user_answer?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_quiz_responses_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "skill_quiz_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_quiz_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "skill_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_quizzes: {
        Row: {
          category: string
          created_at: string
          description: string | null
          difficulty_level: string
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          title: string
          total_questions: number | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          difficulty_level?: string
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          title: string
          total_questions?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          title?: string
          total_questions?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_career_history: {
        Row: {
          career: string
          courses: Json | null
          created_at: string | null
          id: string
          improvement_areas: Json | null
          is_selected: boolean | null
          links_clicked: boolean | null
          reason: string | null
          report_data: Json | null
          roadmap_summary: string | null
          session_id: string | null
          strengths: Json | null
          tags: string[] | null
          timestamp: string
          updated_at: string | null
          user_id: string
          weaknesses: Json | null
        }
        Insert: {
          career: string
          courses?: Json | null
          created_at?: string | null
          id?: string
          improvement_areas?: Json | null
          is_selected?: boolean | null
          links_clicked?: boolean | null
          reason?: string | null
          report_data?: Json | null
          roadmap_summary?: string | null
          session_id?: string | null
          strengths?: Json | null
          tags?: string[] | null
          timestamp?: string
          updated_at?: string | null
          user_id: string
          weaknesses?: Json | null
        }
        Update: {
          career?: string
          courses?: Json | null
          created_at?: string | null
          id?: string
          improvement_areas?: Json | null
          is_selected?: boolean | null
          links_clicked?: boolean | null
          reason?: string | null
          report_data?: Json | null
          roadmap_summary?: string | null
          session_id?: string | null
          strengths?: Json | null
          tags?: string[] | null
          timestamp?: string
          updated_at?: string | null
          user_id?: string
          weaknesses?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "user_career_history_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_certifications: {
        Row: {
          certificate_number: string | null
          certification_name: string
          created_at: string
          document_url: string | null
          expiry_date: string | null
          id: string
          is_verified: boolean | null
          issue_date: string | null
          nsqf_level: number | null
          provider_id: string | null
          skill_areas: Json | null
          updated_at: string
          user_id: string
          verification_url: string | null
        }
        Insert: {
          certificate_number?: string | null
          certification_name: string
          created_at?: string
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          is_verified?: boolean | null
          issue_date?: string | null
          nsqf_level?: number | null
          provider_id?: string | null
          skill_areas?: Json | null
          updated_at?: string
          user_id: string
          verification_url?: string | null
        }
        Update: {
          certificate_number?: string | null
          certification_name?: string
          created_at?: string
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          is_verified?: boolean | null
          issue_date?: string | null
          nsqf_level?: number | null
          provider_id?: string | null
          skill_areas?: Json | null
          updated_at?: string
          user_id?: string
          verification_url?: string | null
        }
        Relationships: []
      }
      user_course_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_paths: {
        Row: {
          career_path: string
          course_id: string
          id: string
          is_active: boolean
          recommended_at: string
          user_id: string
        }
        Insert: {
          career_path: string
          course_id: string
          id?: string
          is_active?: boolean
          recommended_at?: string
          user_id: string
        }
        Update: {
          career_path?: string
          course_id?: string
          id?: string
          is_active?: boolean
          recommended_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_paths_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          app_notifications: boolean | null
          created_at: string
          data_sharing: boolean
          email_notifications: boolean | null
          id: string
          language_preference: string
          learning_style: string
          profile_visibility: string
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          app_notifications?: boolean | null
          created_at?: string
          data_sharing?: boolean
          email_notifications?: boolean | null
          id?: string
          language_preference?: string
          learning_style?: string
          profile_visibility?: string
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          app_notifications?: boolean | null
          created_at?: string
          data_sharing?: boolean
          email_notifications?: boolean | null
          id?: string
          language_preference?: string
          learning_style?: string
          profile_visibility?: string
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          bio: string | null
          career_aspirations: Json | null
          created_at: string
          current_qualification: string | null
          disability_status: string | null
          email: string | null
          family_income_range: string | null
          financial_constraints: Json | null
          id: string
          learning_pace_preference: string | null
          location: string | null
          location_type: string | null
          name: string | null
          parent_education_level: string | null
          preferred_language: string | null
          prior_education_level: string | null
          profile_completion_percentage: number | null
          region: string | null
          skills_interests: Json | null
          state: string | null
          time_availability: string | null
          work_experience: Json | null
        }
        Insert: {
          bio?: string | null
          career_aspirations?: Json | null
          created_at?: string
          current_qualification?: string | null
          disability_status?: string | null
          email?: string | null
          family_income_range?: string | null
          financial_constraints?: Json | null
          id: string
          learning_pace_preference?: string | null
          location?: string | null
          location_type?: string | null
          name?: string | null
          parent_education_level?: string | null
          preferred_language?: string | null
          prior_education_level?: string | null
          profile_completion_percentage?: number | null
          region?: string | null
          skills_interests?: Json | null
          state?: string | null
          time_availability?: string | null
          work_experience?: Json | null
        }
        Update: {
          bio?: string | null
          career_aspirations?: Json | null
          created_at?: string
          current_qualification?: string | null
          disability_status?: string | null
          email?: string | null
          family_income_range?: string | null
          financial_constraints?: Json | null
          id?: string
          learning_pace_preference?: string | null
          location?: string | null
          location_type?: string | null
          name?: string | null
          parent_education_level?: string | null
          preferred_language?: string | null
          prior_education_level?: string | null
          profile_completion_percentage?: number | null
          region?: string | null
          skills_interests?: Json | null
          state?: string | null
          time_availability?: string | null
          work_experience?: Json | null
        }
        Relationships: []
      }
      user_quiz_answers: {
        Row: {
          ai_context: Json | null
          answer_text: string
          created_at: string
          id: string
          question_category: string
          question_number: number
          question_text: string
          session_id: string
          user_id: string
        }
        Insert: {
          ai_context?: Json | null
          answer_text: string
          created_at?: string
          id?: string
          question_category: string
          question_number: number
          question_text: string
          session_id: string
          user_id: string
        }
        Update: {
          ai_context?: Json | null
          answer_text?: string
          created_at?: string
          id?: string
          question_category?: string
          question_number?: number
          question_text?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quiz_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_quiz_responses: {
        Row: {
          answer: string
          created_at: string
          id: string
          question: string
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          question: string
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          question?: string
          user_id?: string
        }
        Relationships: []
      }
      user_quiz_sessions: {
        Row: {
          career_recommendations: Json | null
          created_at: string
          current_question_index: number | null
          education_level: string | null
          id: string
          is_completed: boolean | null
          session_completed_at: string | null
          session_started_at: string
          strengths: Json | null
          student_name: string | null
          total_questions: number | null
          updated_at: string
          user_id: string
          weaknesses: Json | null
        }
        Insert: {
          career_recommendations?: Json | null
          created_at?: string
          current_question_index?: number | null
          education_level?: string | null
          id?: string
          is_completed?: boolean | null
          session_completed_at?: string | null
          session_started_at?: string
          strengths?: Json | null
          student_name?: string | null
          total_questions?: number | null
          updated_at?: string
          user_id: string
          weaknesses?: Json | null
        }
        Update: {
          career_recommendations?: Json | null
          created_at?: string
          current_question_index?: number | null
          education_level?: string | null
          id?: string
          is_completed?: boolean | null
          session_completed_at?: string | null
          session_started_at?: string
          strengths?: Json | null
          student_name?: string | null
          total_questions?: number | null
          updated_at?: string
          user_id?: string
          weaknesses?: Json | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      experts_public: {
        Row: {
          bio: string | null
          created_at: string | null
          expertise: Json | null
          hourly_rate: number | null
          id: string | null
          image_url: string | null
          is_available: boolean | null
          name: string | null
          title: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          expertise?: Json | null
          hourly_rate?: number | null
          id?: string | null
          image_url?: string | null
          is_available?: boolean | null
          name?: string | null
          title?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          expertise?: Json | null
          hourly_rate?: number | null
          id?: string | null
          image_url?: string | null
          is_available?: boolean | null
          name?: string | null
          title?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "expert"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "expert"],
    },
  },
} as const
