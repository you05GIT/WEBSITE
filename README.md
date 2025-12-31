# Algerian Wholesale E-Commerce Platform

A production-ready wholesale e-commerce platform built specifically for the Algerian market, featuring Arabic-first UI, complete cart system, analytics dashboard, and admin panel.

## 🚀 Features

### Public Website (Customer-Facing)
- **Dynamic Home Page**: Fully customizable from admin panel (Arabic-first)
- **Products Catalog**: Category-based filtering, product detail pages
- **Variant Support**: Products can have optional variants (color, size, type, etc.)
- **Full Cart System**: Works for both guests and logged-in users
- **Smart Cart Persistence**: Guest cart merges automatically on login
- **Checkout Process**: Complete order flow with COD payment
- **Order Tracking**: Users can view and track their orders
- **Wilaya Integration**: All 69 Algerian wilayas with configurable delivery prices

### Admin Panel
- **Comprehensive Dashboard**: Real-time analytics and insights
- **Product Management**: Create, edit, delete products and variants
- **Category Management**: Organize products by categories
- **Order Management**: View, update order status, track deliveries
- **Store Settings**: Customize store name, logo, theme colors
- **Home Page Editor**: Edit all homepage content dynamically
- **Image Uploads**: Cloudinary integration for image management
- **Delivery Configuration**: Manage delivery prices per wilaya

### Analytics System
- **Event Tracking**: Page views, product views, cart events, orders
- **Revenue Analytics**: Total revenue, revenue by wilaya, revenue by product
- **Best Sellers**: Track top-performing products
- **Conversion Funnel**: View → Cart → Order conversion tracking
- **Stock Alerts**: Low stock monitoring
- **Order Statistics**: Orders by status, delivery performance

## 🛠 Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Database & Auth**: Supabase (PostgreSQL + Row Level Security)
- **Image Management**: Cloudinary
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Deployment**: Vercel

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Cloudinary account
- Vercel account (for deployment)

### Step 1: Clone and Install

```bash
cd sultan
npm install
```

### Step 2: Set Up Supabase

1. Create a new project on [Supabase](https://supabase.com)
2. Go to SQL Editor and run the entire `supabase.sql` file
3. This will create:
   - All database tables
   - Row Level Security policies
   - Views for analytics
   - Triggers and functions
   - Initial data (wilayas, default settings)

### Step 3: Create Admin User

After running the SQL file:

1. Go to Supabase Dashboard → Authentication → Users
2. Create a new user (your admin account)
3. Copy the User ID
4. Run this SQL in Supabase SQL Editor:

```sql
INSERT INTO user_profiles (id, role, full_name)
VALUES ('YOUR_USER_ID_HERE', 'admin', 'Admin User')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### Step 4: Configure Cloudinary

1. Sign up at [Cloudinary](https://cloudinary.com)
2. Create an upload preset:
   - Go to Settings → Upload
   - Scroll to "Upload presets"
   - Click "Add upload preset"
   - Set preset name to: `wholesale_store`
   - Set signing mode to: "Unsigned"
   - Set folder to: `wholesale-store`
   - Save

### Step 5: Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 6: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Usage Guide

### For Admins

1. **Login**: Navigate to `/admin/login`
2. **Dashboard**: View analytics, revenue, best sellers
3. **Add Categories**: Go to Admin → Products → Manage Categories
4. **Add Products**: 
   - Click "Add New Product"
   - Choose category
   - Upload images via Cloudinary
   - For simple products: Set price and stock
   - For variants: Enable variants, add variant types and items
5. **Manage Orders**: 
   - View all orders
   - Update order status (pending → confirmed → delivered)
   - Stock automatically decreases on confirmation
6. **Customize Store**:
   - Go to Settings
   - Change store name, logo, colors
   - Edit homepage content
   - All changes reflect immediately

### For Customers

1. **Browse Products**: View products by category
2. **Add to Cart**: Select quantity (and variant if applicable)
3. **Checkout**: 
   - Enter delivery information
   - Select wilaya (delivery price auto-calculated)
   - Confirm order (COD only)
4. **Track Orders**: Login to view order history and status

## 🎨 Customization

### Theme Colors
Admin can change primary and secondary colors from Settings panel. Colors are applied via CSS variables.

### Homepage Content
All homepage text is editable from admin panel:
- Hero title
- Subtitle
- Description
- Call-to-action button text
- Section visibility

### Delivery Prices
Each of the 58 Algerian wilayas has a configurable delivery price. Update via Supabase dashboard or extend admin panel.

## 🔒 Security Features

- **Row Level Security (RLS)**: All tables have proper RLS policies
- **Separate Admin Auth**: Admin and customer authentication are separate
- **Role-Based Access**: Admin role enforced at database level
- **Protected Routes**: Admin routes check authentication and role
- **Input Validation**: Form validation on both client and server
- **SQL Injection Protection**: Supabase handles parameterized queries

## 📊 Database Schema Overview

### Core Tables
- `user_profiles`: Extended user data with roles
- `categories`: Product categories
- `products`: Products (with or without variants)
- `product_variants`: Variant types (e.g., "Color")
- `variant_items`: Sellable variant items (e.g., "Red", "Blue")
- `carts`: Shopping carts (guest + logged-in)
- `cart_items`: Items in carts
- `orders`: Customer orders
- `order_items`: Items in orders (snapshot)
- `wilayas`: 69 Algerian wilayas with delivery prices
- `store_settings`: Store configuration
- `home_page_content`: Homepage content
- `analytics_events`: All tracked events

### Views
- `analytics_daily_summary`: Daily statistics
- `best_selling_products`: Top products by revenue
- `revenue_by_wilaya`: Revenue breakdown by location
- `orders_by_status`: Order count by status

## 🚀 Deployment to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy
5. Update `NEXT_PUBLIC_APP_URL` with production URL

## 📱 Features Breakdown

### Cart System
- ✅ Guest cart (localStorage session)
- ✅ User cart (database persisted)
- ✅ Automatic merge on login
- ✅ Real-time stock checking
- ✅ Quantity management
- ✅ Price snapshots

### Variant System
- ✅ Optional variants per product
- ✅ Generic variant types (admin-defined)
- ✅ Multiple variant items per variant
- ✅ Individual pricing per item
- ✅ Individual stock per item
- ✅ Individual images per item

### Order Flow
1. Customer adds items to cart
2. Proceeds to checkout
3. Enters delivery details
4. Selects wilaya (price auto-calculated)
5. Confirms order (pending status)
6. Admin confirms order (stock decreases)
7. Order delivered
8. Analytics tracked at each step

### Analytics Events
- `page_view`: Track page visits
- `product_view`: Track product views
- `add_to_cart`: Track cart additions
- `cart_abandonment`: Track abandoned carts
- `checkout_started`: Track checkout initiations
- `order_placed`: Track completed orders
- `order_delivered`: Track successful deliveries

## 🔧 Troubleshooting

### Cart not persisting
- Check browser localStorage is enabled
- Verify Supabase connection
- Check RLS policies on carts table

### Images not uploading
- Verify Cloudinary credentials
- Check upload preset is "unsigned"
- Ensure folder name matches configuration

### Admin cannot login
- Verify user has 'admin' role in user_profiles table
- Check Supabase authentication is working
- Verify RLS policies

## 📝 Additional Notes

### Wilaya Codes
The system uses official Algerian wilaya codes (01-58) as per Algerian administrative divisions.

### COD Only
The platform is designed for Cash on Delivery only. Payment gateway integration can be added if needed.

### Arabic-First
The entire UI is in Arabic (RTL). French translations are stored in database for potential future use.

### Stock Management
Stock automatically decreases when admin confirms an order (changes status from pending to confirmed).

### Analytics Privacy
Analytics data is only visible to admins. Customer browsing data is never exposed publicly.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase logs
3. Check browser console for errors
4. Verify all environment variables are set

## 📄 License

This is a custom-built platform for wholesale business operations.

---

**Built with ❤️ for Algerian businesses**
