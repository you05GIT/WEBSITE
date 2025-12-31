import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface StoreSettings {
  storeName: string
  storeLogoUrl: string | null
  primaryColor: string
  secondaryColor: string
}

interface HomePageContent {
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  ctaText: string
  sectionVisible: boolean
}

interface StoreState {
  settings: StoreSettings | null
  homeContent: HomePageContent | null
  loading: boolean
  
  loadSettings: () => Promise<void>
  loadHomeContent: () => Promise<void>
}

export const useStoreSettings = create<StoreState>((set) => ({
  settings: null,
  homeContent: null,
  loading: false,

  loadSettings: async () => {
    set({ loading: true })
    try {
      const { data } = await supabase
        .from('store_settings')
        .select('*')
        .single()
      
      if (data) {
        set({
          settings: {
            storeName: data.store_name,
            storeLogoUrl: data.store_logo_url,
            primaryColor: data.primary_color,
            secondaryColor: data.secondary_color,
          }
        })
        
        // Apply theme colors
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--color-primary', data.primary_color)
          document.documentElement.style.setProperty('--color-secondary', data.secondary_color)
        }
      }
    } catch (error) {
      console.error('Error loading store settings:', error)
    } finally {
      set({ loading: false })
    }
  },

  loadHomeContent: async () => {
    try {
      const { data } = await supabase
        .from('home_page_content')
        .select('*')
        .single()
      
      if (data) {
        set({
          homeContent: {
            heroTitle: data.hero_title,
            heroSubtitle: data.hero_subtitle,
            heroDescription: data.hero_description,
            ctaText: data.cta_text,
            sectionVisible: data.section_visible,
          }
        })
      }
    } catch (error) {
      console.error('Error loading home content:', error)
    }
  },
}))
