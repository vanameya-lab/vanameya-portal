# VANAMÉYA Portal Database Documentation

This document explains the initial database schema built on Supabase. The goal of this design is to stay within the Supabase Free Tier by using normalized tables, minimizing duplicate data, avoiding raw file/blob storage, and leveraging relational PostgreSQL features.

## 1. Customers (`customers`)
**Purpose:** Stores customer and shop details uniquely.
**Why it exists:** To prevent duplicate data entry for returning customers. By storing a customer once, all their future sales and invoices can link back to a single record via a foreign key (`customer_id`).
**Key Columns:**
- `customer_type`: Differentiates between a `'BUSINESS'` (which typically requires a GST invoice) and a direct `'CUSTOMER'`.
- `phone` / `customer_name`: Used for lookup to reuse an existing record.

## 2. Products (`products`)
**Purpose:** Stores the product master data.
**Why it exists:** Prevents hardcoding prices and GST rates in the app. Allows for easy addition of new products in the future without changing the code.
**Key Columns:**
- `default_rate`: The standard selling price.
- `gst_percentage`: Used for future dynamic tax calculations.
- `is_active`: Allows "deleting" a product from the UI without breaking historical sales records.

## 3. Sales Entries (`sales_entries`)
**Purpose:** The central table recording every transaction (Sales or Samples).
**Why it exists:** To track the core business operations. Instead of saving PDFs, we save the raw data here.
**Key Columns:**
- `entry_type`: Distinguishes between a `'Sale'` (revenue generating) and a `'Sample'` (promotional).
- `delivery_type` & `courier_charge`: Tracks if an item was sent via courier and how much it cost.
- `payment_status`, `amount_paid`, `balance_amount`: Critical for tracking pending payments directly on the transaction level.

## 4. Invoices (`invoices`)
**Purpose:** Tracks officially generated invoices for Sales.
**Why it exists:** Only `'Sale'` entries generate invoices, while `'Sample'` entries do not. The business requirements dictate different sequence numbers for Businesses (e.g., `VMB/...`) and Customers (e.g., `VMC/...`).
**Key Columns:**
- `invoice_type`: Matches the `customer_type` to determine the numbering sequence (`BUSINESS` vs `CUSTOMER`).
- `invoice_number`: The uniquely generated formatted string (e.g., `VMB/26-27/0001`).
- `sales_entry_id`: Links back to the sale details so the frontend can dynamically regenerate the PDF at any time without storing the actual PDF file in Supabase Storage.

## 5. Expenses (`expenses`)
**Purpose:** Tracks every business expense (Courier, Fuel, Travel, etc.).
**Why it exists:** To provide a complete financial picture on the dashboard.
**Key Columns:**
- `category`: Used for filtering and aggregating expenses (e.g., separating Courier expenses from other Business expenses).

## 6. Invoice Sequences (`invoice_sequences`)
**Purpose:** A helper table used by the `generate_next_invoice_number` PostgreSQL function.
**Why it exists:** Relying on `COUNT(*)` to generate sequence numbers is prone to race conditions (two people creating an invoice at the exact same millisecond could get the same number). This table safely and atomically tracks the last used number per type and financial year.

## Functions & RPCs
- **`generate_next_invoice_number(type, year)`**: Safely increments the sequence and formats the invoice number dynamically.
- **`get_dashboard_stats()`**: A server-side PostgreSQL function that aggregates total sales, samples, and expenses in a single query, dramatically reducing the amount of data transferred to the Next.js backend.
