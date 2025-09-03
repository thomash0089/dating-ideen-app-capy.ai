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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      datingideen_ideas: {
        Row: {
          created_at: string
          date_planned: string | null
          description: string
          duration: string | null
          general_location_info: string | null
          id: string
          location: string
          time_planned: string | null
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date_planned?: string | null
          description: string
          duration?: string | null
          general_location_info?: string | null
          id?: string
          location: string
          time_planned?: string | null
          title: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date_planned?: string | null
          description?: string
          duration?: string | null
          general_location_info?: string | null
          id?: string
          location?: string
          time_planned?: string | null
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      datingideen_inspirations: {
        Row: {
          category: string | null
          created_at: string
          description: string
          difficulty_level: string | null
          duration: string | null
          estimated_cost: string | null
          general_location_info: string | null
          id: string
          is_active: boolean | null
          location: string
          season: string | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          difficulty_level?: string | null
          duration?: string | null
          estimated_cost?: string | null
          general_location_info?: string | null
          id?: string
          is_active?: boolean | null
          location: string
          season?: string | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          difficulty_level?: string | null
          duration?: string | null
          estimated_cost?: string | null
          general_location_info?: string | null
          id?: string
          is_active?: boolean | null
          location?: string
          season?: string | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      datingideen_profiles: {
        Row: {
          bio: string | null
          birth_date: string | null
          city: string | null
          created_at: string
          distance_radius: number | null
          email: string
          gender: Database["public"]["Enums"]["datingideen_gender"] | null
          gender_search:
            | Database["public"]["Enums"]["datingideen_gender_search"]
            | null
          id: string
          interests: string[] | null
          latitude: number | null
          longitude: number | null
          name: string | null
          partner_user_id: string | null
          postal_code: string | null
          profile_photo_url: string | null
          relationship_status:
            | Database["public"]["Enums"]["datingideen_relationship_status"]
            | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          distance_radius?: number | null
          email: string
          gender?: Database["public"]["Enums"]["datingideen_gender"] | null
          gender_search?:
            | Database["public"]["Enums"]["datingideen_gender_search"]
            | null
          id?: string
          interests?: string[] | null
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          partner_user_id?: string | null
          postal_code?: string | null
          profile_photo_url?: string | null
          relationship_status?:
            | Database["public"]["Enums"]["datingideen_relationship_status"]
            | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          distance_radius?: number | null
          email?: string
          gender?: Database["public"]["Enums"]["datingideen_gender"] | null
          gender_search?:
            | Database["public"]["Enums"]["datingideen_gender_search"]
            | null
          id?: string
          interests?: string[] | null
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          partner_user_id?: string | null
          postal_code?: string | null
          profile_photo_url?: string | null
          relationship_status?:
            | Database["public"]["Enums"]["datingideen_relationship_status"]
            | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "datingideen_profiles_partner_user_id_fkey"
            columns: ["partner_user_id"]
            isOneToOne: false
            referencedRelation: "datingideen_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      datingideen_user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["datingideen_app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["datingideen_app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["datingideen_app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lat2: number; lng1: number; lng2: number }
        Returns: number
      }
      datingideen_has_role: {
        Args: {
          _role: Database["public"]["Enums"]["datingideen_app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      datingideen_app_role: "user" | "admin"
      datingideen_gender: "male" | "female" | "other"
      datingideen_gender_search: "male" | "female" | "both"
      datingideen_relationship_status: "single" | "in_partnership"
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
      datingideen_app_role: ["user", "admin"],
      datingideen_gender: ["male", "female", "other"],
      datingideen_gender_search: ["male", "female", "both"],
      datingideen_relationship_status: ["single", "in_partnership"],
    },
  },
} as const
