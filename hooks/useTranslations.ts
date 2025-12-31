import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'

interface HomePageTranslation {
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  ctaText: string
}

export function useHomePageTranslations() {
  const { language } = useLanguage()
  const [content, setContent] = useState<HomePageTranslation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContent()
  }, [language])

  const loadContent = async () => {
    setLoading(true)
    try {
      // Try to get translation for current language
      const { data: translation } = await supabase
        .from('home_page_translations')
        .select('*')
        .eq('language_code', language)
        .single()

      if (translation) {
        setContent({
          heroTitle: translation.hero_title,
          heroSubtitle: translation.hero_subtitle,
          heroDescription: translation.hero_description,
          ctaText: translation.cta_text,
        })
      } else {
        // Fallback to original home_page_content (Arabic)
        const { data: fallback } = await supabase
          .from('home_page_content')
          .select('*')
          .single()

        if (fallback) {
          setContent({
            heroTitle: fallback.hero_title,
            heroSubtitle: fallback.hero_subtitle,
            heroDescription: fallback.hero_description,
            ctaText: fallback.cta_text,
          })
        }
      }
    } catch (error) {
      console.error('Error loading home page translations:', error)
    } finally {
      setLoading(false)
    }
  }

  return { content, loading }
}

interface ProductTranslation {
  id: string
  name: string
  description: string | null
}

export function useProductTranslations(productId: string) {
  const { language } = useLanguage()
  const [product, setProduct] = useState<ProductTranslation | null>(null)

  useEffect(() => {
    if (productId) {
      loadProduct()
    }
  }, [productId, language])

  const loadProduct = async () => {
    try {
      // Try to get translation
      const { data: translation } = await supabase
        .from('product_translations')
        .select('name, description')
        .eq('product_id', productId)
        .eq('language_code', language)
        .single()

      if (translation) {
        setProduct({
          id: productId,
          name: translation.name,
          description: translation.description,
        })
      } else {
        // Fallback to original product data
        const { data: fallback } = await supabase
          .from('products')
          .select('id, name_ar, description')
          .eq('id', productId)
          .single()

        if (fallback) {
          setProduct({
            id: fallback.id,
            name: fallback.name_ar,
            description: fallback.description,
          })
        }
      }
    } catch (error) {
      console.error('Error loading product translation:', error)
    }
  }

  return product
}

interface CategoryTranslation {
  id: string
  name: string
  description: string | null
}

export function useCategoryTranslations(categoryId: string) {
  const { language } = useLanguage()
  const [category, setCategory] = useState<CategoryTranslation | null>(null)

  useEffect(() => {
    if (categoryId) {
      loadCategory()
    }
  }, [categoryId, language])

  const loadCategory = async () => {
    try {
      // Try to get translation
      const { data: translation } = await supabase
        .from('category_translations')
        .select('name, description')
        .eq('category_id', categoryId)
        .eq('language_code', language)
        .single()

      if (translation) {
        setCategory({
          id: categoryId,
          name: translation.name,
          description: translation.description,
        })
      } else {
        // Fallback to original category data
        const { data: fallback } = await supabase
          .from('categories')
          .select('id, name_ar, description')
          .eq('id', categoryId)
          .single()

        if (fallback) {
          setCategory({
            id: fallback.id,
            name: fallback.name_ar,
            description: fallback.description,
          })
        }
      }
    } catch (error) {
      console.error('Error loading category translation:', error)
    }
  }

  return category
}

// Helper function to get translated name from product/category object
export function getTranslatedName(
  item: { name_ar: string; name_fr?: string | null } | null,
  language: 'ar' | 'fr'
): string {
  if (!item) return ''
  
  if (language === 'fr' && item.name_fr) {
    return item.name_fr
  }
  
  return item.name_ar || ''
}
