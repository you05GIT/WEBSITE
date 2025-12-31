-- ============================================
-- DATABASE CLEANUP & ADDITIONS FOR CATEGORIES
-- File: supa.sql
-- Purpose: Remove unused translation tables and add slug support for categories
-- ============================================

-- ============================================
-- SECTION 1: CLEANUP - DROP UNUSED TABLES
-- ============================================

-- Drop site_translations table (SAFE: Using simple JS dictionary instead)
-- This table was used for UI translations but we've moved to client-side dictionary
DROP TABLE IF EXISTS site_translations CASCADE;

-- Drop home_page_translations table (SAFE: Using static translations)
-- We keep home_page_content for Arabic and use static French translations
DROP TABLE IF EXISTS home_page_translations CASCADE;

-- Drop product_translations table (SAFE: Products have name_ar and name_fr columns)
-- Per requirements: "Do NOT translate product data from database"
DROP TABLE IF EXISTS product_translations CASCADE;

-- Drop category_translations table (SAFE: Categories have name_ar and name_fr columns)
-- Categories already support bilingual names in their main table
DROP TABLE IF EXISTS category_translations CASCADE;

-- ============================================
-- SECTION 2: ADDITIONS - CATEGORY SLUG SUPPORT
-- ============================================

-- Add slug column to categories table if it doesn't exist
-- This enables pretty URLs like /category/phone-cases
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- ============================================
-- SECTION 3: SLUG GENERATION FUNCTION
-- ============================================

-- Function to generate slug from Arabic name
-- Converts Arabic text to a simple numeric/text slug
CREATE OR REPLACE FUNCTION generate_category_slug(category_name TEXT, category_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from first 8 characters of UUID + sanitized name
  base_slug := LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(category_name, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  );
  
  -- If Arabic or empty, use category ID prefix
  IF base_slug = '' OR base_slug !~ '[a-z0-9]' THEN
    base_slug := 'cat-' || SUBSTRING(category_id::TEXT, 1, 8);
  END IF;
  
  -- Ensure uniqueness
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM categories WHERE slug = final_slug AND id != category_id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SECTION 4: TRIGGER FOR AUTO-GENERATING SLUGS
-- ============================================

-- Trigger function to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION set_category_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if slug is null or empty
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_category_slug(NEW.name_ar, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for categories
DROP TRIGGER IF EXISTS trigger_set_category_slug ON categories;
CREATE TRIGGER trigger_set_category_slug
BEFORE INSERT OR UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION set_category_slug();

-- ============================================
-- SECTION 5: GENERATE SLUGS FOR EXISTING CATEGORIES
-- ============================================

-- Update existing categories to have slugs
UPDATE categories
SET slug = generate_category_slug(name_ar, id)
WHERE slug IS NULL OR slug = '';

-- ============================================
-- SECTION 6: ENSURE PROPER RLS POLICIES
-- ============================================

-- Categories should be viewable by everyone (active ones)
-- This policy should already exist but we ensure it's correct
DO $$
BEGIN
  -- Drop old policy if exists
  DROP POLICY IF EXISTS "Active categories viewable by everyone" ON categories;
  
  -- Create proper policy
  CREATE POLICY "Active categories viewable by everyone"
  ON categories FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN categories.slug IS 'URL-friendly slug for category routing (e.g., phone-cases)';
COMMENT ON FUNCTION generate_category_slug IS 'Auto-generates unique slug for categories based on name';

-- ============================================
-- END OF CLEANUP & ADDITIONS
-- ============================================
