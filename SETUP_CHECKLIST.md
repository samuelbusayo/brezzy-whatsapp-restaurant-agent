# Setup Checklist for Brezzy Stirs & Fries Dashboard

## ✅ Pre-Setup Verification

### Supabase Database Setup
Before running the dashboard, ensure your Supabase database has the following tables:

#### 1. Customers Table (`customers`)
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. Orders Table (`orders`) 
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id TEXT NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  items JSONB NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'unpaid',
  referencenumber TEXT,
  delivery_address TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE
);
```

### Enable Real-time on Supabase

1. Go to your Supabase project dashboard
2. Navigate to Database > Replication
3. Enable replication for both `customers` and `orders` tables
4. This allows real-time subscriptions to work

### Row Level Security (RLS) - Optional

For production, you may want to enable RLS policies:

```sql
-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow public read access (adjust based on your needs)
CREATE POLICY "Allow public read access" ON customers FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON orders FOR SELECT USING (true);
```

## 📋 Installation Checklist

- [x] Node.js installed (v16 or higher)
- [x] Project dependencies installed (`npm install`)
- [x] `.env` file configured with correct Supabase credentials
- [x] Supabase database tables created
- [x] Real-time replication enabled on Supabase
- [x] Development server running (`npm run dev`)

## 🔍 Environment Variables Check

Your `.env` file should have:
```
VITE_SUPABASE_URL=https://hdrzldkpvqjqibhafbyk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=development
```

## 🧪 Testing the Connection

### Test 1: Dashboard Loads
- [ ] Dashboard displays without errors
- [ ] All 6 statistics cards are visible
- [ ] No error messages in browser console

### Test 2: Customer List
- [ ] Customer list component loads
- [ ] Search box is functional
- [ ] Customers display if data exists in database

### Test 3: Orders Management
- [ ] Orders list component loads
- [ ] Search functionality works
- [ ] Click on an order opens the details modal

### Test 4: Real-time Updates
- [ ] Add a new order in Supabase directly
- [ ] Verify the order appears in the dashboard without refresh
- [ ] Notification toast appears
- [ ] Dashboard statistics update

### Test 5: Notification System
- [ ] Bell icon with counter is visible
- [ ] Sound toggle button works
- [ ] Notification history panel displays

## 🚨 Troubleshooting

### Issue: Dashboard shows "Loading..." indefinitely
**Solution**: 
- Check your `.env` file has correct Supabase credentials
- Verify Supabase URL is accessible
- Check browser console for errors

### Issue: No real-time updates
**Solution**:
- Ensure real-time replication is enabled in Supabase
- Check that tables have replication enabled
- Verify your Supabase plan supports real-time features

### Issue: TypeScript errors
**Solution**:
- Run `npm install` to ensure all dependencies are installed
- Check that `vite-env.d.ts` exists in the `src` folder

### Issue: Search not working
**Solution**:
- Ensure data exists in your database
- Check that column names match the schema
- Verify data types are correct

## 📊 Sample Data (Optional)

To test the dashboard with sample data, you can insert:

### Sample Customer
```sql
INSERT INTO customers (chat_id, phone_number, name, email, total_orders, total_spent)
VALUES ('123456789', '+2348012345678', 'John Doe', 'john@example.com', 5, 15000);
```

### Sample Order
```sql
INSERT INTO orders (
  chat_id, 
  order_number, 
  items, 
  total_amount, 
  status, 
  payment_status, 
  referencenumber, 
  delivery_address, 
  special_instructions
)
VALUES (
  '123456789',
  'ORD-001',
  '[{"name": "Burger", "quantity": 2, "price": 2500}, {"name": "Fries", "quantity": 1, "price": 1500}]'::jsonb,
  6500,
  'pending',
  'paid',
  'REF-12345',
  '123 Main Street, Lagos',
  'Extra ketchup please'
);
```

## ✨ Success Indicators

Your setup is successful when:
- ✅ Dashboard loads without errors
- ✅ Statistics display correctly
- ✅ Customer list shows data
- ✅ Orders list shows data
- ✅ Real-time updates work (test by adding data in Supabase)
- ✅ Notifications appear for new orders
- ✅ Order details modal opens on click
- ✅ Search functionality works in both customer and order lists

## 🎉 You're Ready!

Once all checks pass, your dashboard is ready for use. You can now:
1. Monitor orders in real-time
2. Track customer information
3. Receive instant notifications
4. View detailed order information

For more information, see `FEATURES.md` and `README.md`.
