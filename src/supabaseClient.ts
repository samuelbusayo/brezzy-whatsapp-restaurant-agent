import { createClient } from '@supabase/supabase-js';

// Database types
export interface Customer {
  id: string;
  chat_id: string;
  phone_number: string;
  name: string;
  email: string;
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  chat_id: string;
  order_number: string;
  items: string | any[]; // JSON string or parsed array
  total_amount: number;
  status: string;
  payment_status: string;
  referencenumber: string;
  delivery_address: string;
  special_instructions: string;
  created_at: string;
  delivered_at: string | null;
}

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: Customer;
        Insert: Omit<Customer, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at'>;
        Update: Partial<Omit<Order, 'id' | 'created_at'>>;
      };
    };
  };
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
