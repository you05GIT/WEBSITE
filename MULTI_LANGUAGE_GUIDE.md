# Multi-Language Support (FR / AR) - Implementation Guide

## Overview

This implementation adds French and Arabic language support to the e-commerce platform while maintaining backward compatibility with existing Arabic content.

## Database Changes

### New SQL File: `sup.sql`

This file contains **ONLY** additive SQL changes. It is safe to run multiple times (idempotent).

**New Tables:**
- `site_translations` - UI labels, buttons, messages
- `product_translations` - Product names and descriptions
- `category_translations` - Category names and descriptions
- `home_page_translations` - Home page hero section content
- `product_variant_translations` - Product variant names
- `variant_item_translations` - Variant item names and descriptions

**To apply the changes:**
```sql
-- Run this file in your Supabase SQL editor:
psql -f sup.sql
```

## Features

### 1. Language Switching
- Users can switch between French (FR) and Arabic (AR)
- Language preference is saved in localStorage
- Page direction automatically changes:
  - Arabic: RTL (Right-to-Left)
  - French: LTR (Left-to-Right)

### 2. Fallback System
- If French translation is missing, system falls back to Arabic
- Existing Arabic content remains unchanged
- No data loss or breaking changes

### 3. Translation Coverage

**UI Elements (via `site_translations`):**
- Navigation items
- Buttons and CTAs
- Messages and notifications
- Product page labels

**Content (via specific translation tables):**
- Product names and descriptions
- Category names
- Home page hero section
- Variant names

## Usage Examples

### Frontend Components

**Language Switcher:**
```tsx
import LanguageSwitcher from '@/components/LanguageSwitcher'

// In your component:
<LanguageSwitcher />
```

**Using Translations in Components:**
```tsx
import { useLanguage } from '@/contexts/LanguageContext'

function MyComponent() {
  const { t, language } = useLanguage()
  
  return (
    <div>
      <h1>{t('nav.home', 'الرئيسية')}</h1>
      <p>Current language: {language}</p>
    </div>
  )
}
```

**Using Product/Category Translations:**
```tsx
import { getTranslatedName } from '@/hooks/useTranslations'
import { useLanguage } from '@/contexts/LanguageContext'

function ProductCard({ product }) {
  const { language } = useLanguage()
  const productName = getTranslatedName(product, language)
  
  return <h3>{productName}</h3>
}
```

**Using Home Page Translations:**
```tsx
import { useHomePageTranslations } from '@/hooks/useTranslations'

function HomePage() {
  const { content, loading } = useHomePageTranslations()
  
  if (loading || !content) return <div>Loading...</div>
  
  return (
    <div>
      <h1>{content.heroTitle}</h1>
      <p>{content.heroDescription}</p>
    </div>
  )
}
```

## Adding New Translations

### 1. UI Translations (site_translations)

```sql
-- Add a new French translation
INSERT INTO site_translations (key, language_code, value, category) 
VALUES ('button.new_action', 'fr', 'Nouvelle Action', 'buttons')
ON CONFLICT (key, language_code) DO NOTHING;

-- Add corresponding Arabic translation
INSERT INTO site_translations (key, language_code, value, category) 
VALUES ('button.new_action', 'ar', 'إجراء جديد', 'buttons')
ON CONFLICT (key, language_code) DO NOTHING;
```

### 2. Product Translations

```sql
-- Add French translation for a product
INSERT INTO product_translations (product_id, language_code, name, description)
VALUES (
  'your-product-uuid',
  'fr',
  'Écouteurs Bluetooth',
  'Écouteurs sans fil de haute qualité avec réduction de bruit'
)
ON CONFLICT (product_id, language_code) DO NOTHING;
```

### 3. Category Translations

```sql
-- Add French translation for a category
INSERT INTO category_translations (category_id, language_code, name, description)
VALUES (
  'your-category-uuid',
  'fr',
  'Accessoires Audio',
  'Tous les accessoires audio pour téléphones'
)
ON CONFLICT (category_id, language_code) DO NOTHING;
```

## Important Notes

### ✅ Safe Operations
- Creating new translation records
- Updating existing translations
- Adding new UI translation keys

### ❌ Avoid
- Dropping or renaming existing tables
- Modifying existing product/category columns
- Changing the meaning of existing Arabic content
- Breaking changes to the database schema

## Testing

1. **Language Switching:**
   - Click FR/AR toggle in the header
   - Verify UI text changes
   - Verify direction changes (RTL/LTR)
   - Check localStorage persistence

2. **Fallback Behavior:**
   - Products with French translations should show French text
   - Products without French translations should show Arabic text
   - No blank/missing content

3. **Persistence:**
   - Refresh page after switching language
   - Verify selected language persists

## Architecture

```
/contexts/LanguageContext.tsx    - Language state management
/hooks/useTranslations.ts        - Translation hooks
/components/LanguageSwitcher.tsx - UI component for switching
/sup.sql                         - Database additions
```

## Database Schema

### site_translations
```
- id (UUID)
- key (TEXT) - e.g., 'nav.home'
- language_code (TEXT) - 'fr' or 'ar'
- value (TEXT) - Translated text
- category (TEXT) - Grouping (optional)
```

### product_translations
```
- id (UUID)
- product_id (UUID) - References products.id
- language_code (TEXT) - 'fr' or 'ar'
- name (TEXT)
- description (TEXT)
```

### category_translations
```
- id (UUID)
- category_id (UUID) - References categories.id
- language_code (TEXT) - 'fr' or 'ar'
- name (TEXT)
- description (TEXT)
```

## Maintenance

### Adding New Languages (Future)
To add a new language:
1. Update language type in LanguageContext.tsx
2. Add CHECK constraint to SQL tables
3. Create translation records for the new language
4. Update LanguageSwitcher component

### Bulk Translation Import
Use SQL or a migration script:
```sql
-- Example: Import from CSV
COPY site_translations(key, language_code, value, category)
FROM '/path/to/translations.csv'
CSV HEADER;
```

## Support

For issues or questions:
1. Check that `sup.sql` has been run on your database
2. Verify site_translations table has data
3. Check browser console for errors
4. Ensure localStorage is not blocked

## Security

- All translation tables have Row Level Security (RLS) enabled
- Public read access for all users
- Write access restricted to admin users
- No sensitive data should be stored in translations
