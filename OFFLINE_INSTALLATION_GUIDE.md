# Offline Installation & Local Development Guide

## 📋 Table of Contents
1. [System Requirements](#system-requirements)
2. [Step-by-Step Installation](#step-by-step-installation)
3. [Database Setup](#database-setup)
4. [Running Locally](#running-locally)
5. [Admin Account Creation](#admin-account-creation)
6. [Testing & Verification](#testing--verification)

---

## 🖥️ System Requirements

### Minimum Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Internet Connection**: Required for:
  - Initial npm package installation
  - Supabase database connection
- **RAM**: 2GB minimum
- **Storage**: 500MB free space
- **Browser**: Chrome, Firefox, Safari, or Edge (latest version)

### Optional but Recommended
- **Git**: For version control
- **VS Code**: For code editing
- **Postman**: For API testing
- **SQLPad**: For database query testing

---

## 📦 Step-by-Step Installation

### Step 1: Install Node.js & npm

#### On Windows:
1. Download from: https://nodejs.org/en (LTS version recommended)
2. Run the installer
3. Choose "Add to PATH" during installation
4. Restart your computer
5. Verify installation:
```bash
node --version
npm --version
```

#### On macOS:
```bash
# Using Homebrew (if installed)
brew install node

# Or download from https://nodejs.org/en
# Then verify:
node --version
npm --version
```

#### On Linux (Ubuntu/Debian):
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

### Step 2: Clone or Download the Project

#### Option A: Using Git (Recommended)
```bash
git clone <your-repository-url> shopping-web
cd shopping-web
```

#### Option B: Download ZIP
1. Download the project ZIP file
2. Extract it to your desired location
3. Open terminal/cmd in the extracted folder
```bash
cd path/to/shopping-web
```

---

### Step 3: Install Dependencies

```bash
# Navigate to project directory
cd shopping-web

# Install all npm packages
npm install

# This will take 3-5 minutes depending on internet speed
```

**Expected Output:**
```
added XXX packages, and audited XXX packages in Xms
```

---

### Step 4: Verify Installation

Check if all dependencies installed correctly:
```bash
npm list

# You should see the project dependencies listed without errors
```

---

## 🗄️ Database Setup

### Step 1: Access Your Supabase Project

1. Go to: https://app.supabase.com
2. Sign in with your account
3. Select your project
4. Go to **SQL Editor** section

### Step 2: Run the Database Migration

1. Click **"New Query"** button
2. Copy the entire content from: `supabase/migrations/001_init_schema.sql`
3. Paste it into the SQL Editor
4. Click **"Run"** button
5. Wait for the query to complete (should show ✓)

**Migration includes:**
- profiles table (users)
- products table (inventory)
- orders & order_items tables
- memberships & user_memberships tables
- payment_transactions table
- **payment_options table** (NEW - for payment method configuration)
- All necessary indexes
- Row-Level Security (RLS) policies

### Step 3: Verify Database Tables

After migration completes:
1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - profiles
   - products
   - orders
   - order_items
   - memberships
   - user_memberships
   - inventory_logs
   - payment_transactions
   - payment_options ✓

---

### Step 4: Create Admin Account

#### Method 1: Using Supabase Dashboard (Recommended)

1. Go to Supabase **Authentication** → **Users**
2. Click **"Add user"** button
3. Enter:
   - Email: `admin@example.com`
   - Password: `SecurePassword123!`
4. Click **"Create user"**
5. Copy the User ID (UUID)
6. Go to **SQL Editor** and run:

```sql
-- Create admin profile (replace UUID with actual user ID)
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'PASTE-USER-ID-HERE',
  'admin@example.com',
  'Admin User',
  'admin'
) ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

#### Method 2: Using SQL Only

```sql
-- This creates a new auth user and profile
-- Note: In Supabase, you typically need to create auth users via UI
-- But you can create profiles directly:

INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'YOUR-UUID-HERE',
  'admin@example.com',
  'Admin User',
  'admin'
);
```

#### Method 3: Sign Up Through App, Then Change Role

1. Start the app: `npm run dev`
2. Go to `/auth` page
3. Sign up with email: `admin@example.com`
4. Go back to Supabase SQL Editor
5. Run:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

---

### Step 5: Create Sample Products

You can create products in two ways:

#### Option A: Using Admin Dashboard
1. Start the app: `npm run dev`
2. Go to `/admin/login`
3. Log in with admin credentials
4. Click **Inventory** → **Add Product**
5. Fill in:
   - **Name**: Ice Skates Pro
   - **Price**: 2999.00
   - **Original Price**: 3999.00
   - **Category**: Ice Skates
   - **Stock Quantity**: 50
   - **SKU**: ISP-001
   - **Description**: Premium quality ice skates
6. Click **Create Product**

#### Option B: Using SQL (Bulk Insert)

```sql
INSERT INTO public.products (name, description, price, original_price, category, stock_quantity, sku, is_active)
VALUES
  ('Premium Ice Skates', 'Professional grade ice skates', 2999.00, 3999.00, 'Ice Skates', 50, 'ISP-001', true),
  ('Hockey Helmet', 'Safety certified helmet', 1499.00, 1999.00, 'Protective Gear', 30, 'HH-001', true),
  ('Skating Gloves', 'Insulated gloves for skating', 599.00, 799.00, 'Apparel', 100, 'SG-001', true),
  ('Knee Pads', 'Protection pads for knees', 449.00, 599.00, 'Protective Gear', 75, 'KP-001', true);
```

---

### Step 6: Configure Payment Methods

Add enabled payment options via Supabase:

```sql
-- Add PayU payment option
INSERT INTO public.payment_options (provider, merchant_key, merchant_salt, is_enabled)
VALUES (
  'payu',
  'YOUR_PAYU_MERCHANT_KEY',
  'YOUR_PAYU_MERCHANT_SALT',
  true
);

-- Add PayPal payment option
INSERT INTO public.payment_options (provider, api_key, api_secret, is_enabled)
VALUES (
  'paypal',
  'YOUR_PAYPAL_API_KEY',
  'YOUR_PAYPAL_API_SECRET',
  true
);

-- Add Paytm payment option
INSERT INTO public.payment_options (provider, merchant_key, merchant_salt, is_enabled)
VALUES (
  'paytm',
  'YOUR_PAYTM_MERCHANT_KEY',
  'YOUR_PAYTM_MERCHANT_SALT',
  true
);
```

---

## ▶️ Running Locally

### Start Development Server

```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.4.19  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

### Access the Application

- **Home Page**: http://localhost:5173
- **Store**: http://localhost:5173/store
- **Admin Login**: http://localhost:5173/admin/login
- **Checkout**: http://localhost:5173/checkout

### Build for Production

When you're ready to deploy:

```bash
npm run build
```

This creates a `dist` folder with optimized production files.

---

## 👤 Admin Account Creation

### Default Admin Credentials

| Field | Value |
|-------|-------|
| Email | admin@example.com |
| Password | (your choice) |
| Role | admin |
| URL | http://localhost:5173/admin/login |

### Change Admin Password

1. Log out from admin panel
2. Click "Sign In" at `/auth`
3. Click "Forgot Password" if needed
4. Or update directly in Supabase:

```sql
-- You cannot change password directly in DB
-- Use Supabase Auth → Users → Edit User
```

### Create Additional Admin Accounts

```sql
-- First, create auth user in Supabase Dashboard
-- Then create profile:

INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'NEW-USER-UUID',
  'newadmin@example.com',
  'New Admin',
  'admin'
);
```

---

## ✅ Testing & Verification

### Test Checklist

#### 1. Database Connection
```bash
# Check in browser console after loading the app
# Look for successful Supabase connection
```

#### 2. Admin Login
- [ ] Go to `/admin/login`
- [ ] Enter: admin@example.com
- [ ] Enter password
- [ ] Should redirect to `/admin/dashboard`
- [ ] Should see dashboard with stats

#### 3. Admin Features
- [ ] **Dashboard**: See stats, charts, recent orders
- [ ] **Inventory**: Add a new product successfully
- [ ] **Inventory**: Edit existing product
- [ ] **Inventory**: Delete a product
- [ ] **Payment Options**: Add/edit payment method
- [ ] **Orders**: View and update order status

#### 4. Customer Features
- [ ] Go to `/store`
- [ ] Add items to cart
- [ ] Go to `/checkout`
- [ ] See payment method dropdown with options
- [ ] Select a payment method
- [ ] Complete checkout
- [ ] See order in `/orders`

#### 5. Payment Methods
- [ ] Verify payment options appear in checkout
- [ ] Can select different payment methods
- [ ] Order saves with selected method

### Common Issues & Solutions

#### Issue: "Cannot find Supabase connection"
**Solution:**
1. Check `.env` file has `VITE_SUPABASE_URL`
2. Verify Supabase credentials are correct
3. Check internet connection
4. Restart dev server: `npm run dev`

#### Issue: "Payment options not showing in checkout"
**Solution:**
1. Verify `payment_options` table was created (run migration)
2. Check if payment options are set to `is_enabled = true`
3. Restart dev server

#### Issue: "Admin login fails"
**Solution:**
1. Verify admin profile exists in `profiles` table
2. Check role is set to 'admin'
3. Verify email is correct (case-sensitive)
4. Clear browser cookies: `localStorage.clear()`

#### Issue: "Products not showing in store"
**Solution:**
1. Verify products exist in database
2. Check `is_active = true`
3. Verify image URLs are accessible
4. Check RLS policies in Supabase

---

## 📝 Environment Variables

The project uses `.env` file for configuration. You should have:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_PAYU_KEY=your-payu-key (optional)
VITE_PAYU_SALT=your-payu-salt (optional)
VITE_PAYU_BASE_URL=https://secure.payu.in (optional)
```

**Note**: These are already configured in your project.

---

## 🔧 Troubleshooting

### Port Already in Use

If port 5173 is already in use:

```bash
# On Windows
netstat -ano | findstr :5173

# On Mac/Linux
lsof -i :5173

# Then stop the process and run:
npm run dev -- --port 3000
```

### npm install stuck

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Database migration failed

```sql
-- Check if tables already exist
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public'
);

-- Drop tables if needed (WARNING: loses data)
DROP TABLE IF EXISTS payment_options CASCADE;
-- Then re-run migration
```

---

## 🚀 Next Steps

1. ✅ Install Node.js
2. ✅ Install project dependencies
3. ✅ Run database migration
4. ✅ Create admin account
5. ✅ Add sample products
6. ✅ Configure payment methods
7. ✅ Run `npm run dev`
8. ✅ Test admin & customer features
9. 📦 Build for production: `npm run build`
10. 🌐 Deploy to cPanel (see CPANEL_DEPLOYMENT_GUIDE.md)

---

## 📞 Support

For issues:
1. Check browser console (F12)
2. Check Supabase dashboard for errors
3. Review logs in terminal
4. Check internet connection
5. Verify all credentials are correct

---

**Happy developing! 🎉**
