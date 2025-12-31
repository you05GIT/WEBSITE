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

// Simple JS dictionary for UI translations
const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.products': 'المنتجات',
    'nav.my_orders': 'طلباتي',
    'nav.account': 'حسابي',
    'nav.cart': 'السلة',
    'nav.admin': 'لوحة التحكم',
    
    // Product
    'product.categories': 'الفئات',
    'product.all_products': 'جميع المنتجات',
    'product.in_stock': 'متوفر',
    'product.out_of_stock': 'غير متوفر',
    'product.add_to_cart': 'أضف للسلة',
    'product.price': 'السعر',
    'product.quantity': 'الكمية',
    
    // Messages
    'message.no_products': 'لا توجد منتجات في هذه الفئة',
    'message.loading': 'جاري التحميل...',
    'message.error': 'حدث خطأ',
    'message.success': 'تمت العملية بنجاح',
    
    // Features
    'feature.wholesale_prices': 'أسعار الجملة',
    'feature.wholesale_prices_desc': 'أفضل الأسعار للشراء بالكميات الكبيرة',
    'feature.delivery': 'توصيل لجميع الولايات',
    'feature.delivery_desc': 'نوصل إلى كل ولايات الجزائر ال 58',
    'feature.quality': 'جودة مضمونة',
    'feature.quality_desc': 'منتجات عالية الجودة ومضمونة',
    
    // CTA
    'cta.start_shopping': 'ابدأ التسوق الآن',
    'cta.discover_collection': 'اكتشف مجموعتنا الواسعة من إكسسوارات الهواتف',
    'cta.view_products': 'عرض المنتجات',
    
    // Cart
    'cart.title': 'سلة التسوق',
    'cart.empty': 'السلة فارغة',
    'cart.checkout': 'إتمام الطلب',
    'cart.continue_shopping': 'متابعة التسوق',
    'cart.remove': 'حذف',
    'cart.total': 'المجموع',
    
    // Category
    'category.products': 'المنتجات',
    'category.no_products': 'لا توجد منتجات في هذه الفئة',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.products': 'Produits',
    'nav.my_orders': 'Mes Commandes',
    'nav.account': 'Mon Compte',
    'nav.cart': 'Panier',
    'nav.admin': 'Tableau de bord',
    
    // Product
    'product.categories': 'Catégories',
    'product.all_products': 'Tous les produits',
    'product.in_stock': 'En stock',
    'product.out_of_stock': 'Rupture de stock',
    'product.add_to_cart': 'Ajouter au panier',
    'product.price': 'Prix',
    'product.quantity': 'Quantité',
    
    // Messages
    'message.no_products': 'Aucun produit dans cette catégorie',
    'message.loading': 'Chargement...',
    'message.error': 'Une erreur est survenue',
    'message.success': 'Opération réussie',
    
    // Features
    'feature.wholesale_prices': 'Prix de gros',
    'feature.wholesale_prices_desc': 'Meilleurs prix pour achats en grande quantité',
    'feature.delivery': 'Livraison dans toutes les wilayas',
    'feature.delivery_desc': 'Nous livrons dans les 58 wilayas d\'Algérie',
    'feature.quality': 'Qualité garantie',
    'feature.quality_desc': 'Produits de haute qualité et garantis',
    
    // CTA
    'cta.start_shopping': 'Commencez vos achats maintenant',
    'cta.discover_collection': 'Découvrez notre large gamme d\'accessoires pour téléphones',
    'cta.view_products': 'Voir les produits',
    
    // Cart
    'cart.title': 'Panier',
    'cart.empty': 'Panier vide',
    'cart.checkout': 'Passer la commande',
    'cart.continue_shopping': 'Continuer les achats',
    'cart.remove': 'Supprimer',
    'cart.total': 'Total',
    
    // Category
    'category.products': 'Produits',
    'category.no_products': 'Aucun produit dans cette catégorie',
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar')

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
  }, [language, direction])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(LANGUAGE_KEY, lang)
  }

  // Translation function with fallback
  const t = (key: string, fallback?: string): string => {
    return translations[language][key] || fallback || key
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
