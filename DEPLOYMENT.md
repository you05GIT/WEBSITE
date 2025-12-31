# Algerian Wholesale E-Commerce Platform
# Complete deployment checklist

## ✅ Pre-Deployment Checklist

### 1. Supabase Setup
- [ ] Create Supabase project
- [ ] Run supabase.sql file completely
- [ ] Create admin user in Authentication
- [ ] Add admin role to user_profiles table
- [ ] Test RLS policies
- [ ] Verify all 58 wilayas are inserted

### 2. Cloudinary Setup
- [ ] Create Cloudinary account
- [ ] Create unsigned upload preset: `wholesale_store`
- [ ] Set folder to: `wholesale-store`
- [ ] Note down cloud name, API key, API secret

### 3. Environment Variables
- [ ] Copy .env.example to .env.local
- [ ] Fill in all Supabase credentials
- [ ] Fill in all Cloudinary credentials
- [ ] Set NEXT_PUBLIC_APP_URL

### 4. Local Testing
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Test customer flow (browse → cart → checkout)
- [ ] Test admin login
- [ ] Test product creation with variants
- [ ] Test order management
- [ ] Test image uploads
- [ ] Test analytics dashboard

### 5. Vercel Deployment
- [ ] Push code to GitHub
- [ ] Connect repository to Vercel
- [ ] Add all environment variables in Vercel
- [ ] Deploy
- [ ] Update NEXT_PUBLIC_APP_URL with production URL
- [ ] Redeploy after URL update

## 🎯 Post-Deployment Tasks

### Initial Setup
1. Login to admin panel
2. Upload store logo
3. Customize store colors
4. Edit homepage content
5. Create categories
6. Add first products
7. Test complete order flow

### Testing Checklist
- [ ] Homepage loads correctly
- [ ] Products page works
- [ ] Cart system functional
- [ ] Checkout process works
- [ ] Order confirmation shows
- [ ] Admin dashboard displays data
- [ ] Order status updates work
- [ ] Analytics tracking working

## 📊 Database Verification

Run these queries in Supabase to verify:

```sql
-- Check wilayas
SELECT COUNT(*) FROM wilayas; -- Should be 58

-- Check store settings
SELECT * FROM store_settings;

-- Check home page content
SELECT * FROM home_page_content;

-- Check admin user
SELECT up.*, au.email 
FROM user_profiles up
JOIN auth.users au ON au.id = up.id
WHERE up.role = 'admin';
```

## 🔐 Security Checklist

- [ ] RLS enabled on all tables
- [ ] Admin routes protected
- [ ] Sensitive data not exposed in client
- [ ] Environment variables not committed
- [ ] CORS configured properly
- [ ] Rate limiting considered

## 📱 Features to Test

### Customer Features
- [ ] Homepage (dynamic content)
- [ ] Product listing with categories
- [ ] Product detail pages
- [ ] Products without variants
- [ ] Products with variants
- [ ] Add to cart (guest)
- [ ] Add to cart (logged in)
- [ ] Update cart quantities
- [ ] Remove from cart
- [ ] Checkout flow
- [ ] Wilaya selection & delivery price
- [ ] Order confirmation
- [ ] Order history
- [ ] User registration
- [ ] User login
- [ ] Cart merge on login

### Admin Features
- [ ] Admin login
- [ ] Dashboard analytics
- [ ] Revenue charts
- [ ] Best sellers view
- [ ] Revenue by wilaya
- [ ] Create category
- [ ] Edit category
- [ ] Create simple product
- [ ] Create product with variants
- [ ] Upload product images
- [ ] Edit product
- [ ] Toggle product status
- [ ] Delete product
- [ ] View orders
- [ ] Filter orders by status
- [ ] Update order status
- [ ] Stock decreases on confirmation
- [ ] Edit store settings
- [ ] Upload store logo
- [ ] Change theme colors
- [ ] Edit homepage content

## 🚨 Common Issues & Solutions

### Issue: Cart not saving
**Solution**: Check localStorage is enabled, verify Supabase connection

### Issue: Images not uploading
**Solution**: Verify Cloudinary preset is unsigned, check credentials

### Issue: Admin cannot login
**Solution**: Verify admin role in user_profiles table

### Issue: Orders not showing
**Solution**: Check RLS policies on orders table

### Issue: Analytics not tracking
**Solution**: Check analytics_events table, verify RLS policies

## 📦 Production Optimizations

- [ ] Enable caching in Vercel
- [ ] Optimize images (already using Next.js Image)
- [ ] Enable ISR where appropriate
- [ ] Set up monitoring (Vercel Analytics)
- [ ] Configure error tracking
- [ ] Set up backup strategy for Supabase
- [ ] Review and optimize database indexes

## 🎨 Customization Options

### Easy Changes
- Store name (admin panel)
- Store logo (admin panel)
- Theme colors (admin panel)
- Homepage text (admin panel)
- Delivery prices (Supabase)

### Code Changes Required
- Add new payment methods
- Add email notifications
- Add SMS notifications
- Add more analytics events
- Change language (currently Arabic)
- Add more wilaya-specific features

## 📞 Support & Maintenance

### Regular Tasks
- Monitor order status updates
- Check stock levels
- Review analytics weekly
- Update delivery prices seasonally
- Backup database monthly

### Emergency Contacts
- Supabase Support: https://supabase.com/support
- Cloudinary Support: https://cloudinary.com/support
- Vercel Support: https://vercel.com/support

---

## 🎉 Launch Checklist

Final steps before going live:

1. [ ] All tests passed
2. [ ] Admin credentials secured
3. [ ] Backup created
4. [ ] Domain configured (if using custom domain)
5. [ ] SSL certificate active
6. [ ] Analytics verified
7. [ ] Test order placed and processed
8. [ ] Team trained on admin panel
9. [ ] Customer support ready
10. [ ] Marketing materials prepared

**Ready to launch! 🚀**
