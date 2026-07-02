import { supabase } from '../supabase';

export interface SalesEntry {
  id?: string;
  customer_id: string;
  salesperson: string;
  product_id: string;
  quantity: number;
  rate: number;
  total_amount: number;
  total_gst?: number;
  delivery_type: 'Direct' | 'Courier';
  courier_charge?: number;
  entry_type: 'Sale' | 'Sample';
  payment_status: 'Paid' | 'Pending' | 'Partial';
  amount_paid?: number;
  balance_amount?: number;
  notes?: string;
  created_at?: string;
}

export async function createSalesEntry(entry: SalesEntry): Promise<SalesEntry> {
  const { data, error } = await supabase
    .from('sales_entries')
    .insert([entry])
    .select()
    .single();

  if (error) throw new Error(`Failed to create sales entry: ${error.message}`);
  return data as SalesEntry;
}

export async function generateInvoiceNumber(invoiceType: 'BUSINESS' | 'CUSTOMER', financialYear: string): Promise<string> {
  const { data, error } = await supabase.rpc('generate_next_invoice_number', {
    p_invoice_type: invoiceType,
    p_financial_year: financialYear
  });
  
  if (error) throw new Error(`Failed to generate invoice number: ${error.message}`);
  return data as string;
}

export async function createInvoice(invoice: {
  invoice_number: string;
  invoice_type: 'BUSINESS' | 'CUSTOMER';
  sales_entry_id: string;
  financial_year: string;
}): Promise<any> {
  const { data, error } = await supabase
    .from('invoices')
    .insert([invoice])
    .select()
    .single();

  if (error) throw new Error(`Failed to create invoice: ${error.message}`);
  return data;
}

export async function getSalesWithPayments() {
  const { data, error } = await supabase
    .from('sales_entries')
    .select(`
      id, created_at, total_amount, payment_status, amount_paid, balance_amount, entry_type, quantity, courier_charge,
      customer:customers ( customer_name ),
      invoice:invoices ( invoice_number )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch sales entries: ${error.message}`);
  return data;
}

export async function updatePaymentStatus(id: string, amount_paid: number, balance_amount: number, payment_status: string) {
  const { data, error } = await supabase
    .from('sales_entries')
    .update({ amount_paid, balance_amount, payment_status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update payment status: ${error.message}`);
  return data;
}
