import { supabase } from '../supabase';

export interface Customer {
  id?: string;
  customer_name: string;
  address?: string;
  phone?: string;
  email?: string;
  customer_type: 'BUSINESS' | 'CUSTOMER';
  gst_number?: string;
  created_at?: string;
}

export async function findOrCreateCustomer(data: Customer): Promise<Customer> {
  // Try to find by name or phone
  let query = supabase.from('customers').select('*');
  
  if (data.phone) {
    query = query.eq('phone', data.phone);
  } else {
    query = query.eq('customer_name', data.customer_name);
  }

  const { data: existing, error: searchError } = await query.limit(1).single();

  if (existing) {
    return existing as Customer;
  }

  // Create new
  const { data: newCustomer, error: createError } = await supabase
    .from('customers')
    .insert([
      {
        customer_name: data.customer_name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        customer_type: data.customer_type,
        gst_number: data.gst_number,
      },
    ])
    .select()
    .single();

  if (createError) throw new Error(`Failed to create customer: ${createError.message}`);
  return newCustomer as Customer;
}
