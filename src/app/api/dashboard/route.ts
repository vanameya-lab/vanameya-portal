import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch aggregated stats via RPC
    const { data: stats, error: statsError } = await supabase.rpc('get_dashboard_stats');
    if (statsError) throw new Error(`Stats Error: ${statsError.message}`);

    // Fetch Recent Sales (last 5)
    const { data: recentSales, error: salesError } = await supabase
      .from('sales_entries')
      .select(`
        *,
        customers ( customer_name ),
        products ( product_name )
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (salesError) throw new Error(`Recent Sales Error: ${salesError.message}`);

    // Fetch Recent Expenses (last 5)
    const { data: recentExpenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (expensesError) throw new Error(`Recent Expenses Error: ${expensesError.message}`);

    return NextResponse.json({
      success: true,
      stats,
      recentSales,
      recentExpenses
    });
  } catch (error: any) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
