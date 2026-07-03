import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { RecentEntriesTable } from "@/components/dashboard/RecentEntriesTable";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Fetch stats directly in server component
  const { data: stats } = await supabase.rpc('get_dashboard_stats');
  
  // Calculate total GST
  const { data: salesWithGst } = await supabase
    .from('sales_entries')
    .select('total_gst')
    .gt('total_gst', 0);
    
  const totalGst = salesWithGst?.reduce((sum, sale) => sum + (Number(sale.total_gst) || 0), 0) || 0;
  
  // Calculate Total Expenses
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount');
    
  const totalExpenses = expenses?.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0) || 0;

  // Add these to stats
  const extendedStats = {
    ...stats,
    totalGst,
    totalExpenses,
    netRevenue: (stats?.totalSalesAmount || 0) - totalGst,
    netProfit: ((stats?.totalSalesAmount || 0) - totalGst) - totalExpenses
  };

  const { data: recentSales } = await supabase
    .from('sales_entries')
    .select(`
      *,
      customers ( customer_name ),
      products ( product_name )
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>
      <DashboardCards stats={extendedStats} />
      <div className="grid gap-4 mt-8">
        <h3 className="text-xl font-semibold tracking-tight">Recent Entries</h3>
        <RecentEntriesTable entries={recentSales || []} />
      </div>
    </div>
  );
}
