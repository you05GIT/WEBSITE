-- ============================================
-- MULTI-LANGUAGE SUPPORT (FRENCH / ARABIC)
-- Additive-Only Schema Changes
-- ============================================
-- This file contains ONLY new tables and columns
-- NO destructive operations (DROP, RENAME, etc.)
-- Safe to run multiple times (idempotent)
-- ============================================

-- Enable necessary extensions (safe if already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TRANSLATION TABLES
-- ============================================

-- Generic site translations (UI labels, buttons, messages)
CREATE TABLE IF NOT EXISTS public.site_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL,
  language_code TEXT NOT NULL CHECK (language_code IN ('fr', 'ar')),
  value TEXT NOT NULL,
  category TEXT, -- e.g., 'navigation', 'buttons', 'messages'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(key, language_code)
);

CREATE INDEX IF NOT EXISTS idx_site_translations_key ON site_translations(key);
CREATE INDEX IF NOT EXISTS idx_site_translations_language ON site_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_site_translations_category ON site_translations(category);

COMMENT ON TABLE site_translations IS 'Translations for UI labels, buttons, and static text';

-- Product translations
CREATE TABLE IF NOT EXISTS public.product_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL CHECK (language_code IN ('fr', 'ar')),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, language_code)
);

CREATE INDEX IF NOT EXISTS idx_product_translations_product_id ON product_translations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_translations_language ON product_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_product_translations_lookup ON product_translations(product_id, language_code);

COMMENT ON TABLE product_translations IS 'Multi-language translations for product names and descriptions';

-- Category translations
CREATE TABLE IF NOT EXISTS public.category_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL CHECK (language_code IN ('fr', 'ar')),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(category_id, language_code)
);

CREATE INDEX IF NOT EXISTS idx_category_translations_category_id ON category_translations(category_id);
CREATE INDEX IF NOT EXISTS idx_category_translations_language ON category_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_category_translations_lookup ON category_translations(category_id, language_code);

COMMENT ON TABLE category_translations IS 'Multi-language translations for category names and descriptions';

-- Home page content translations
CREATE TABLE IF NOT EXISTS public.home_page_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  language_code TEXT NOT NULL CHECK (language_code IN ('fr', 'ar')),
  hero_title TEXT NOT NULL,
  hero_subtitle TEXT NOT NULL,
  hero_description TEXT NOT NULL,
  cta_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(language_code)
);

CREATE INDEX IF NOT EXISTS idx_home_page_translations_language ON home_page_translations(language_code);

COMMENT ON TABLE home_page_translations IS 'Multi-language translations for home page hero section';

-- Product variant translations
CREATE TABLE IF NOT EXISTS public.product_variant_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL CHECK (language_code IN ('fr', 'ar')),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(variant_id, language_code)
);

CREATE INDEX IF NOT EXISTS idx_product_variant_translations_variant_id ON product_variant_translations(variant_id);
CREATE INDEX IF NOT EXISTS idx_product_variant_translations_language ON product_variant_translations(language_code);

COMMENT ON TABLE product_variant_translations IS 'Multi-language translations for product variant names';

-- Variant item translations
CREATE TABLE IF NOT EXISTS public.variant_item_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_item_id UUID NOT NULL REFERENCES variant_items(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL CHECK (language_code IN ('fr', 'ar')),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(variant_item_id, language_code)
);

CREATE INDEX IF NOT EXISTS idx_variant_item_translations_item_id ON variant_item_translations(variant_item_id);
CREATE INDEX IF NOT EXISTS idx_variant_item_translations_language ON variant_item_translations(language_code);

COMMENT ON TABLE variant_item_translations IS 'Multi-language translations for variant item names and descriptions';

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================

-- Create trigger function if it doesn't exist (safe to re-run)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to translation tables
DROP TRIGGER IF EXISTS update_site_translations_updated_at ON site_translations;
CREATE TRIGGER update_site_translations_updated_at
BEFORE UPDATE ON site_translations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_translations_updated_at ON product_translations;
CREATE TRIGGER update_product_translations_updated_at
BEFORE UPDATE ON product_translations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_category_translations_updated_at ON category_translations;
CREATE TRIGGER update_category_translations_updated_at
BEFORE UPDATE ON category_translations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_home_page_translations_updated_at ON home_page_translations;
CREATE TRIGGER update_home_page_translations_updated_at
BEFORE UPDATE ON home_page_translations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_variant_translations_updated_at ON product_variant_translations;
CREATE TRIGGER update_product_variant_translations_updated_at
BEFORE UPDATE ON product_variant_translations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_variant_item_translations_updated_at ON variant_item_translations;
CREATE TRIGGER update_variant_item_translations_updated_at
BEFORE UPDATE ON variant_item_translations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on translation tables
ALTER TABLE site_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_page_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variant_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_item_translations ENABLE ROW LEVEL SECURITY;

-- Public read access for all translations
CREATE POLICY IF NOT EXISTS "Site translations viewable by everyone"
ON site_translations FOR SELECT
USING (true);

CREATE POLICY IF NOT EXISTS "Site translations manageable by admins only"
ON site_translations FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.id = auth.uid()
  AND user_profiles.role = 'admin'
));

CREATE POLICY IF NOT EXISTS "Product translations viewable by everyone"
ON product_translations FOR SELECT
USING (true);

CREATE POLICY IF NOT EXISTS "Product translations manageable by admins only"
ON product_translations FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.id = auth.uid()
  AND user_profiles.role = 'admin'
));

CREATE POLICY IF NOT EXISTS "Category translations viewable by everyone"
ON category_translations FOR SELECT
USING (true);

CREATE POLICY IF NOT EXISTS "Category translations manageable by admins only"
ON category_translations FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.id = auth.uid()
  AND user_profiles.role = 'admin'
));

CREATE POLICY IF NOT EXISTS "Home page translations viewable by everyone"
ON home_page_translations FOR SELECT
USING (true);

CREATE POLICY IF NOT EXISTS "Home page translations manageable by admins only"
ON home_page_translations FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.id = auth.uid()
  AND user_profiles.role = 'admin'
));

CREATE POLICY IF NOT EXISTS "Product variant translations viewable by everyone"
ON product_variant_translations FOR SELECT
USING (true);

CREATE POLICY IF NOT EXISTS "Product variant translations manageable by admins only"
ON product_variant_translations FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.id = auth.uid()
  AND user_profiles.role = 'admin'
));

CREATE POLICY IF NOT EXISTS "Variant item translations viewable by everyone"
ON variant_item_translations FOR SELECT
USING (true);

CREATE POLICY IF NOT EXISTS "Variant item translations manageable by admins only"
ON variant_item_translations FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.id = auth.uid()
  AND user_profiles.role = 'admin'
));

-- ============================================
-- SEED DATA - COMMON UI TRANSLATIONS
-- ============================================

-- Insert common French translations (only if they don't exist)
INSERT INTO site_translations (key, language_code, value, category) VALUES
  -- Navigation
  ('nav.home', 'fr', 'Accueil', 'navigation'),
  ('nav.products', 'fr', 'Produits', 'navigation'),
  ('nav.my_orders', 'fr', 'Mes Commandes', 'navigation'),
  ('nav.cart', 'fr', 'Panier', 'navigation'),
  ('nav.account', 'fr', 'Mon Compte', 'navigation'),
  
  -- Buttons
  ('button.shop_now', 'fr', 'Acheter Maintenant', 'buttons'),
  ('button.add_to_cart', 'fr', 'Ajouter au Panier', 'buttons'),
  ('button.view_cart', 'fr', 'Voir le Panier', 'buttons'),
  ('button.checkout', 'fr', 'Commander', 'buttons'),
  ('button.login', 'fr', 'Connexion', 'buttons'),
  ('button.signup', 'fr', 'Inscription', 'buttons'),
  ('button.logout', 'fr', 'Déconnexion', 'buttons'),
  
  -- Messages
  ('message.loading', 'fr', 'Chargement...', 'messages'),
  ('message.no_products', 'fr', 'Aucun produit trouvé', 'messages'),
  ('message.cart_empty', 'fr', 'Votre panier est vide', 'messages'),
  ('message.success', 'fr', 'Succès!', 'messages'),
  ('message.error', 'fr', 'Erreur', 'messages'),
  
  -- Product page
  ('product.all_products', 'fr', 'Tous les Produits', 'products'),
  ('product.categories', 'fr', 'Catégories', 'products'),
  ('product.price', 'fr', 'Prix', 'products'),
  ('product.stock', 'fr', 'Stock', 'products'),
  ('product.in_stock', 'fr', 'En Stock', 'products'),
  ('product.out_of_stock', 'fr', 'Rupture de Stock', 'products'),
  
  -- Home page features
  ('feature.wholesale_prices', 'fr', 'Prix de Gros', 'features'),
  ('feature.wholesale_prices_desc', 'fr', 'Les meilleurs prix pour les achats en gros', 'features'),
  ('feature.delivery', 'fr', 'Livraison dans Toutes les Wilayas', 'features'),
  ('feature.delivery_desc', 'fr', 'Nous livrons dans toutes les 58 wilayas d''Algérie', 'features'),
  ('feature.quality', 'fr', 'Qualité Garantie', 'features'),
  ('feature.quality_desc', 'fr', 'Produits de haute qualité et garantis', 'features'),
  
  -- Call to action
  ('cta.start_shopping', 'fr', 'Commencez à Acheter Maintenant', 'cta'),
  ('cta.discover_collection', 'fr', 'Découvrez notre large gamme d''accessoires pour téléphones', 'cta'),
  ('cta.view_products', 'fr', 'Voir les Produits', 'cta')
ON CONFLICT (key, language_code) DO NOTHING;

-- Insert Arabic translations (matching existing hardcoded values)
INSERT INTO site_translations (key, language_code, value, category) VALUES
  -- Navigation
  ('nav.home', 'ar', 'الرئيسية', 'navigation'),
  ('nav.products', 'ar', 'المنتجات', 'navigation'),
  ('nav.my_orders', 'ar', 'طلباتي', 'navigation'),
  ('nav.cart', 'ar', 'السلة', 'navigation'),
  ('nav.account', 'ar', 'حسابي', 'navigation'),
  
  -- Buttons
  ('button.shop_now', 'ar', 'تسوق الآن', 'buttons'),
  ('button.add_to_cart', 'ar', 'أضف للسلة', 'buttons'),
  ('button.view_cart', 'ar', 'عرض السلة', 'buttons'),
  ('button.checkout', 'ar', 'إتمام الطلب', 'buttons'),
  ('button.login', 'ar', 'تسجيل الدخول', 'buttons'),
  ('button.signup', 'ar', 'إنشاء حساب', 'buttons'),
  ('button.logout', 'ar', 'تسجيل الخروج', 'buttons'),
  
  -- Messages
  ('message.loading', 'ar', 'جاري التحميل...', 'messages'),
  ('message.no_products', 'ar', 'لا توجد منتجات', 'messages'),
  ('message.cart_empty', 'ar', 'سلة التسوق فارغة', 'messages'),
  ('message.success', 'ar', 'نجح!', 'messages'),
  ('message.error', 'ar', 'خطأ', 'messages'),
  
  -- Product page
  ('product.all_products', 'ar', 'جميع المنتجات', 'products'),
  ('product.categories', 'ar', 'الفئات', 'products'),
  ('product.price', 'ar', 'السعر', 'products'),
  ('product.stock', 'ar', 'المخزون', 'products'),
  ('product.in_stock', 'ar', 'متوفر', 'products'),
  ('product.out_of_stock', 'ar', 'غير متوفر', 'products'),
  
  -- Home page features
  ('feature.wholesale_prices', 'ar', 'أسعار الجملة', 'features'),
  ('feature.wholesale_prices_desc', 'ar', 'أفضل الأسعار للشراء بالكميات الكبيرة', 'features'),
  ('feature.delivery', 'ar', 'توصيل لجميع الولايات', 'features'),
  ('feature.delivery_desc', 'ar', 'نوصل إلى كل ولايات الجزائر ال 58', 'features'),
  ('feature.quality', 'ar', 'جودة مضمونة', 'features'),
  ('feature.quality_desc', 'ar', 'منتجات عالية الجودة ومضمونة', 'features'),
  
  -- Call to action
  ('cta.start_shopping', 'ar', 'ابدأ التسوق الآن', 'cta'),
  ('cta.discover_collection', 'ar', 'اكتشف مجموعتنا الواسعة من إكسسوارات الهواتف', 'cta'),
  ('cta.view_products', 'ar', 'عرض المنتجات', 'cta')
ON CONFLICT (key, language_code) DO NOTHING;

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View to get products with translations
CREATE OR REPLACE VIEW products_with_translations AS
SELECT 
  p.*,
  pt_ar.name as name_ar_trans,
  pt_ar.description as description_ar_trans,
  pt_fr.name as name_fr_trans,
  pt_fr.description as description_fr_trans
FROM products p
LEFT JOIN product_translations pt_ar ON p.id = pt_ar.product_id AND pt_ar.language_code = 'ar'
LEFT JOIN product_translations pt_fr ON p.id = pt_fr.product_id AND pt_fr.language_code = 'fr';

-- View to get categories with translations
CREATE OR REPLACE VIEW categories_with_translations AS
SELECT 
  c.*,
  ct_ar.name as name_ar_trans,
  ct_ar.description as description_ar_trans,
  ct_fr.name as name_fr_trans,
  ct_fr.description as description_fr_trans
FROM categories c
LEFT JOIN category_translations ct_ar ON c.id = ct_ar.category_id AND ct_ar.language_code = 'ar'
LEFT JOIN category_translations ct_fr ON c.id = ct_fr.category_id AND ct_fr.language_code = 'fr';

-- ============================================
-- END OF TRANSLATION SCHEMA
-- ============================================
