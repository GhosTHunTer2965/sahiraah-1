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
          created_at: string
          description: string
          duration: string
          has_certificate: boolean | null
          id: string
          is_partner: boolean | null
          is_trending: boolean | null
          level: string
          order_index: number
          price: number | null
          price_type: string | null
          provider: string | null
          rating: number | null
          review_count: number | null
          skills: string[]
          title: string
          url: string | null
        }
        Insert: {
          career_path: string
          created_at?: string
          description: string
          duration: string
          has_certificate?: boolean | null
          id?: string
          is_partner?: boolean | null
          is_trending?: boolean | null
          level: string
          order_index?: number
          price?: number | null
          price_type?: string | null
          provider?: string | null
          rating?: number | null
          review_count?: number | null
          skills: string[]
          title: string
          url?: string | null
        }
        Update: {
          career_path?: string
          created_at?: string
          description?: string
          duration?: string
          has_certificate?: boolean | null
          id?: string
          is_partner?: boolean | null
          is_trending?: boolean | null
          level?: string
          order_index?: number
          price?: number | null
          price_type?: string | null
          provider?: string | null
          rating?: number | null
          review_count?: number | null
          skills?: string[]
          title?: string
          url?: string | null
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
          email_notifications: boolean | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          app_notifications?: boolean | null
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          app_notifications?: boolean | null
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          bio: string | null
          created_at: string
          email: string | null
          id: string
          location: string | null
          name: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          id: string
          location?: string | null
          name?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          name?: string | null
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
      [_ in never]: never
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
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
