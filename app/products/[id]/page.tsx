'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/store/cart'
import { trackAnalyticsEvent } from '@/lib/analytics'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name_ar: string
  name_fr: string | null
  description: string | null
  image_url: string | null
  has_variants: boolean
  price: number | null
  stock_quantity: number | null
}

interface Variant {
  id: string
  name_ar: string
  name_fr: string | null
  items: VariantItem[]
}

interface VariantItem {
  id: string
  name_ar: string
  name_fr: string | null
  description: string | null
  price: number
  stock_quantity: number
  image_url: string | null
  sku: string | null
  is_active: boolean
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariantItem, setSelectedVariantItem] = useState<VariantItem | null>(null)

  const { addItem } = useCartStore()

  useEffect(() => {
    loadProduct()
    trackAnalyticsEvent('product_view', { productId })
  }, [productId])

  const loadProduct = async () => {
    setLoading(true)

    // Load product
    const { data: productData } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (productData) {
      setProduct(productData)

      // Load variants if product has them
      if (productData.has_variants) {
        const { data: variantsData } = await supabase
          .from('product_variants')
          .select(`
            id,
            name_ar,
            name_fr,
            variant_items (
              id,
              name_ar,
              name_fr,
              description,
              price,
              stock_quantity,
              image_url,
              sku,
              is_active
            )
          `)
          .eq('product_id', productId)
          .order('display_order')

        if (variantsData) {
          const formattedVariants = variantsData.map((v: any) => ({
            id: v.id,
            name_ar: v.name_ar,
            name_fr: v.name_fr,
            items: v.variant_items.filter((item: any) => item.is_active),
          }))
          setVariants(formattedVariants)
        }
      }
    }

    setLoading(false)
  }

  const handleAddToCart = async () => {
    if (!product) return

    try {
      if (product.has_variants) {
        if (!selectedVariantItem) {
          toast.error('الرجاء اختيار نوع المنتج')
          return
        }

        if (selectedVariantItem.stock_quantity < quantity) {
          toast.error('الكمية المطلوبة غير متوفرة')
          return
        }

        await addItem({
          productId: product.id,
          productName: product.name_ar,
          variantItemId: selectedVariantItem.id,
          variantName: selectedVariantItem.name_ar,
          quantity,
          price: selectedVariantItem.price,
          imageUrl: selectedVariantItem.image_url || product.image_url || undefined,
          stockQuantity: selectedVariantItem.stock_quantity,
        })
      } else {
        if (!product.stock_quantity || product.stock_quantity < quantity) {
          toast.error('الكمية المطلوبة غير متوفرة')
          return
        }

        await addItem({
          productId: product.id,
          productName: product.name_ar,
          quantity,
          price: product.price!,
          imageUrl: product.image_url || undefined,
          stockQuantity: product.stock_quantity,
        })
      }

      toast.success('تمت إضافة المنتج إلى السلة')
      setQuantity(1)
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة المنتج')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-600 mb-4">المنتج غير موجود</p>
        <button
          onClick={() => router.push('/products')}
          className="text-primary hover:underline"
        >
          العودة إلى المنتجات
        </button>
      </div>
    )
  }

  const currentImage = selectedVariantItem?.image_url || product.image_url
  const currentPrice = selectedVariantItem?.price || product.price
  const currentStock = selectedVariantItem?.stock_quantity || product.stock_quantity

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        العودة
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
          {currentImage ? (
            <Image
              src={currentImage}
              alt={product.name_ar}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name_ar}</h1>

          {product.description && (
            <p className="text-gray-700 mb-6 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Variants Selection */}
          {product.has_variants && variants.length > 0 && (
            <div className="mb-6 space-y-4">
              {variants.map(variant => (
                <div key={variant.id}>
                  <h3 className="font-semibold mb-2">{variant.name_ar}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {variant.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedVariantItem(item)}
                        className={`p-3 border-2 rounded-lg text-right transition-all ${
                          selectedVariantItem?.id === item.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        disabled={item.stock_quantity === 0}
                      >
                        <div className="font-medium">{item.name_ar}</div>
                        <div className="text-sm text-primary font-semibold">
                          {item.price.toFixed(2)} دج
                        </div>
                        {item.stock_quantity === 0 && (
                          <div className="text-xs text-red-500">غير متوفر</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Price and Stock */}
          {currentPrice !== null && (
            <div className="mb-6">
              <div className="text-4xl font-bold text-primary mb-2">
                {currentPrice.toFixed(2)} دج
              </div>
              {currentStock !== null && (
                <div className={`text-sm ${currentStock > 0 ? 'text-secondary' : 'text-red-500'}`}>
                  {currentStock > 0 ? `متوفر (${currentStock} قطعة)` : 'غير متوفر'}
                </div>
              )}
            </div>
          )}

          {/* Quantity Selector */}
          {currentStock && currentStock > 0 && (
            <div className="mb-6">
              <label className="block font-semibold mb-2">الكمية</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-primary transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(currentStock, parseInt(e.target.value) || 1)))}
                  className="w-20 h-10 text-center border-2 border-gray-300 rounded-lg"
                  min="1"
                  max={currentStock}
                />
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-primary transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!currentStock || currentStock === 0 || (product.has_variants && !selectedVariantItem)}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {currentStock && currentStock > 0 ? 'إضافة إلى السلة' : 'غير متوفر'}
          </button>
        </div>
      </div>
    </div>
  )
}
