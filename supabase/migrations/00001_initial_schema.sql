-- 1. Customers Table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    customer_type TEXT CHECK (customer_type IN ('BUSINESS', 'CUSTOMER')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for checking existing customers by phone or name
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_name ON customers(customer_name);

-- 2. Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name TEXT NOT NULL,
    default_rate NUMERIC NOT NULL,
    gst_percentage NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial product
INSERT INTO products (product_name, default_rate, gst_percentage) 
VALUES ('Instant Dry Ginger Coffee(10gm)', 7.00, 0);

-- 3. Sales Entries Table
CREATE TABLE sales_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
    salesperson TEXT NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    rate NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    delivery_type TEXT CHECK (delivery_type IN ('Direct', 'Courier')) NOT NULL,
    courier_charge NUMERIC DEFAULT 0,
    entry_type TEXT CHECK (entry_type IN ('Sale', 'Sample')) NOT NULL,
    payment_status TEXT CHECK (payment_status IN ('Paid', 'Pending', 'Partial')) NOT NULL,
    amount_paid NUMERIC DEFAULT 0,
    balance_amount NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Invoices Table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_type TEXT CHECK (invoice_type IN ('BUSINESS', 'CUSTOMER')) NOT NULL,
    sales_entry_id UUID REFERENCES sales_entries(id) ON DELETE CASCADE,
    invoice_date DATE DEFAULT CURRENT_DATE,
    financial_year TEXT NOT NULL, -- e.g., '26-27'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Expenses Table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_date DATE DEFAULT CURRENT_DATE,
    spent_by TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    payment_mode TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Sequence generator for invoices
CREATE TABLE invoice_sequences (
    invoice_type TEXT NOT NULL,
    financial_year TEXT NOT NULL,
    last_value INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (invoice_type, financial_year)
);

-- Function to generate invoice number atomically
CREATE OR REPLACE FUNCTION generate_next_invoice_number(p_invoice_type TEXT, p_financial_year TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_prefix TEXT;
    v_next_value INTEGER;
    v_invoice_number TEXT;
BEGIN
    IF p_invoice_type = 'BUSINESS' THEN
        v_prefix := 'VMB';
    ELSIF p_invoice_type = 'CUSTOMER' THEN
        v_prefix := 'VMC';
    ELSE
        RAISE EXCEPTION 'Invalid invoice type';
    END IF;

    INSERT INTO invoice_sequences (invoice_type, financial_year, last_value)
    VALUES (p_invoice_type, p_financial_year, 1)
    ON CONFLICT (invoice_type, financial_year)
    DO UPDATE SET last_value = invoice_sequences.last_value + 1
    RETURNING last_value INTO v_next_value;

    v_invoice_number := v_prefix || '/' || p_financial_year || '/' || LPAD(v_next_value::TEXT, 4, '0');
    RETURN v_invoice_number;
END;
$$;
