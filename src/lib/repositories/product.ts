import { supabase } from '../supabase';

export interface Product {
  id: string;
  product_name: string;
  default_rate: number;
  gst_percentage: number;
  is_active: boolean;
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('product_name');
    
  if (error) throw new Error(`Failed to fetch products: ${error.message}`);
  return data as Product[];
}

export async function getProductByName(name: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('product_name', name)
    .single();
    
  if (error && error.code !== 'PGRST116') throw new Error(`Failed to fetch product: ${error.message}`);
  return data as Product | null;
}
