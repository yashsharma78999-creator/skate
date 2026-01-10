# Membership Renewal Debugging Guide

## Issue Summary
After user purchases a membership with successful payment:
- ❌ No membership appears in user profile ("My Membership" shows "no membership yet")
- ❌ Admin Subscribers page shows 0 subscribers

## Root Causes Fixed

### 1. Membership ID Extraction ✅ FIXED
**Problem**: The Programme page stores memberships with ID = `1000 + membership.id`, but the actual membership ID is in a separate `membershipId` field.

**Solution**: Updated Checkout to extract the correct membership ID:
```javascript
membershipIds = membershipItems.map(item => item.product.membershipId || (item.product.id - 1000));
```

### 2. CartProduct Interface ✅ FIXED
**Problem**: The CartProduct interface didn't include the `membershipId` field.

**Solution**: Added `membershipId?: number;` to CartProduct interface.

### 3. Order Notes Parsing ✅ IMPROVED
**Problem**: Regex might fail on whitespace in JSON arrays.

**Solution**: Updated regex pattern to handle spaces:
```javascript
const membershipMatch = order.notes.match(/MEMBERSHIPS:(\[[\d,\s]*\])/);
```

## Supabase Requirements

### 1. Required Tables

You **MUST** have these tables in Supabase:

#### ✅ `user_memberships` Table
Required columns:
- `id` (bigint, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `membership_id` (bigint, foreign key to memberships table)
- `start_date` (timestamp with time zone)
- `end_date` (timestamp with time zone)
- `is_active` (boolean, default: true)
- `created_at` (timestamp with time zone, default: now())
- `updated_at` (timestamp with time zone, default: now())

```sql
CREATE TABLE IF NOT EXISTS user_memberships (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  membership_id BIGINT NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_user_memberships_user_id ON user_memberships(user_id);
CREATE INDEX idx_user_memberships_membership_id ON user_memberships(membership_id);
```

#### ✅ `memberships` Table
Required columns:
- `id` (bigint, primary key)
- `name` (text)
- `description` (text, nullable)
- `price` (numeric)
- `duration_days` (integer) - **CRITICAL: This field must exist**
- `benefits` (jsonb, nullable)
- `icon` (text, nullable)
- `color` (text, nullable)
- `is_active` (boolean, default: true)
- `created_at` (timestamp with time zone, default: now())
- `updated_at` (timestamp with time zone, default: now())

#### ✅ `orders` Table
Required columns (you likely have this):
- `id` (bigint, primary key)
- `user_id` (uuid, nullable)
- `order_number` (text)
- `status` (text)
- `total_amount` (numeric)
- `payment_method` (text, nullable)
- `payment_status` (text)
- `notes` (text, nullable) - **CRITICAL: Must support long text for JSON serialization**
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)

#### ✅ `profiles` Table
Required columns:
- `id` (uuid, primary key)
- `email` (text)
- `full_name` (text, nullable)
- `avatar_url` (text, nullable)
- `created_at` (timestamp with time zone)

### 2. Row Level Security (RLS) Policies

You **MUST** have RLS policies that allow:

#### For `user_memberships` table:
```sql
-- Allow users to see their own memberships
CREATE POLICY "Users can read their own memberships" ON user_memberships
  FOR SELECT USING (auth.uid() = user_id);

-- Allow service role (Supabase) to insert memberships
CREATE POLICY "Service role can insert memberships" ON user_memberships
  FOR INSERT WITH CHECK (true);
```

#### For `memberships` table:
```sql
-- Allow public to read active memberships
CREATE POLICY "Anyone can read active memberships" ON memberships
  FOR SELECT USING (is_active = true);
```

#### For `orders` table:
```sql
-- Allow users to read their own orders
CREATE POLICY "Users can read their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to insert orders
CREATE POLICY "Authenticated users can insert orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Step-by-Step Verification Checklist

### Step 1: Verify Supabase Tables Exist

1. Go to Supabase Dashboard
2. Click "SQL Editor"
3. Run this query to check if tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_memberships', 'memberships', 'orders', 'profiles');
```

**Expected output**: Should show all 4 tables

If any table is missing, you need to create it. Use the SQL statements provided in "Required Tables" section above.

### Step 2: Verify Table Structure

For `user_memberships` table:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_memberships' 
ORDER BY ordinal_position;
```

Check that these columns exist:
- `id` (bigint)
- `user_id` (uuid)
- `membership_id` (bigint)
- `start_date` (timestamp)
- `end_date` (timestamp)
- `is_active` (boolean)

If `duration_days` column is missing from `memberships` table, add it:
```sql
ALTER TABLE memberships 
ADD COLUMN duration_days INTEGER DEFAULT 30;
```

### Step 3: Check RLS is Enabled

1. Go to Supabase Dashboard → Authentication → Policies
2. For each table (`user_memberships`, `memberships`, `orders`, `profiles`):
   - Click on the table name
   - Verify "Enable RLS" is ON
   - Check that policies exist (see step 2 above if missing)

### Step 4: Test with Console Logs

The payment service now has extensive logging. When you make a purchase:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Make a test purchase
4. Look for these log messages:

```
[PAYMENT] Processing X memberships for user [userId]
[PAYMENT] Fetching membership [membershipId]...
[PAYMENT] Membership details: {...}
[PAYMENT] Creating user_membership with end_date: [date]
[PAYMENT] ✅ Created user_membership for user [userId], membership [membershipId]: {...}
```

**If you see error messages instead:**
- `[PAYMENT] No membership IDs found in order notes` → Membership IDs not being stored correctly
- `[PAYMENT] Membership [id] not found` → Membership doesn't exist in database
- `[PAYMENT] Failed to create membership` → RLS policy issue or missing columns

### Step 5: Verify Admin Subscribers Page

After fixing Supabase:

1. Go to `/admin/subscribers`
2. Should see:
   - Total Subscribers count > 0
   - Active Subscriptions count > 0
   - Subscriber list with names, emails, memberships

## Complete Supabase Setup SQL

If you need to set up everything from scratch, run this SQL in Supabase:

```sql
-- Create memberships table
CREATE TABLE IF NOT EXISTS memberships (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  duration_days INTEGER NOT NULL DEFAULT 30,
  benefits JSONB,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_memberships table
CREATE TABLE IF NOT EXISTS user_memberships (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  membership_id BIGINT NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_user_memberships_user_id ON user_memberships(user_id);
CREATE INDEX idx_user_memberships_membership_id ON user_memberships(membership_id);
CREATE INDEX idx_user_memberships_end_date ON user_memberships(end_date);

-- Enable RLS
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for memberships
CREATE POLICY "Anyone can read active memberships" ON memberships
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can insert memberships" ON memberships
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update memberships" ON memberships
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Create RLS Policies for user_memberships
CREATE POLICY "Users can read their own memberships" ON user_memberships
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert memberships" ON user_memberships
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own memberships" ON user_memberships
  FOR UPDATE USING (auth.uid() = user_id);
```

## Testing Instructions

### Test 1: Create Membership (if not exists)
1. Go to Admin → Memberships
2. Click "Create New Membership"
3. Fill in details:
   - Name: "Gold Membership"
   - Price: 999
   - Duration Days: 30 (IMPORTANT!)
   - Click Create

### Test 2: Purchase Membership
1. Go to Programme page
2. Click "Add to Cart" for the membership
3. Click "Checkout"
4. Fill in details
5. Click "Continue to Payment"
6. Payment should complete successfully

### Test 3: Verify in User Profile
1. Go to Profile page
2. Under "My Memberships" section
3. Should see: "Gold Membership" with status "ACTIVE"
4. Should show: Start date (today), End date (today + 30 days)

### Test 4: Verify in Admin Subscribers
1. Go to Admin → Subscribers
2. Should see:
   - Total Subscribers: 1
   - Active Subscriptions: 1
   - Subscriber name and email in the table

## Common Issues & Solutions

### Issue: "No subscribers" / "No memberships" after purchase

**Possible causes:**

1. **Missing `duration_days` column in memberships table**
   ```sql
   ALTER TABLE memberships ADD COLUMN duration_days INTEGER DEFAULT 30;
   ```

2. **RLS policy blocking insert**
   - Check RLS policies exist and allow inserts
   - Make sure `WITH CHECK (true)` for service role

3. **user_id is NULL in order**
   - User might not be authenticated
   - Check if user.id is being passed correctly

4. **Membership not found**
   - Verify membership ID in memberships table
   - Check if membership.is_active = true

### Issue: Console error about missing columns

**Solution**: Add missing columns using ALTER TABLE statements provided above.

### Issue: RLS errors in console

**Solution**: Check Supabase → Authentication → Policies and add missing policies.

## Files Modified in This Fix

1. `src/pages/Checkout.tsx` - Fixed membership ID extraction
2. `src/contexts/CartContext.tsx` - Added membershipId to CartProduct interface
3. `src/services/payment.ts` - Added enhanced logging and improved regex

## Next Steps

1. Verify your Supabase tables using checklist above
2. Test the flow: Create membership → Add to cart → Checkout → Check profile
3. Watch console logs for any errors
4. Check Admin → Subscribers for the new subscriber entry
5. If still not working, share the console error messages for further debugging

---

**Need help?** Check the console logs (F12 → Console) and look for `[PAYMENT]` messages to identify the exact issue point.
