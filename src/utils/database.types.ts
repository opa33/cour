/**
 * Generated types for Supabase database
 * These should match your database schema
 * Update when you modify tables in Supabase
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          telegram_id: string;
          username: string;
          settings: Json | null;
          leaderboard_opt_in: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          telegram_id: string;
          username: string;
          settings?: Json | null;
          leaderboard_opt_in?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          telegram_id?: string;
          username?: string;
          settings?: Json | null;
          leaderboard_opt_in?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      shifts: {
        Row: {
          id: string;
          telegram_id: string;
          date: string;
          minutes: number;
          zone1: number;
          zone2: number;
          zone3: number;
          kilometers: number;
          fuelCost: number;
          timeIncome: number;
          ordersIncome: number;
          totalWithTax: number;
          totalWithoutTax: number;
          netProfit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          telegram_id: string;
          date: string;
          minutes: number;
          zone1: number;
          zone2: number;
          zone3: number;
          kilometers: number;
          fuelCost: number;
          timeIncome: number;
          ordersIncome: number;
          totalWithTax: number;
          totalWithoutTax: number;
          netProfit: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          telegram_id?: string;
          date?: string;
          minutes?: number;
          zone1?: number;
          zone2?: number;
          zone3?: number;
          kilometers?: number;
          fuelCost?: number;
          timeIncome?: number;
          ordersIncome?: number;
          totalWithTax?: number;
          totalWithoutTax?: number;
          netProfit?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      leaderboard_cache: {
        Row: {
          id: string;
          period_start: string;
          period_end: string;
          period_type: "day" | "week" | "month";
          telegram_id: string;
          username: string;
          total_earnings: number;
          rank: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          period_start: string;
          period_end: string;
          period_type: "day" | "week" | "month";
          telegram_id: string;
          username: string;
          total_earnings: number;
          rank: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          period_start?: string;
          period_end?: string;
          period_type?: "day" | "week" | "month";
          telegram_id?: string;
          username?: string;
          total_earnings?: number;
          rank?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_leaderboard: {
        Args: {
          start_date: string;
          end_date: string;
          limit_count: number;
        };
        Returns: Array<{
          rank: number;
          telegram_id: string;
          username: string;
          total_earnings: number;
        }>;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
