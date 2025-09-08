export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          id: string
          level: string
          order_index: number
          skills: string[]
          title: string
        }
        Insert: {
          career_path: string
          created_at?: string
          description: string
          duration: string
          id?: string
          level: string
          order_index?: number
          skills: string[]
          title: string
        }
        Update: {
          career_path?: string
          created_at?: string
          description?: string
          duration?: string
          id?: string
          level?: string
          order_index?: number
          skills?: string[]
          title?: string
        }
        Relationships: []
      }
      user_career_history: {
        Row: {
          career: string
          courses: Json | null
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
          user_id: string
          weaknesses: Json | null
        }
        Insert: {
          career: string
          courses?: Json | null
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
          user_id: string
          weaknesses?: Json | null
        }
        Update: {
          career?: string
          courses?: Json | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
