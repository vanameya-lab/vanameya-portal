import { NextResponse } from 'next/server';
import { findOrCreateCustomer } from '@/lib/repositories/customer';
import { getProductByName } from '@/lib/repositories/product';
import { createSalesEntry, generateInvoiceNumber, createInvoice } from '@/lib/repositories/sales';
import { supabase } from '@/lib/supabase';

function getFinancialYear(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth(); // 0 = Jan, 3 = Apr
  let startYear = year;
  if (month < 3) {
    startYear = year - 1;
  }
  const endYear = startYear + 1;
  return `${startYear.toString().slice(-2)}-${endYear.toString().slice(-2)}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      salesperson,
      customerName,
      address,
      phoneNumber,
      email,
      customerType: formCustomerType,
      gstNumber,
      gstType,
      product,
      quantity,
      rate,
      delivery,
      entryType,
      courierCharge,
      customerCourierCharge
    } = body;

    // 1. Find or Create Customer
    const customerType = formCustomerType === 'Business' ? 'BUSINESS' : 'CUSTOMER';
    const customer = await findOrCreateCustomer({
      customer_name: customerName,
      address,
      phone: phoneNumber,
      email,
      customer_type: customerType,
      gst_number: gstNumber
    });

    // 2. Resolve Product ID
    // For now we assume the product name exactly matches
    const productRecord = await getProductByName(product);
    if (!productRecord) {
      return NextResponse.json({ error: `Product not found: ${product}` }, { status: 400 });
    }

    // 3. Create Sales Entry
    const totalAmount = quantity * rate;
    const paymentStatus = 'Pending'; // Default
    
    let totalGst = 0;
    if (entryType === 'Sale') {
      const taxableRate = Number(rate) / 1.05;
      const taxableValue = Number(quantity) * taxableRate;
      totalGst = taxableValue * 0.05;
    }
    
    const courierAmt = Number(courierCharge || 0);
    const invoiceCourierAmt = Number(customerCourierCharge || 0);
    const grandTotal = totalAmount + invoiceCourierAmt;
    
    const salesEntry = await createSalesEntry({
      customer_id: customer.id!,
      salesperson,
      product_id: productRecord.id,
      quantity: Number(quantity),
      rate: Number(rate),
      total_amount: totalAmount,
      total_gst: totalGst,
      delivery_type: delivery,
      courier_charge: invoiceCourierAmt,
      entry_type: entryType,
      payment_status: paymentStatus,
      balance_amount: grandTotal
    });

    // Automatically log expense if company pays for any part of the courier
    const companyExpense = courierAmt - invoiceCourierAmt;
    if (companyExpense > 0) {
      await supabase.from('expenses').insert([{
        expense_date: new Date().toISOString().split('T')[0],
        spent_by: salesperson,
        category: 'Courier',
        description: `Courier charges for sale to ${customerName}`,
        amount: companyExpense,
        payment_mode: 'Cash',
        reference_id: salesEntry.id
      }]);
    }

    // 4. Generate Invoice (if it's a SALE)
    let invoiceRecord = null;
    if (entryType === 'Sale') {
      const financialYear = getFinancialYear();
      const invoiceNumber = await generateInvoiceNumber(customerType, financialYear);
      
      invoiceRecord = await createInvoice({
        invoice_number: invoiceNumber,
        invoice_type: customerType,
        sales_entry_id: salesEntry.id!,
        financial_year: financialYear
      });
    }

    return NextResponse.json({ 
      success: true, 
      salesEntry, 
      invoice: invoiceRecord 
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
