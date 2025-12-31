'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCartStore } from '@/store/cart'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function CartPage() {
  const router = useRouter()
  const { items, loading, updateQuantity, removeItem, getSubtotal, loadCart } = useCartStore()

  useEffect(() => {
    loadCart()
  }, [])

  const subtotal = getSubtotal()

  const handleQuantityChange = async (itemId: string, newQuantity: number, maxStock: number) => {
    if (newQuantity > maxStock) {
      toast.error('الكمية المطلوبة غير متوفرة')
      return
    }
    await updateQuantity(itemId, newQuantity)
  }

  const handleRemove = async (itemId: string) => {
    if (confirm('هل تريد حذف هذا المنتج من السلة؟')) {
      await removeItem(itemId)
      toast.success('تم حذف المنتج من السلة')
    }
  }

  const handleCheckout = () => {
    router.push('/checkout')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-2xl font-bold mb-2">السلة فارغة</h2>
          <p className="text-gray-600 mb-6">لم تقم بإضافة أي منتجات بعد</p>
          <Link
            href="/products"
            className="inline-block bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            تصفح المنتجات
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">سلة التسوق</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-4 flex gap-4">
              {/* Product Image */}
              <div className="w-24 h-24 relative bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{item.productName}</h3>
                {item.variantName && (
                  <p className="text-sm text-gray-600 mb-2">{item.variantName}</p>
                )}
                <p className="text-primary font-bold text-lg">
                  {item.price.toFixed(2)} دج
                </p>
              </div>

              {/* Quantity and Actions */}
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.stockQuantity)}
                    className="w-8 h-8 rounded border-2 border-gray-300 hover:border-primary transition-colors"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.stockQuantity)}
                    className="w-8 h-8 rounded border-2 border-gray-300 hover:border-primary transition-colors"
                    disabled={item.quantity >= item.stockQuantity}
                  >
                    +
                  </button>
                </div>

                <div className="text-lg font-bold">
                  {(item.price * item.quantity).toFixed(2)} دج
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-2xl font-bold mb-6">ملخص الطلب</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">المجموع الفرعي</span>
                <span className="font-semibold">{subtotal.toFixed(2)} دج</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>رسوم التوصيل</span>
                <span>تحسب عند الدفع</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>المجموع</span>
                <span className="text-primary">{subtotal.toFixed(2)} دج</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg transition-colors"
            >
              متابعة إلى الدفع
            </button>

            <Link
              href="/products"
              className="block text-center text-primary hover:underline mt-4"
            >
              متابعة التسوق
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
