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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      daily_checkins: {
        Row: {
          checkin_date: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          checkin_date: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          checkin_date?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string
          id: string
          language_code: string | null
          lesson_id: number
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string
          id?: string
          language_code?: string | null
          lesson_id: number
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string
          id?: string
          language_code?: string | null
          lesson_id?: number
          user_id?: string
        }
        Relationships: []
      }
      lesson_sessions: {
        Row: {
          completed: boolean | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          lesson_goal: string | null
          lesson_type: string
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          lesson_goal?: string | null
          lesson_type: string
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          lesson_goal?: string | null
          lesson_type?: string
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          current_cycle_start: string | null
          email: string | null
          id: string
          last_practice_date: string | null
          levels_completed_in_cycle: number | null
          selected_language: string | null
          selected_level: number | null
          streak_days: number | null
          streak_start_date: string | null
          total_minutes_practiced: number | null
          updated_at: string | null
          vibe_coins: number | null
          wallet_address: string | null
          xp: number | null
        }
        Insert: {
          created_at?: string | null
          current_cycle_start?: string | null
          email?: string | null
          id: string
          last_practice_date?: string | null
          levels_completed_in_cycle?: number | null
          selected_language?: string | null
          selected_level?: number | null
          streak_days?: number | null
          streak_start_date?: string | null
          total_minutes_practiced?: number | null
          updated_at?: string | null
          vibe_coins?: number | null
          wallet_address?: string | null
          xp?: number | null
        }
        Update: {
          created_at?: string | null
          current_cycle_start?: string | null
          email?: string | null
          id?: string
          last_practice_date?: string | null
          levels_completed_in_cycle?: number | null
          selected_language?: string | null
          selected_level?: number | null
          streak_days?: number | null
          streak_start_date?: string | null
          total_minutes_practiced?: number | null
          updated_at?: string | null
          vibe_coins?: number | null
          wallet_address?: string | null
          xp?: number | null
        }
        Relationships: []
      }
      vibe_rewards: {
        Row: {
          amount_vibe: number
          created_at: string | null
          cycle_end_date: string
          cycle_number: number
          cycle_start_date: string
          id: string
          levels_completed: number
          paid_at: string | null
          status: string
          tx_hash: string | null
          user_id: string
        }
        Insert: {
          amount_vibe?: number
          created_at?: string | null
          cycle_end_date: string
          cycle_number: number
          cycle_start_date: string
          id?: string
          levels_completed?: number
          paid_at?: string | null
          status?: string
          tx_hash?: string | null
          user_id: string
        }
        Update: {
          amount_vibe?: number
          created_at?: string | null
          cycle_end_date?: string
          cycle_number?: number
          cycle_start_date?: string
          id?: string
          levels_completed?: number
          paid_at?: string | null
          status?: string
          tx_hash?: string | null
          user_id?: string
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
    Enums: {},
  },
} as const
