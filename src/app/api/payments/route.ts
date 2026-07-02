import { NextResponse } from 'next/server';
import { getSalesWithPayments, updatePaymentStatus } from '@/lib/repositories/sales';

export async function GET() {
  try {
    const data = await getSalesWithPayments();
    
    // Format the data for the UI
    const formattedData = data.map((item: any) => {
      let calculatedBalance = item.balance_amount;
      if ((item.balance_amount === 0 || item.balance_amount === null || item.balance_amount === undefined) && item.amount_paid === 0 && item.payment_status === 'Pending') {
        calculatedBalance = Number(item.total_amount) + Number(item.courier_charge || 0);
      }

      return {
        id: item.id,
        date: item.created_at,
        customerName: item.customer?.customer_name || 'Unknown',
        invoiceNumber: item.invoice?.[0]?.invoice_number || 'N/A', // Relation returns array in some setups
        totalAmount: Number(item.total_amount) + Number(item.courier_charge || 0),
        amountPaid: item.amount_paid || 0,
        balanceAmount: calculatedBalance,
        paymentStatus: item.payment_status || 'Pending',
        entryType: item.entry_type,
        quantity: item.quantity
      };
    });

    return NextResponse.json({ success: true, data: formattedData });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, amountPaid, balanceAmount, paymentStatus } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updatedData = await updatePaymentStatus(id, amountPaid, balanceAmount, paymentStatus);

    return NextResponse.json({ success: true, data: updatedData });
  } catch (error: any) {
    console.error('Error updating payment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
