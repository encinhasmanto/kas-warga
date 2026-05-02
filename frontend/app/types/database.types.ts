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
      admins: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          metadata: Json | null
          pin: string
          role: string
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          metadata?: Json | null
          pin: string
          role: string
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          metadata?: Json | null
          pin?: string
          role?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string | null
          actor_type: string | null
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string | null
          actor_type?: string | null
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string | null
          actor_type?: string | null
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
        }
        Relationships: []
      }
      bulletins: {
        Row: {
          author_id: string | null
          category: string | null
          content: string
          content_url: string | null
          created_at: string | null
          id: string
          is_published: boolean | null
          title: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content: string
          content_url?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          title: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string
          content_url?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "bulletins_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_bulletins_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          created_at: string
          display_name: string | null
          id: number
          key: string
          metadata: Json | null
          periodicity: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: number
          key: string
          metadata?: Json | null
          periodicity?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: number
          key?: string
          metadata?: Json | null
          periodicity?: string
        }
        Relationships: []
      }
      payment_obligations: {
        Row: {
          amount: number | null
          event_id: number
          id: number
          installment_number: number | null
          month_index: number | null
          payload: Json | null
          status: boolean
          unit_code: string | null
          unit_id: string
          updated_at: string
          year: number | null
        }
        Insert: {
          amount?: number | null
          event_id: number
          id?: number
          installment_number?: number | null
          month_index?: number | null
          payload?: Json | null
          status?: boolean
          unit_code?: string | null
          unit_id: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          amount?: number | null
          event_id?: number
          id?: number
          installment_number?: number | null
          month_index?: number | null
          payload?: Json | null
          status?: boolean
          unit_code?: string | null
          unit_id?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_event_status_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "payment_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_event_status_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_tracker: {
        Row: {
          category: string | null
          id: number
          is_checked: boolean | null
          month_index: number | null
          name: string | null
          unit_code: string | null
          unit_id: string | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          category?: string | null
          id?: number
          is_checked?: boolean | null
          month_index?: number | null
          name?: string | null
          unit_code?: string | null
          unit_id?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          category?: string | null
          id?: number
          is_checked?: boolean | null
          month_index?: number | null
          name?: string | null
          unit_code?: string | null
          unit_id?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_tracker_unit_code_fkey"
            columns: ["unit_code"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "payment_tracker_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          event_id: number | null
          id: string
          installment_number: number | null
          metadata: Json | null
          recorded_by_admin: string | null
          reference: string | null
          transaction_category: string | null
          transaction_id: string | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          event_id?: number | null
          id?: string
          installment_number?: number | null
          metadata?: Json | null
          recorded_by_admin?: string | null
          reference?: string | null
          transaction_category?: string | null
          transaction_id?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          event_id?: number | null
          id?: string
          installment_number?: number | null
          metadata?: Json | null
          recorded_by_admin?: string | null
          reference?: string | null
          transaction_category?: string | null
          transaction_id?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_payment_transactions_admin"
            columns: ["recorded_by_admin"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_payment_transactions_event"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "payment_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_payment_transactions_transaction"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_payment_transactions_unit"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_categories: {
        Row: {
          category_type: string
          code: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          category_type?: string
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category_type?: string
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_expense_parent"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number | null
          category_id: string | null
          category_name: string | null
          description: string | null
          id: string
          metadata: Json | null
          months_paid: number | null
          reference_id: string | null
          reference_type: string | null
          transaction_date: string | null
          transaction_type: string | null
          type: string | null
          unit_id: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          category_id?: string | null
          category_name?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          months_paid?: number | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_date?: string | null
          transaction_type?: string | null
          type?: string | null
          unit_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          category_id?: string | null
          category_name?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          months_paid?: number | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_date?: string | null
          transaction_type?: string | null
          type?: string | null
          unit_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_transactions_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          avatar_url: string | null
          category: string
          code: string
          created_at: string | null
          id: string
          name: string
          no_sequence_unit: number
          pin: string | null
          unit_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          category: string
          code: string
          created_at?: string | null
          id?: string
          name: string
          no_sequence_unit?: number
          pin?: string | null
          unit_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          category?: string
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          no_sequence_unit?: number
          pin?: string | null
          unit_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_tracker: {
        Args: { p_year: number }
        Returns: {
          month_1: boolean
          month_10: boolean
          month_11: boolean
          month_12: boolean
          month_2: boolean
          month_3: boolean
          month_4: boolean
          month_5: boolean
          month_6: boolean
          month_7: boolean
          month_8: boolean
          month_9: boolean
          owner_name: string
          thr_status: boolean
          unit_code: string
          unit_id: string
        }[]
      }
      get_kas_balance: {
        Args: { p_unit_id?: string }
        Returns: {
          balance: number
        }[]
      }
      get_monthly_performance: {
        Args: { p_year: number }
        Returns: {
          month_index: number
          payment_count: number
          total_paid: number
          total_units: number
        }[]
      }
      get_resident_tracker: {
        Args: { p_unit_id: string; p_year: number }
        Returns: {
          month_1: boolean
          month_10: boolean
          month_11: boolean
          month_12: boolean
          month_2: boolean
          month_3: boolean
          month_4: boolean
          month_5: boolean
          month_6: boolean
          month_7: boolean
          month_8: boolean
          month_9: boolean
          owner_name: string
          thr_status: boolean
          unit_code: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      mark_iuran_paid: {
        Args: { p_months_to_mark: number; p_unit_code: string; p_year: number }
        Returns: undefined
      }
      seed_payment_tracker_for_year: {
        Args: { p_year: number }
        Returns: undefined
      }
      update_resident_pin: {
        Args: { p_new_pin: string; p_old_pin: string; p_resident_id: string }
        Returns: boolean
      }
      update_units_pin: {
        Args: { p_new_pin: string; p_old_pin: string; p_units_id: string }
        Returns: boolean
      }
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
