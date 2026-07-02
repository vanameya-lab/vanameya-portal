export const SALESPERSONS = ['Anantha Krishnan', 'Bini Suresh'] as const;

export const PRODUCTS = ['Instant Dry Ginger Coffee (10gm)'] as const;

export const RECENT_ENTRIES = [
  {
    id: '1',
    date: '2026-07-01',
    salesperson: 'Anantha Krishnan',
    customer: 'ABC Supermarket',
    product: 'Instant Dry Ginger Coffee (10gm)',
    quantity: 50,
    entryType: 'Sale',
  },
  {
    id: '2',
    date: '2026-07-01',
    salesperson: 'Bini Suresh',
    customer: 'City Bakery',
    product: 'Instant Dry Ginger Coffee (10gm)',
    quantity: 5,
    entryType: 'Sample',
  },
  {
    id: '3',
    date: '2026-06-30',
    salesperson: 'Anantha Krishnan',
    customer: 'Sunrise Store',
    product: 'Instant Dry Ginger Coffee (10gm)',
    quantity: 20,
    entryType: 'Sale',
  },
  {
    id: '4',
    date: '2026-06-30',
    salesperson: 'Anantha Krishnan',
    customer: 'FreshMart',
    product: 'Instant Dry Ginger Coffee (10gm)',
    quantity: 10,
    entryType: 'Sample',
  },
  {
    id: '5',
    date: '2026-06-29',
    salesperson: 'Bini Suresh',
    customer: 'Daily Needs',
    product: 'Instant Dry Ginger Coffee (10gm)',
    quantity: 100,
    entryType: 'Sale',
  },
];

export const DASHBOARD_STATS = {
  totalSales: '₹ 45,000',
  totalSamples: '15',
  courierExpense: '₹ 1,250',
  totalEntries: '124',
};
