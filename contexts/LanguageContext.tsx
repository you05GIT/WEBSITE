'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'ar' | 'fr'
type Direction = 'rtl' | 'ltr'

interface LanguageContextType {
  language: Language
  direction: Direction
  setLanguage: (lang: Language) => void
  t: (key: string, fallback?: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const LANGUAGE_KEY = 'preferred_language'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar')
  const [translations, setTranslations] = useState<Record<string, string>>({})

  // Determine direction based on language
  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY) as Language | null
    if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'fr')) {
      setLanguageState(savedLanguage)
    }
  }, [])

  useEffect(() => {
    // Update document attributes
    document.documentElement.lang = language
    document.documentElement.dir = direction
    
    // Load translations for current language
    loadTranslations(language)
  }, [language, direction])

  const loadTranslations = async (lang: Language) => {
    try {
      // Import supabase dynamically to avoid circular dependencies
      const { supabase } = await import('@/lib/supabase')
      
      const { data } = await supabase
        .from('site_translations')
        .select('key, value')
        .eq('language_code', lang)
      
      if (data) {
        const translationsMap: Record<string, string> = {}
        data.forEach(item => {
          translationsMap[item.key] = item.value
        })
        setTranslations(translationsMap)
      }
    } catch (error) {
      console.error('Error loading translations:', error)
    }
  }

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(LANGUAGE_KEY, lang)
  }

  // Translation function with fallback
  const t = (key: string, fallback?: string): string => {
    return translations[key] || fallback || key
  }

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
