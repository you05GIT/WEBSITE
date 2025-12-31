-- ============================================
-- ALGERIAN WHOLESALE E-COMMERCE PLATFORM
-- Complete Database Schema with RLS
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'delivered', 'canceled');
CREATE TYPE analytics_event_type AS ENUM (
  'page_view',
  'product_view',
  'add_to_cart',
  'cart_abandonment',
  'checkout_started',
  'order_placed',
  'order_delivered'
);

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

-- Extend Supabase auth.users with custom profiles
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'customer',
  full_name TEXT,
  phone_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- Admins table (separate from regular users)
CREATE TABLE public.admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_is_active ON admins(is_active);

-- ============================================
-- STORE SETTINGS
-- ============================================

CREATE TABLE public.store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_name TEXT NOT NULL,
  store_logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#3B82F6',
  secondary_color TEXT NOT NULL DEFAULT '#10B981',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default settings
INSERT INTO store_settings (store_name, primary_color, secondary_color)
VALUES ('متجر الجملة', '#3B82F6', '#10B981');

-- Home page content (fully editable)
CREATE TABLE public.home_page_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hero_title TEXT NOT NULL,
  hero_subtitle TEXT NOT NULL,
  hero_description TEXT NOT NULL,
  cta_text TEXT NOT NULL,
  section_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default Arabic content
INSERT INTO home_page_content (hero_title, hero_subtitle, hero_description, cta_text)
VALUES (
  'مرحبا بكم في متجر الجملة',
  'نبيع إكسسوارات الهواتف بالجملة',
  'نحن متخصصون في بيع جميع أنواع إكسسوارات الهواتف بأسعار الجملة في جميع ولايات الجزائر',
  'تسوق الآن'
);

-- ============================================
-- WILAYAS & DELIVERY
-- ============================================

CREATE TABLE public.wilayas (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  delivery_price DECIMAL(10, 2) NOT NULL DEFAULT 500.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wilayas_code ON wilayas(code);

-- Insert all 69 Algerian wilayas
INSERT INTO wilayas (code, name_ar, name_fr, delivery_price) VALUES
('01', 'أدرار', 'Adrar', 800.00),
('02', 'الشلف', 'Chlef', 500.00),
('03', 'الأغواط', 'Laghouat', 600.00),
('04', 'أم البواقي', 'Oum El Bouaghi', 500.00),
('05', 'باتنة', 'Batna', 500.00),
('06', 'بجاية', 'Béjaïa', 500.00),
('07', 'بسكرة', 'Biskra', 600.00),
('08', 'بشار', 'Béchar', 900.00),
('09', 'البليدة', 'Blida', 400.00),
('10', 'البويرة', 'Bouira', 500.00),
('11', 'تمنراست', 'Tamanrasset', 1200.00),
('12', 'تبسة', 'Tébessa', 600.00),
('13', 'تلمسان', 'Tlemcen', 600.00),
('14', 'تيارت', 'Tiaret', 600.00),
('15', 'تيزي وزو', 'Tizi Ouzou', 500.00),
('16', 'الجزائر', 'Alger', 300.00),
('17', 'الجلفة', 'Djelfa', 600.00),
('18', 'جيجل', 'Jijel', 500.00),
('19', 'سطيف', 'Sétif', 500.00),
('20', 'سعيدة', 'Saïda', 600.00),
('21', 'سكيكدة', 'Skikda', 500.00),
('22', 'سيدي بلعباس', 'Sidi Bel Abbès', 600.00),
('23', 'عنابة', 'Annaba', 500.00),
('24', 'قالمة', 'Guelma', 500.00),
('25', 'قسنطينة', 'Constantine', 500.00),
('26', 'المدية', 'Médéa', 500.00),
('27', 'مستغانم', 'Mostaganem', 500.00),
('28', 'المسيلة', 'M\'Sila', 600.00),
('29', 'معسكر', 'Mascara', 600.00),
('30', 'ورقلة', 'Ouargla', 700.00),
('31', 'وهران', 'Oran', 500.00),
('32', 'البيض', 'El Bayadh', 700.00),
('33', 'إليزي', 'Illizi', 1200.00),
('34', 'برج بوعريريج', 'Bordj Bou Arréridj', 500.00),
('35', 'بومرداس', 'Boumerdès', 400.00),
('36', 'الطارف', 'El Tarf', 600.00),
('37', 'تندوف', 'Tindouf', 1200.00),
('38', 'تيسمسيلت', 'Tissemsilt', 600.00),
('39', 'الوادي', 'El Oued', 700.00),
('40', 'خنشلة', 'Khenchela', 600.00),
('41', 'سوق أهراس', 'Souk Ahras', 600.00),
('42', 'تيبازة', 'Tipaza', 400.00),
('43', 'ميلة', 'Mila', 500.00),
('44', 'عين الدفلى', 'Aïn Defla', 500.00),
('45', 'النعامة', 'Naâma', 800.00),
('46', 'عين تموشنت', 'Aïn Témouchent', 600.00),
('47', 'غرداية', 'Ghardaïa', 700.00),
('48', 'غليزان', 'Relizane', 600.00),
('49', 'تيميمون', 'Timimoun', 900.00),
('50', 'برج باجي مختار', 'Bordj Badji Mokhtar', 1200.00),
('51', 'أولاد جلال', 'Ouled Djellal', 700.00),
('52', 'بني عباس', 'Béni Abbès', 900.00),
('53', 'عين صالح', 'In Salah', 1000.00),
('54', 'عين قزام', 'In Guezzam', 1200.00),
('55', 'تقرت', 'Touggourt', 700.00),
('56', 'جانت', 'Djanet', 1200.00),
('57', 'المغير', 'El M\'Ghair', 700.00),
('58', 'المنيعة', 'El Meniaa', 800.00);

-- ============================================
-- CATEGORIES & PRODUCTS
-- ============================================

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar TEXT NOT NULL,
  name_fr TEXT,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_categories_display_order ON categories(display_order);

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL,
  name_fr TEXT,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  has_variants BOOLEAN NOT NULL DEFAULT false,
  -- For products WITHOUT variants
  price DECIMAL(10, 2),
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_has_variants ON products(has_variants);

-- Variants (optional, generic: color, size, type, model, etc.)
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL, -- e.g., "اللون", "الحجم", "النوع"
  name_fr TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);

-- Sellable items (variant options)
CREATE TABLE public.variant_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL, -- e.g., "أحمر", "كبير", "نوع A"
  name_fr TEXT,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  sku TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_variant_items_variant_id ON variant_items(variant_id);
CREATE INDEX idx_variant_items_is_active ON variant_items(is_active);
CREATE INDEX idx_variant_items_sku ON variant_items(sku);

-- ============================================
-- CART SYSTEM
-- ============================================

CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- For guest carts
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cart_user_or_session CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR
    (user_id IS NULL AND session_id IS NOT NULL)
  )
);

CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_carts_session_id ON carts(session_id);

CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_item_id UUID REFERENCES variant_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL, -- Snapshot price at time of adding
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX idx_cart_items_variant_item_id ON cart_items(variant_item_id);

-- ============================================
-- ORDERS
-- ============================================

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Customer info
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  -- Delivery info
  wilaya_id INTEGER NOT NULL REFERENCES wilayas(id),
  commune TEXT NOT NULL,
  address TEXT NOT NULL,
  delivery_price DECIMAL(10, 2) NOT NULL,
  -- Order details
  subtotal DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_wilaya_id ON orders(wilaya_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_order_number ON orders(order_number);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_item_id UUID REFERENCES variant_items(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL, -- Snapshot
  variant_name TEXT, -- Snapshot
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ============================================
-- ANALYTICS SYSTEM
-- ============================================

-- Analytics events tracking
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type analytics_event_type NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_item_id UUID REFERENCES variant_items(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_product_id ON analytics_events(product_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);

-- Immutable function to extract date from timestamp
CREATE OR REPLACE FUNCTION immutable_date(timestamp with time zone)
RETURNS date AS $$
  SELECT $1::date;
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE;

-- Aggregated analytics views
CREATE VIEW analytics_daily_summary AS
SELECT
  immutable_date(created_at) as date,
  COUNT(*) FILTER (WHERE event_type = 'order_placed') as orders_count,
  COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'order_placed') as unique_customers,
  COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views,
  COUNT(*) FILTER (WHERE event_type = 'product_view') as product_views,
  COUNT(*) FILTER (WHERE event_type = 'add_to_cart') as add_to_cart_count,
  COUNT(*) FILTER (WHERE event_type = 'checkout_started') as checkout_started_count
FROM analytics_events
GROUP BY immutable_date(created_at)
ORDER BY date DESC;

CREATE VIEW best_selling_products AS
SELECT
  p.id,
  p.name_ar,
  p.name_fr,
  COUNT(oi.id) as times_sold,
  SUM(oi.quantity) as total_quantity_sold,
  SUM(oi.total_price) as total_revenue
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.status != 'canceled'
GROUP BY p.id, p.name_ar, p.name_fr
ORDER BY total_revenue DESC;

CREATE VIEW revenue_by_wilaya AS
SELECT
  w.name_ar as wilaya_name,
  w.code as wilaya_code,
  COUNT(o.id) as order_count,
  SUM(o.total) as total_revenue
FROM wilayas w
JOIN orders o ON w.id = o.wilaya_id
WHERE o.status != 'canceled'
GROUP BY w.id, w.name_ar, w.code
ORDER BY total_revenue DESC;

CREATE VIEW orders_by_status AS
SELECT
  status,
  COUNT(*) as count,
  SUM(total) as total_amount
FROM orders
GROUP BY status;

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_order_number TEXT;
  order_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO order_count FROM orders;
  new_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((order_count + 1)::TEXT, 5, '0');
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION set_order_number();

-- Function to update stock on order confirmation
CREATE OR REPLACE FUNCTION update_stock_on_order_confirm()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    -- Update stock for each order item
    UPDATE products p
    SET stock_quantity = stock_quantity - oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id
      AND oi.product_id = p.id
      AND oi.variant_item_id IS NULL
      AND p.has_variants = false;
    
    -- Update stock for variant items
    UPDATE variant_items vi
    SET stock_quantity = stock_quantity - oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id
      AND oi.variant_item_id = vi.id;
    
    -- Set confirmed timestamp
    NEW.confirmed_at := NOW();
  END IF;
  
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    NEW.delivered_at := NOW();
  END IF;
  
  IF NEW.status = 'canceled' AND OLD.status != 'canceled' THEN
    NEW.canceled_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_on_order_confirm
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_stock_on_order_confirm();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_settings_updated_at BEFORE UPDATE ON store_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_home_page_content_updated_at BEFORE UPDATE ON home_page_content
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wilayas_updated_at BEFORE UPDATE ON wilayas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_variant_items_updated_at BEFORE UPDATE ON variant_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE wilayas ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - PUBLIC READ ACCESS
-- ============================================

-- Store settings (public read)
CREATE POLICY "Store settings are viewable by everyone"
ON store_settings FOR SELECT
USING (true);

CREATE POLICY "Store settings updatable by admins only"
ON store_settings FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.id = auth.uid()
  AND user_profiles.role = 'admin'
));

-- Home page content (public read)
CREATE POLICY "Home page content viewable by everyone"
ON home_page_content FOR SELECT
USING (true);

CREATE POLICY "Home page content updatable by admins only"
ON home_page_content FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.id = auth.uid()
  AND user_profiles.role = 'admin'
));

-- Wilayas (public read)
CREATE POLICY "Wilayas viewable by everyone"
ON wilayas FOR SELECT
USING (true);

CREATE POLICY "Wilayas manageable by admins only"
ON wilayas FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.id = auth.uid()
  AND user_profiles.role = 'admin'
));

-- Categories (public read active)
CREATE POLICY "Active categories viewable by everyone"
ON categories FOR SELECT
USING (is_active = true OR EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.id = auth.uid()
  AND user_profiles.role = 'admin'
));

CREATE POLICY "Categories manageable by admins only"
ON categories FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.id = auth.uid()
  AND user_profiles.role = 'admin'
));

-- Products (public read active)
CREATE POLICY "Active products viewable by everyone"
ON products FOR SELECT
USING (is_active = true OR EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.id = auth.uid()
  AND user_profiles.role = 'admin'
));

CREATE POLICY "Products manageable by admins only"
ON products FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.id = auth.uid()
  AND user_profiles.role = 'admin'
));

-- Product variants (public read)
CREATE POLICY "Product variants viewable by everyone"
ON product_variants FOR SELECT
USING (true);

CREATE POLICY "Product variants manageable by admins only"
ON product_variants FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.id = auth.uid()
  AND user_profiles.role = 'admin'
));

-- Variant items (public read active)
CREATE POLICY "Active variant items viewable by everyone"
ON variant_items FOR SELECT
USING (is_active = true OR EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.id = auth.uid()
  AND user_profiles.role = 'admin'
));

CREATE POLICY "Variant items manageable by admins only"
ON variant_items FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.id = auth.uid()
  AND user_profiles.role = 'admin'
));

-- ============================================
-- RLS POLICIES - CARTS
-- ============================================

CREATE POLICY "Users can view their own carts"
ON carts FOR SELECT
USING (
  user_id = auth.uid() OR
  session_id IS NOT NULL
);

CREATE POLICY "Users can insert their own carts"
ON carts FOR INSERT
WITH CHECK (
  user_id = auth.uid() OR
  session_id IS NOT NULL
);

CREATE POLICY "Users can update their own carts"
ON carts FOR UPDATE
USING (
  user_id = auth.uid() OR
  session_id IS NOT NULL
);

CREATE POLICY "Users can delete their own carts"
ON carts FOR DELETE
USING (
  user_id = auth.uid() OR
  session_id IS NOT NULL
);

-- Cart items
CREATE POLICY "Users can view their own cart items"
ON cart_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM carts
    WHERE carts.id = cart_items.cart_id
    AND (carts.user_id = auth.uid() OR carts.session_id IS NOT NULL)
  )
);

CREATE POLICY "Users can manage their own cart items"
ON cart_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM carts
    WHERE carts.id = cart_items.cart_id
    AND (carts.user_id = auth.uid() OR carts.session_id IS NOT NULL)
  )
);

-- ============================================
-- RLS POLICIES - ORDERS
-- ============================================

CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

CREATE POLICY "Anyone can create orders"
ON orders FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update orders"
ON orders FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.id = auth.uid()
  AND user_profiles.role = 'admin'
));

-- Order items
CREATE POLICY "Users can view their order items"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    ))
  )
);

CREATE POLICY "Anyone can insert order items"
ON order_items FOR INSERT
WITH CHECK (true);

-- ============================================
-- RLS POLICIES - ANALYTICS
-- ============================================

CREATE POLICY "Anyone can insert analytics events"
ON analytics_events FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all analytics"
ON analytics_events FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.id = auth.uid()
  AND user_profiles.role = 'admin'
));

-- ============================================
-- RLS POLICIES - USER PROFILES
-- ============================================

CREATE POLICY "Users can view their own profile"
ON user_profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON user_profiles FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON user_profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- ============================================
-- RLS POLICIES - ADMINS
-- ============================================

CREATE POLICY "Admins can view admin records"
ON admins FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.id = auth.uid()
  AND user_profiles.role = 'admin'
));

-- ============================================
-- HELPER FUNCTIONS FOR APPLICATION
-- ============================================

-- Function to merge guest cart into user cart
CREATE OR REPLACE FUNCTION merge_guest_cart_to_user(
  p_session_id TEXT,
  p_user_id UUID
)
RETURNS void AS $$
DECLARE
  guest_cart_id UUID;
  user_cart_id UUID;
BEGIN
  -- Get guest cart
  SELECT id INTO guest_cart_id
  FROM carts
  WHERE session_id = p_session_id;
  
  IF guest_cart_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Get or create user cart
  SELECT id INTO user_cart_id
  FROM carts
  WHERE user_id = p_user_id;
  
  IF user_cart_id IS NULL THEN
    INSERT INTO carts (user_id)
    VALUES (p_user_id)
    RETURNING id INTO user_cart_id;
  END IF;
  
  -- Move cart items from guest cart to user cart
  UPDATE cart_items
  SET cart_id = user_cart_id
  WHERE cart_id = guest_cart_id;
  
  -- Delete guest cart
  DELETE FROM carts WHERE id = guest_cart_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_analytics_events_created_at_date ON analytics_events(immutable_date(created_at));
CREATE INDEX idx_orders_created_at_date ON orders(immutable_date(created_at));
CREATE INDEX idx_order_items_product_variant ON order_items(product_id, variant_item_id);

-- ============================================
-- INITIAL ADMIN USER
-- ============================================

-- Create initial admin user profile
-- Note: You need to create the auth user first through Supabase Auth UI
-- Then run this to set the role:
-- INSERT INTO user_profiles (id, role, full_name)
-- VALUES ('YOUR_AUTH_USER_ID', 'admin', 'Admin User')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE user_profiles IS 'Extended user profiles linked to Supabase auth.users';
COMMENT ON TABLE admins IS 'Separate admin authentication table (not using auth.users)';
COMMENT ON TABLE store_settings IS 'Global store configuration (name, logo, colors)';
COMMENT ON TABLE home_page_content IS 'Fully editable home page content';
COMMENT ON TABLE wilayas IS 'All 69 Algerian wilayas with delivery pricing';
COMMENT ON TABLE categories IS 'Product categories';
COMMENT ON TABLE products IS 'Products - can have variants or be standalone';
COMMENT ON TABLE product_variants IS 'Generic variant types (color, size, etc.) - optional';
COMMENT ON TABLE variant_items IS 'Actual sellable variant items with price/stock';
COMMENT ON TABLE carts IS 'Shopping carts for both guests and logged-in users';
COMMENT ON TABLE cart_items IS 'Items in shopping carts';
COMMENT ON TABLE orders IS 'Customer orders with delivery information';
COMMENT ON TABLE order_items IS 'Items within orders (snapshot of product data)';
COMMENT ON TABLE analytics_events IS 'All tracked analytics events';

-- ============================================
-- END OF SCHEMA
-- ============================================
