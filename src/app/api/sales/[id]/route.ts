import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from('sales_entries')
      .select(`
        *,
        customer:customers (*),
        product:products (product_name),
        invoice:invoices (id, invoice_number)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Map to form values
    const formValues = {
      salesperson: data.salesperson,
      customerName: data.customer?.customer_name,
      address: data.customer?.address || '',
      phoneNumber: data.customer?.phone || '',
      email: data.customer?.email || '',
      customerType: data.customer?.customer_type === 'BUSINESS' ? 'Business' : 'Customer',
      gstNumber: data.customer?.gst_number || '',
      gstType: 'Regular', // Mapped statically for now
      product: data.product?.product_name || '',
      quantity: data.quantity,
      rate: data.rate,
      delivery: data.delivery_type,
      courierCharge: data.courier_charge || undefined,
      chargeCourierToCustomer: data.courier_charge > 0,
      entryType: data.entry_type
    };

    return NextResponse.json({ 
      success: true, 
      data: formValues, 
      invoiceNumber: data.invoice && data.invoice.length > 0 ? data.invoice[0].invoice_number : null 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      salesperson, customerName, address, phoneNumber, email,
      customerType: formCustomerType, gstNumber, product, 
      quantity, rate, delivery, entryType, courierCharge, chargeCourierToCustomer
    } = body;

    // 1. Get existing sale
    const { data: existingSale } = await supabase
      .from('sales_entries')
      .select('customer_id, amount_paid, invoice:invoices(id, invoice_number)')
      .eq('id', id)
      .single();
      
    if (!existingSale) return NextResponse.json({ error: 'Sale not found' }, { status: 404 });

    // 2. Update Customer
    const customerType = formCustomerType === 'Business' ? 'BUSINESS' : 'CUSTOMER';
    await supabase.from('customers').update({
      customer_name: customerName,
      address,
      phone: phoneNumber,
      email,
      customer_type: customerType,
      gst_number: gstNumber
    }).eq('id', existingSale.customer_id);

    // 3. Resolve Product ID
    const { data: productRecord } = await supabase.from('products').select('id').eq('product_name', product).single();
    if (!productRecord) return NextResponse.json({ error: 'Product not found' }, { status: 400 });

    // 4. Calculate Totals
    const totalAmount = quantity * rate;
    let totalGst = 0;
    if (entryType === 'Sale') {
      const taxableRate = Number(rate) / 1.05;
      const taxableValue = Number(quantity) * taxableRate;
      totalGst = taxableValue * 0.05;
    }
    
    const courierAmt = Number(courierCharge || 0);
    const invoiceCourierAmt = chargeCourierToCustomer ? courierAmt : 0;
    const grandTotal = totalAmount + invoiceCourierAmt;

    // Recalculate balance
    const amountPaid = Number(existingSale.amount_paid || 0);
    const newBalance = grandTotal - amountPaid;
    
    let newStatus = 'Pending';
    if (newBalance <= 0) newStatus = 'Paid';
    else if (amountPaid > 0) newStatus = 'Partial';

    // 5. Update Sale Entry
    const { data: updatedSale, error: updateError } = await supabase.from('sales_entries').update({
      salesperson,
      product_id: productRecord.id,
      quantity: Number(quantity),
      rate: Number(rate),
      total_amount: totalAmount,
      total_gst: totalGst,
      delivery_type: delivery,
      courier_charge: invoiceCourierAmt,
      entry_type: entryType,
      payment_status: newStatus,
      balance_amount: newBalance
    }).eq('id', id).select().single();

    if (updateError) throw updateError;

    // Always clear old courier expense for this sale to prevent duplicates
    await supabase.from('expenses').delete().eq('reference_id', id).eq('category', 'Courier');

    // Log expense if company pays
    if (!chargeCourierToCustomer && courierAmt > 0) {
      const { error: expenseError } = await supabase.from('expenses').insert([{
        expense_date: new Date().toISOString().split('T')[0],
        spent_by: salesperson,
        category: 'Courier',
        description: `Courier charges for sale to ${customerName}`,
        amount: courierAmt,
        payment_mode: 'Cash',
        reference_id: id
      }]);
      if (expenseError) {
        console.error('Failed to log expense:', expenseError);
      }
    }

    // 6. Update invoice type
    let invoiceRecord = null;
    if (existingSale.invoice && existingSale.invoice.length > 0) {
       const inv = existingSale.invoice[0];
       await supabase.from('invoices').update({ invoice_type: customerType }).eq('id', inv.id);
       invoiceRecord = { invoice_number: inv.invoice_number };
    }

    return NextResponse.json({ success: true, salesEntry: updatedSale, invoice: invoiceRecord });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
