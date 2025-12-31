import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'

interface HomePageTranslation {
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  ctaText: string
}

// Simple static translations for homepage
const homePageContent: Record<'ar' | 'fr', HomePageTranslation> = {
  ar: {
    heroTitle: 'مرحبا بكم في متجر الجملة',
    heroSubtitle: 'نبيع إكسسوارات الهواتف بالجملة',
    heroDescription: 'نحن متخصصون في بيع جميع أنواع إكسسوارات الهواتف بأسعار الجملة في جميع ولايات الجزائر',
    ctaText: 'تسوق الآن',
  },
  fr: {
    heroTitle: 'Bienvenue dans notre magasin de gros',
    heroSubtitle: 'Nous vendons des accessoires de téléphone en gros',
    heroDescription: 'Nous sommes spécialisés dans la vente de tous types d\'accessoires de téléphone à des prix de gros dans toutes les wilayas d\'Algérie',
    ctaText: 'Acheter maintenant',
  }
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
      // Try to get editable content from database first (Arabic only for backward compatibility)
      const { data: dbContent } = await supabase
        .from('home_page_content')
        .select('*')
        .single()

      if (dbContent && language === 'ar') {
        // Use database content for Arabic
        setContent({
          heroTitle: dbContent.hero_title,
          heroSubtitle: dbContent.hero_subtitle,
          heroDescription: dbContent.hero_description,
          ctaText: dbContent.cta_text,
        })
      } else {
        // Use static translations
        setContent(homePageContent[language])
      }
    } catch (error) {
      // Fallback to static translations on error
      setContent(homePageContent[language])
    } finally {
      setLoading(false)
    }
  }

  return { content, loading }
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
