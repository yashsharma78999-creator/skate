# cPanel Production Deployment Guide

## 📋 Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Build Preparation](#build-preparation)
3. [cPanel Upload & Setup](#cpanel-upload--setup)
4. [Web Server Configuration](#web-server-configuration)
5. [SSL/HTTPS Setup](#sslhttps-setup)
6. [Performance Optimization](#performance-optimization)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## ✅ Pre-Deployment Checklist

Before deploying, verify:

- [ ] All code is tested locally
- [ ] Database migration is applied to production Supabase
- [ ] Admin account created in production
- [ ] Payment gateway credentials configured
- [ ] Sample products added
- [ ] Payment methods configured
- [ ] SSL certificate obtained
- [ ] Domain is set up
- [ ] Email configured for notifications
- [ ] Backup of current data taken

---

## 🔨 Build Preparation

### Step 1: Build the Project

```bash
# Navigate to project directory
cd /path/to/shopping-web

# Install dependencies (if not already done)
npm install

# Build for production
npm run build
```

**Expected Output:**
```
vite v5.4.19 building for production...
✓ 1234 modules transformed
dist/index.html                   0.50 kB
dist/assets/index-abc123.js       245.65 kB
dist/assets/index-def456.css      12.34 kB

✓ built in 2.34s
```

### Step 2: Verify Build Output

```bash
# Check if dist folder was created
ls -la dist/

# You should see:
# - index.html (main entry point)
# - assets/ folder (with JS and CSS files)
```

### Step 3: Test Build Locally

```bash
# Preview the production build locally
npm run preview

# Visit: http://localhost:4173
```

---

## 📤 cPanel Upload & Setup

### Step 1: Connect to Your Server

#### Using File Manager (Easiest)
1. Log in to cPanel
2. Go to **File Manager**
3. Navigate to **public_html** folder
4. Click **Upload** button

#### Using FTP/SFTP (Recommended for large deployments)
1. Get FTP credentials from cPanel → FTP Accounts
2. Use FileZilla, WinSCP, or similar
3. Connect to your server
4. Navigate to **public_html** folder

#### Using Terminal/SSH (Advanced)
```bash
# SSH into your server
ssh username@yourdomainname.com

# Navigate to public_html
cd public_html

# Install Node.js (if not installed)
# Contact hosting provider for Node.js installation
```

### Step 2: Upload the Build Files

#### Option A: Using cPanel File Manager
1. In your local computer, go to `dist` folder
2. Open cPanel → File Manager
3. Select all files from `dist` folder
4. Drag and drop into **public_html**
5. Wait for upload to complete

#### Option B: Using FTP
1. Connect via FTP client
2. Navigate to **public_html** folder
3. Upload all files from `dist` folder
4. Verify all files transferred

#### Option C: Using Git (Advanced)
```bash
# SSH into server
ssh username@yourdomainname.com
cd public_html

# Clone the repository
git clone https://github.com/yourrepo/shopping-web.git .

# Build on server
npm install
npm run build

# Copy build to public_html
cp -r dist/* ./
```

### Step 3: Set Up Production Environment Variables

#### Option A: Using cPanel
1. Go to cPanel → **File Manager**
2. In **public_html** root, create `.env.production`
3. Add your production credentials:

```env
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_PAYU_KEY=your-production-payu-key
VITE_PAYU_SALT=your-production-payu-salt
```

#### Option B: Using FTP
1. Create `.env.production` file on local machine
2. Upload to **public_html** root via FTP

**⚠️ IMPORTANT**: 
- Never commit `.env` files to Git
- Change all keys to production values
- Protect file permissions (644 or 600)

### Step 4: Configure File Permissions

```bash
# SSH into server
ssh username@yourdomainname.com
cd public_html

# Set proper permissions
chmod 644 .env.production    # Read-only config
chmod 755 .                  # Directory readable
chmod 644 *.html             # HTML files
chmod 755 assets/            # Assets directory
```

---

## 🌐 Web Server Configuration

### Step 1: Check Server Type

In cPanel, check **Software & Services** → **Apache/Nginx version**

### Step 2: Configure Apache (.htaccess)

Create a `.htaccess` file in **public_html**:

```apache
# Enable mod_rewrite
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Remove .html extension from URLs
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ index.html [QSA,L]

  # Redirect HTTP to HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE text/javascript
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache control
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

Save as `.htaccess` in **public_html** root.

### Step 3: Configure Nginx (if applicable)

If your server uses Nginx, create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /home/username/public_html;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript 
               application/xml application/rss+xml application/javascript;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    root /home/username/public_html;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Route all requests to index.html for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

Contact your hosting provider to implement Nginx configuration.

---

## 🔒 SSL/HTTPS Setup

### Step 1: Install SSL Certificate

#### Option A: Using cPanel AutoSSL (Recommended)
1. Go to cPanel → **AutoSSL**
2. Select your domain
3. Click **Install Certificate**
4. Wait for installation (usually instant)

#### Option B: Using Let's Encrypt
1. Go to cPanel → **AutoSSL**
2. Click **Check & Install**
3. Select Let's Encrypt
4. Allow automatic renewal

#### Option C: Using Your Own Certificate
1. Go to cPanel → **SSL/TLS**
2. Click **Upload Certificate**
3. Paste certificate and key
4. Click **Upload**

### Step 2: Force HTTPS

In `.htaccess`, add:
```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Step 3: Verify SSL Installation

Visit: https://www.ssllabs.com/ssltest/
- Enter your domain
- Should show Grade A or A+

---

## ⚡ Performance Optimization

### Step 1: Enable Caching

Update `.htaccess`:
```apache
# Browser caching
<FilesMatch "\.js$">
  Header set Cache-Control "max-age=31536000, public"
</FilesMatch>
<FilesMatch "\.css$">
  Header set Cache-Control "max-age=31536000, public"
</FilesMatch>
<FilesMatch "\.(jpg|jpeg|png|gif)$">
  Header set Cache-Control "max-age=31536000, public"
</FilesMatch>
```

### Step 2: Enable CDN

For static assets (optional):
1. Go to cPanel → **CloudFlare** (if available)
2. Enable Cloudflare integration
3. Set DNS to Cloudflare nameservers

### Step 3: Optimize Images

Before deployment:
```bash
# Ensure images in dist/assets are optimized
# Use tools like ImageOptim, TinyPNG, or similar
```

### Step 4: Monitor Performance

Use tools to check performance:
- https://gtmetrix.com
- https://www.webpagetest.org
- https://pagespeed.web.dev

---

## 🔍 Monitoring & Maintenance

### Step 1: Set Up Error Logging

In cPanel:
1. Go to **Error Log**
2. Monitor for errors
3. Check daily for issues

### Step 2: Database Backups

#### Set up automatic backups in Supabase:
1. Go to your Supabase project
2. Click **Backups** (if available)
3. Enable automatic backups
4. Set frequency (daily recommended)

#### Manual backup:
```sql
-- In Supabase SQL Editor, export data:
-- Go to Table Editor → Select table → Export
```

### Step 3: Monitor Website Health

```bash
# Check if site is online
curl -I https://yourdomain.com

# Should return: HTTP/2 200 (or HTTP/1.1 200)
```

### Step 4: Regular Maintenance

**Daily:**
- Check error logs
- Monitor order flow
- Verify payment processing

**Weekly:**
- Check server resources usage
- Verify database backups
- Test admin login

**Monthly:**
- Review analytics
- Update products
- Check SSL certificate expiry
- Review security

---

## 🚀 Go-Live Checklist

Before making site public:

- [ ] All files uploaded to public_html
- [ ] .env.production configured
- [ ] SSL certificate installed
- [ ] HTTPS redirect working
- [ ] Admin login working
- [ ] Products displaying correctly
- [ ] Payment methods showing
- [ ] Checkout functional
- [ ] Database backups enabled
- [ ] Email notifications configured
- [ ] 404 page working (shows your site, not server error)
- [ ] Robots.txt updated (if needed)
- [ ] Sitemap.xml created (optional)
- [ ] Google Search Console linked
- [ ] Analytics configured
- [ ] Security headers set

---

## 🆘 Troubleshooting

### Issue: "404 Not Found"
**Solution:**
1. Verify all files are uploaded to public_html
2. Check .htaccess configuration
3. Enable mod_rewrite in cPanel
4. Check file permissions

### Issue: "Website not loading"
**Solution:**
1. Check public_html/index.html exists
2. Verify domain DNS points to server
3. Check internet connection
4. Clear browser cache

### Issue: "Payment method not showing"
**Solution:**
1. Check payment_options table in Supabase
2. Verify records have is_enabled = true
3. Check Supabase credentials in .env.production
4. Restart by clearing browser cache

### Issue: "Database connection error"
**Solution:**
1. Verify VITE_SUPABASE_URL is correct
2. Check VITE_SUPABASE_ANON_KEY
3. Test Supabase connection (curl test)
4. Check internet connectivity

### Issue: "SSL not working"
**Solution:**
1. Go to cPanel → SSL/TLS
2. Install certificate if missing
3. Check certificate is valid (not expired)
4. Wait 24 hours for DNS propagation

### Issue: "Slow loading"
**Solution:**
1. Enable compression in .htaccess
2. Enable caching headers
3. Optimize images
4. Use CDN (Cloudflare)
5. Check server resources in cPanel

---

## 📊 Performance Metrics

### Target Metrics:
- **Page Load Time**: < 3 seconds
- **TTFB** (Time to First Byte): < 600ms
- **Lighthouse Score**: > 80
- **SSL Grade**: A or A+

### Check Performance:
1. Visit: https://pagespeed.web.dev
2. Enter your domain
3. Note recommendations
4. Implement improvements

---

## 🔐 Security Checklist

- [ ] HTTPS enabled
- [ ] .env.production not publicly accessible
- [ ] Sensitive files hidden (`.git`, `node_modules`)
- [ ] SSH access secured
- [ ] Strong FTP passwords
- [ ] Regular backups enabled
- [ ] Security headers configured
- [ ] WAF (Web Application Firewall) enabled (optional)
- [ ] DDoS protection enabled (optional)

---

## 📞 Support & Help

### Common Issues Resolution:

**"My site shows error page"**
- Check cPanel error logs
- Verify .htaccess syntax
- Check file permissions
- Restart Apache/Nginx

**"Payment gateway not connecting"**
- Verify credentials in .env.production
- Check Supabase online
- Test API connectivity

**"Admin cannot log in"**
- Verify admin profile in Supabase
- Check role = 'admin'
- Clear browser cookies

**"Products not displaying"**
- Check is_active = true
- Verify images URLs
- Check RLS policies

---

## 🎉 Deployment Complete!

Your e-commerce platform is now live!

### Next Steps:
1. ✅ Monitor website performance
2. ✅ Test all features in production
3. ✅ Train team members
4. ✅ Start taking orders
5. ✅ Track analytics

### Monitor & Iterate:
- Week 1: Daily checks
- Week 2-4: 3x weekly checks
- Month 2+: Weekly checks
- Ongoing: Monthly optimization

---

## 📞 Emergency Contacts

Keep these handy:

- **Hosting Support**: [Your host support email/phone]
- **Domain Registrar**: [Your domain registrar]
- **Supabase Support**: support@supabase.com
- **Payment Gateway Support**: [Your payment provider]

---

**Congratulations! Your site is live! 🚀**

For questions or issues, refer to cPanel documentation or contact your hosting provider.
