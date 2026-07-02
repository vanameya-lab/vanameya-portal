-- Dashboard Stats Function
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    total_sales_amount NUMERIC;
    total_sales_count INTEGER;
    total_sample_count INTEGER;
    total_courier_expense NUMERIC;
    total_business_expenses NUMERIC;
    pending_payments NUMERIC;
    paid_amount NUMERIC;
    outstanding_amount NUMERIC;
    result json;
BEGIN
    -- Sales Stats
    SELECT 
        COALESCE(SUM(total_amount), 0),
        COUNT(*)
    INTO total_sales_amount, total_sales_count
    FROM sales_entries WHERE entry_type = 'Sale';

    -- Sample Stats
    SELECT COUNT(*) INTO total_sample_count
    FROM sales_entries WHERE entry_type = 'Sample';

    -- Expense Stats
    SELECT COALESCE(SUM(amount), 0) INTO total_courier_expense
    FROM expenses WHERE category = 'Courier';

    SELECT COALESCE(SUM(amount), 0) INTO total_business_expenses
    FROM expenses;

    -- Payment Stats
    SELECT 
        COALESCE(SUM(total_amount - amount_paid), 0),
        COALESCE(SUM(amount_paid), 0)
    INTO outstanding_amount, paid_amount
    FROM sales_entries WHERE entry_type = 'Sale';
    
    -- In this simple model, outstanding_amount is our pending payments total.
    pending_payments := outstanding_amount;

    result := json_build_object(
        'totalSalesAmount', total_sales_amount,
        'totalSalesCount', total_sales_count,
        'totalSampleCount', total_sample_count,
        'totalCourierExpense', total_courier_expense,
        'totalBusinessExpenses', total_business_expenses,
        'pendingPayments', pending_payments,
        'paidAmount', paid_amount,
        'outstandingAmount', outstanding_amount
    );

    RETURN result;
END;
$$;
