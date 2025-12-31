'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import { trackAnalyticsEvent } from '@/lib/analytics'
import { useLanguage } from '@/contexts/LanguageContext'
import { getTranslatedName } from '@/hooks/useTranslations'

interface Category {
  id: string
  name_ar: string
  name_fr: string | null
  image_url: string | null
}

interface Product {
  id: string
  name_ar: string
  name_fr: string | null
  description: string | null
  image_url: string | null
  has_variants: boolean
  price: number | null
  stock_quantity: number | null
  category_id: string
}

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { language, t } = useLanguage()

  useEffect(() => {
    loadCategories()
    loadProducts()
    trackAnalyticsEvent('page_view')
  }, [])

  useEffect(() => {
    loadProducts()
  }, [selectedCategory])

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
    
    if (data) setCategories(data)
  }

  const loadProducts = async () => {
    setLoading(true)
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
    
    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory)
    }
    
    const { data } = await query
    
    if (data) setProducts(data)
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{t('nav.products', 'المنتجات')}</h1>

      <div className="flex gap-8">
        {/* Sidebar - Categories */}
        <aside className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-20">
            <h2 className="text-xl font-bold mb-4">{t('product.categories', 'الفئات')}</h2>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-right px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === null
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {t('product.all_products', 'جميع المنتجات')}
                </button>
              </li>
              {categories.map(category => (
                <li key={category.id}>
                  <button
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-right px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {getTranslatedName(category, language)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content - Products */}
        <main className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">{t('message.no_products', 'لا توجد منتجات في هذه الفئة')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const { language, t } = useLanguage()
  
  const handleProductClick = () => {
    trackAnalyticsEvent('product_view', {
      productId: product.id,
    })
  }

  const productName = getTranslatedName(product, language)

  return (
    <Link
      href={`/products/${product.id}`}
      onClick={handleProductClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
    >
      <div className="aspect-square relative bg-gray-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={productName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold mb-2 line-clamp-2">{productName}</h3>
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {product.has_variants ? (
          <div className="flex items-center justify-between">
            <span className="text-primary font-semibold">
              {language === 'fr' ? 'Cliquez pour choisir' : 'اضغط للاختيار'}
            </span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              {product.price?.toFixed(2)} {language === 'fr' ? 'DA' : 'دج'}
            </span>
            {product.stock_quantity !== null && product.stock_quantity > 0 ? (
              <span className="text-sm text-secondary">{t('product.in_stock', 'متوفر')}</span>
            ) : (
              <span className="text-sm text-red-500">{t('product.out_of_stock', 'غير متوفر')}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
