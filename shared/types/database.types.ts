export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      completions: {
        Row: {
          bitmap: string;
          habit_id: string;
          month_counts: string;
          updated_at: string;
          week_counts: string;
          year: number;
        };
        Insert: {
          bitmap: string;
          habit_id: string;
          month_counts?: string;
          updated_at?: string;
          week_counts?: string;
          year: number;
        };
        Update: {
          bitmap?: string;
          habit_id?: string;
          month_counts?: string;
          updated_at?: string;
          week_counts?: string;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: "completions_habit_id_fkey1";
            columns: ["habit_id"];
            isOneToOne: false;
            referencedRelation: "habits";
            referencedColumns: ["id"];
          },
        ];
      };
      habit_goal_versions: {
        Row: {
          created_at: string;
          effective_from: string;
          effective_to: string | null;
          habit_id: string;
          id: string;
          period_type: string;
          target_count: number;
        };
        Insert: {
          created_at?: string;
          effective_from: string;
          effective_to?: string | null;
          habit_id: string;
          id?: string;
          period_type: string;
          target_count: number;
        };
        Update: {
          created_at?: string;
          effective_from?: string;
          effective_to?: string | null;
          habit_id?: string;
          id?: string;
          period_type?: string;
          target_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "habit_goal_versions_habit_id_fkey";
            columns: ["habit_id"];
            isOneToOne: false;
            referencedRelation: "habits";
            referencedColumns: ["id"];
          },
        ];
      };
      habits: {
        Row: {
          color: string;
          created_at: string | null;
          description: string | null;
          icon: string;
          id: string;
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          color: string;
          created_at?: string | null;
          description?: string | null;
          icon: string;
          id?: string;
          title: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Update: {
          color?: string;
          created_at?: string | null;
          description?: string | null;
          icon?: string;
          id?: string;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      profile_settings: {
        Row: {
          color_mode: Database["public"]["Enums"]["color_mode_preference"];
          created_at: string;
          id: string;
          reduce_animations: boolean;
          updated_at: string;
          week_start: number;
        };
        Insert: {
          color_mode?: Database["public"]["Enums"]["color_mode_preference"];
          created_at?: string;
          id: string;
          reduce_animations?: boolean;
          updated_at?: string;
          week_start?: number;
        };
        Update: {
          color_mode?: Database["public"]["Enums"]["color_mode_preference"];
          created_at?: string;
          id?: string;
          reduce_animations?: boolean;
          updated_at?: string;
          week_start?: number;
        };
        Relationships: [
          {
            foreignKeyName: "profile_settings_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_path: string | null;
          created_at: string;
          id: string;
          timezone: string;
          updated_at: string;
          username: string;
        };
        Insert: {
          avatar_path?: string | null;
          created_at?: string;
          id: string;
          timezone?: string;
          updated_at?: string;
          username: string;
        };
        Update: {
          avatar_path?: string | null;
          created_at?: string;
          id?: string;
          timezone?: string;
          updated_at?: string;
          username?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      set_habit_completion: {
        Args: {
          p_date: string;
          p_habit_id: string;
          p_value: number;
          p_week_start?: number;
        };
        Returns: undefined;
      };
    };
    Enums: {
      color_mode_preference: "light" | "dark" | "system";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      color_mode_preference: ["light", "dark", "system"],
    },
  },
} as const;
