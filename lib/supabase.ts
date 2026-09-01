import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  icon: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category_id: string | null;
  subcategory_id: string | null;
  images: string[];
  featured: boolean;
  created_at: string;
};

export type OrderItem = {
  product_id?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export type Order = {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  status: string;
  shipping_method: string;
  address: string | null;
  city: string | null;
  notes: string | null;
  total: number;
  items: OrderItem[];
  created_at: string;
};

export type Profile = {
  id: string;
  email: string;
  role: 'admin' | 'empleado';
  created_at: string;
};

export type ProductWithRelations = Product & {
  category?: Category | null;
  subcategory?: Category | null;
};
