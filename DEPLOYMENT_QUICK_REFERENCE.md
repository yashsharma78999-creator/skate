# 🚀 Deployment Quick Reference Card

## ⚡ 5-Minute Quick Start

### Local Development (Offline)
```bash
# 1. Install dependencies
npm install

# 2. Run migration in Supabase SQL Editor
# Copy from: supabase/migrations/001_init_schema.sql

# 3. Create admin account in Supabase
INSERT INTO public.profiles (id, email, full_name, role)
VALUES ('YOUR-USER-ID', 'admin@example.com', 'Admin User', 'admin');

# 4. Start development server
npm run dev

# 5. Visit: http://localhost:5173/admin/login
```

---

## 📦 Build for Production

```bash
# Step 1: Install dependencies
npm install

# Step 2: Build the project
npm run build

# Step 3: Output folder
# All files are in: ./dist/
```

---

## 📤 Deploy to cPanel (3 Steps)

### Step 1: Upload Files
- Go to cPanel → File Manager → public_html
- Upload all files from `dist/` folder

### Step 2: Create .env.production
Create file in public_html with:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key-here
```

### Step 3: Create .htaccess
Create file in public_html:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ index.html [QSA,L]
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

---

## 🗄️ Database Setup (One-Time)

### In Supabase SQL Editor:

```sql
-- 1. Run migration (copy from supabase/migrations/001_init_schema.sql)

-- 2. Create admin
INSERT INTO public.profiles (id, email, full_name, role)
VALUES ('USER-UUID', 'admin@example.com', 'Admin', 'admin');

-- 3. Add payment methods
INSERT INTO public.payment_options (provider, merchant_key, merchant_salt, is_enabled)
VALUES 
  ('payu', 'YOUR_KEY', 'YOUR_SALT', true),
  ('paypal', 'YOUR_KEY', 'YOUR_SECRET', true),
  ('paytm', 'YOUR_KEY', 'YOUR_SALT', true);

-- 4. Add sample products
INSERT INTO public.products (name, price, category, stock_quantity, is_active)
VALUES 
  ('Product 1', 999, 'Category 1', 50, true),
  ('Product 2', 1499, 'Category 2', 30, true);
```

---

## 🔐 SSL Setup (1 Click)

Go to cPanel → AutoSSL → Check & Install

---

## ✅ Verification Checklist

### After Deployment:
- [ ] Visit https://yourdomain.com
- [ ] Page loads without errors
- [ ] Admin login works: /admin/login
- [ ] Store displays: /store
- [ ] Checkout works: /checkout
- [ ] Payment methods visible in checkout
- [ ] Can add product to cart
- [ ] SSL is green (https)
- [ ] No 404 errors

---

## 🆘 Common Issues & Quick Fixes

| Issue | Fix |
|-------|-----|
| 404 error | Check .htaccess, enable mod_rewrite |
| Payment methods missing | Verify payment_options table, refresh cache |
| Admin login fails | Check profile role = 'admin', clear cookies |
| Products not showing | Check is_active = true, verify images |
| HTTPS not working | Install SSL in cPanel → AutoSSL |
| Database error | Verify VITE_SUPABASE credentials |
| Slow loading | Enable compression in .htaccess |

---

## 📱 Admin Features After Deployment

| Feature | URL |
|---------|-----|
| Dashboard | /admin/dashboard |
| Orders | /admin/orders |
| Inventory | /admin/inventory |
| Payment Options | /admin/payment-options |
| Memberships | /admin/memberships |

---

## 🎯 Pre-Launch Checklist

- [ ] Database migrated
- [ ] Admin account created
- [ ] Payment methods configured
- [ ] Sample products added
- [ ] SSL installed
- [ ] .htaccess uploaded
- [ ] All files in public_html
- [ ] Domain DNS configured
- [ ] Admin features tested
- [ ] Customer checkout tested
- [ ] Payment methods visible
- [ ] Error logs monitored

---

## 📊 Monitoring

```bash
# Check if site is online
curl -I https://yourdomain.com

# Should see: HTTP/1.1 200 OK (or HTTP/2 200)
```

---

## 🔄 Update Process

```bash
# Make changes locally
# ... edit files ...

# Test locally
npm run dev

# Build again
npm run build

# Upload dist/ files to cPanel
# Clear browser cache: Ctrl+Shift+Del

# Done!
```

---

## 📞 Support Files to Read

1. **For offline setup**: Read `OFFLINE_INSTALLATION_GUIDE.md`
2. **For cPanel deployment**: Read `CPANEL_DEPLOYMENT_GUIDE.md`
3. **For features**: Read `IMPLEMENTATION_GUIDE.md`
4. **For quick start**: Read `QUICK_START.md`

---

## 🚀 One-Command Deployment

```bash
# Build and prepare for deployment
npm run build && echo "✓ Ready to upload 'dist' folder to cPanel"
```

---

**Last Updated**: January 2026
**Status**: ✅ Ready for Production
