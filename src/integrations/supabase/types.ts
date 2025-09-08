export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      datingideen_ideas: {
        Row: {
          category: Database["public"]["Enums"]["datingideen_category"] | null
          created_at: string
          current_participants: number | null
          date_planned: string | null
          description: string
          duration: string | null
          general_location_info: string | null
          id: string
          is_public: boolean | null
          location: string
          max_participants: number | null
          time_planned: string | null
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["datingideen_category"] | null
          created_at?: string
          current_participants?: number | null
          date_planned?: string | null
          description: string
          duration?: string | null
          general_location_info?: string | null
          id?: string
          is_public?: boolean | null
          location: string
          max_participants?: number | null
          time_planned?: string | null
          title: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["datingideen_category"] | null
          created_at?: string
          current_participants?: number | null
          date_planned?: string | null
          description?: string | null
          duration?: string | null
          general_location_info?: string | null
          id?: string
          is_public?: boolean | null
          location?: string
          max_participants?: number | null
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
          description?: string | null
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
      date_ideen_events: {
        Row: {
          id: string
          organizer_user_id: string
          title: string
          description: string | null
          address: string | null
          place_lat: number | null
          place_lng: number | null
          radius_km: number
          start_at: string
          end_at: string
          max_participants: number
          gender_policy: Database["public"]["Enums"]["date_ideen_gender_policy"]
          age_min: number
          age_max: number
          interests_filter: string[] | null
          deposit_cents: number
          currency: string
          survey_sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organizer_user_id: string
          title: string
          description?: string | null
          address?: string | null
          place_lat?: number | null
          place_lng?: number | null
          radius_km?: number
          start_at: string
          end_at: string
          max_participants?: number
          gender_policy?: Database["public"]["Enums"]["date_ideen_gender_policy"]
          age_min?: number
          age_max?: number
          interests_filter?: string[] | null
          deposit_cents?: number
          currency?: string
          survey_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organizer_user_id?: string
          title?: string
          description?: string | null
          address?: string | null
          place_lat?: number | null
          place_lng?: number | null
          radius_km?: number
          start_at?: string
          end_at?: string
          max_participants?: number
          gender_policy?: Database["public"]["Enums"]["date_ideen_gender_policy"]
          age_min?: number
          age_max?: number
          interests_filter?: string[] | null
          deposit_cents?: number
          currency?: string
          survey_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      date_ideen_event_participants: {
        Row: {
          id: string
          event_id: string
          user_id: string
          status: Database["public"]["Enums"]["date_ideen_participant_status"]
          joined_at: string
          deposit_amount_cents: number | null
          payment_id: string | null
          deposit_status: Database["public"]["Enums"]["date_ideen_payment_status"] | null
          refund_status: Database["public"]["Enums"]["date_ideen_refund_status"]
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          status?: Database["public"]["Enums"]["date_ideen_participant_status"]
          joined_at?: string
          deposit_amount_cents?: number | null
          payment_id?: string | null
          deposit_status?: Database["public"]["Enums"]["date_ideen_payment_status"] | null
          refund_status?: Database["public"]["Enums"]["date_ideen_refund_status"]
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          status?: Database["public"]["Enums"]["date_ideen_participant_status"]
          joined_at?: string
          deposit_amount_cents?: number | null
          payment_id?: string | null
          deposit_status?: Database["public"]["Enums"]["date_ideen_payment_status"] | null
          refund_status?: Database["public"]["Enums"]["date_ideen_refund_status"]
        }
        Relationships: []
      }
      date_ideen_event_invitations: {
        Row: {
          id: string
          event_id: string
          inviter_id: string
          invitee_user_id: string
          token: string
          status: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          inviter_id: string
          invitee_user_id: string
          token: string
          status?: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          inviter_id?: string
          invitee_user_id?: string
          token?: string
          status?: string
          expires_at?: string
          created_at?: string
        }
        Relationships: []
      }
      date_ideen_payments: {
        Row: {
          id: string
          event_id: string
          user_id: string
          stripe_payment_intent_id: string
          amount_cents: number
          currency: string
          fee_cents: number | null
          status: Database["public"]["Enums"]["date_ideen_payment_status"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          stripe_payment_intent_id: string
          amount_cents: number
          currency: string
          fee_cents?: number | null
          status: Database["public"]["Enums"]["date_ideen_payment_status"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          stripe_payment_intent_id?: string
          amount_cents?: number
          currency?: string
          fee_cents?: number | null
          status?: Database["public"]["Enums"]["date_ideen_payment_status"]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      date_ideen_feedback: {
        Row: {
          id: string
          event_id: string
          reviewer_user_id: string
          rating: number
          would_meet_again: boolean | null
          not_good: boolean | null
          comments: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          reviewer_user_id: string
          rating: number
          would_meet_again?: boolean | null
          not_good?: boolean | null
          comments?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          reviewer_user_id?: string
          rating?: number
          would_meet_again?: boolean | null
          not_good?: boolean | null
          comments?: string | null
          created_at?: string
        }
        Relationships: []
      }
      date_ideen_notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string | null
          link: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          body?: string | null
          link?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          body?: string | null
          link?: string | null
          read_at?: string | null
          created_at?: string
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
      search_dates_by_radius: {
        Args: {
          center_lat: number
          center_lng: number
          end_date?: string
          gender_filter?: Database["public"]["Enums"]["datingideen_gender"]
          idea_category?: Database["public"]["Enums"]["datingideen_category"]
          max_age?: number
          min_age?: number
          radius_km: number
          start_date?: string
        }
        Returns: {
          category: Database["public"]["Enums"]["datingideen_category"]
          creator_age: number
          creator_city: string
          creator_gender: Database["public"]["Enums"]["datingideen_gender"]
          creator_name: string
          current_participants: number
          date_planned: string
          description: string
          distance_km: number
          duration: string
          id: string
          latitude: number
          location: string
          longitude: number
          max_participants: number
          time_planned: string
          title: string
        }[]
      }
      date_ideen_search_events_by_radius: {
        Args: {
          center_lat: number
          center_lng: number
          radius_km: number
          start_time?: string
          end_time?: string
          gender_policy_filter?: Database["public"]["Enums"]["date_ideen_gender_policy"]
          age_min?: number
          age_max?: number
        }
        Returns: {
          id: string
          title: string
          description: string
          address: string
          start_at: string
          end_at: string
          distance_km: number
          max_participants: number
          organizer_user_id: string
        }[]
      }
    }
    Enums: {
      datingideen_app_role: "user" | "admin"
      datingideen_category:
        | "romantic"
        | "adventure"
        | "cultural"
        | "outdoor"
        | "indoor"
        | "food_drinks"
        | "sports"
        | "creative"
        | "relaxation"
        | "entertainment"
      datingideen_gender: "male" | "female" | "other"
      datingideen_gender_search: "male" | "female" | "both"
      datingideen_relationship_status: "single" | "in_partnership"
      date_ideen_gender_policy: "mixed" | "female_only" | "male_only" | "balanced"
      date_ideen_participant_status: "invited" | "requested" | "confirmed" | "attended" | "no_show" | "cancelled"
      date_ideen_payment_status: "authorized" | "requires_action" | "succeeded" | "failed" | "canceled" | "refunded" | "partial_refund"
      date_ideen_refund_status: "pending" | "full_refund" | "partial_refund" | "no_refund"
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
      datingideen_category: [
        "romantic",
        "adventure",
        "cultural",
        "outdoor",
        "indoor",
        "food_drinks",
        "sports",
        "creative",
        "relaxation",
        "entertainment",
      ],
      datingideen_gender: ["male", "female", "other"],
      datingideen_gender_search: ["male", "female", "both"],
      datingideen_relationship_status: ["single", "in_partnership"],
      date_ideen_gender_policy: ["mixed", "female_only", "male_only", "balanced"],
      date_ideen_participant_status: ["invited", "requested", "confirmed", "attended", "no_show", "cancelled"],
      date_ideen_payment_status: ["authorized", "requires_action", "succeeded", "failed", "canceled", "refunded", "partial_refund"],
      date_ideen_refund_status: ["pending", "full_refund", "partial_refund", "no_refund"],
    },
  },
} as const