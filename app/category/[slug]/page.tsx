'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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
  description: string | null
  slug: string
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

export default function CategoryPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const { language, t } = useLanguage()

  useEffect(() => {
    if (slug) {
      loadCategoryAndProducts()
    }
  }, [slug])

  const loadCategoryAndProducts = async () => {
    setLoading(true)
    setNotFound(false)

    try {
      // Load category by slug
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (categoryError || !categoryData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setCategory(categoryData)

      // Load products in this category
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (productsData) {
        setProducts(productsData)
      }

      trackAnalyticsEvent('page_view', {
        categoryId: categoryData.id,
        categoryName: categoryData.name_ar,
      })
    } catch (error) {
      console.error('Error loading category:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            {language === 'fr' ? 'Catégorie non trouvée' : 'الفئة غير موجودة'}
          </h1>
          <p className="text-gray-600 mb-8">
            {language === 'fr' 
              ? 'La catégorie que vous recherchez n\'existe pas ou a été désactivée.'
              : 'الفئة التي تبحث عنها غير موجودة أو تم تعطيلها.'}
          </p>
          <Link
            href="/products"
            className="inline-block bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            {t('cta.view_products', 'عرض المنتجات')}
          </Link>
        </div>
      </div>
    )
  }

  const categoryName = getTranslatedName(category, language)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm">
        <Link href="/" className="text-gray-600 hover:text-primary">
          {t('nav.home', 'الرئيسية')}
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link href="/products" className="text-gray-600 hover:text-primary">
          {t('nav.products', 'المنتجات')}
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900 font-semibold">{categoryName}</span>
      </div>

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{categoryName}</h1>
        {category?.description && (
          <p className="text-gray-600 text-lg">{category.description}</p>
        )}
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <svg
            className="w-24 h-24 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-gray-500 text-lg mb-6">
            {t('category.no_products', 'لا توجد منتجات في هذه الفئة')}
          </p>
          <Link
            href="/products"
            className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            {t('product.all_products', 'جميع المنتجات')}
          </Link>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-6">
            {products.length} {language === 'fr' ? 'produit(s)' : 'منتج'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
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
            <svg
              className="w-16 h-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
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
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              {product.price?.toFixed(2)} {language === 'fr' ? 'DA' : 'دج'}
            </span>
            {product.stock_quantity !== null && product.stock_quantity > 0 ? (
              <span className="text-sm text-secondary">
                {t('product.in_stock', 'متوفر')}
              </span>
            ) : (
              <span className="text-sm text-red-500">
                {t('product.out_of_stock', 'غير متوفر')}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
