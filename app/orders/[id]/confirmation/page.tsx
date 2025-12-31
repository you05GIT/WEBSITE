'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  commune: string
  address: string
  delivery_price: number
  subtotal: number
  total: number
  status: string
  created_at: string
  wilayas: {
    name_ar: string
  }
}

export default function OrderConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrder()
  }, [orderId])

  const loadOrder = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        wilayas (
          name_ar
        )
      `)
      .eq('id', orderId)
      .single()

    if (data) {
      setOrder(data)
    } else {
      router.push('/orders')
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">تم إنشاء الطلب بنجاح!</h1>
          <p className="text-gray-600">شكراً لك على طلبك</p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <div>
              <div className="text-sm text-gray-600 mb-1">رقم الطلب</div>
              <div className="text-2xl font-bold text-primary">{order.order_number}</div>
            </div>
            <div className="text-left">
              <div className="text-sm text-gray-600 mb-1">حالة الطلب</div>
              <div className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                قيد المعالجة
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">معلومات العميل</div>
              <div className="font-semibold">{order.customer_name}</div>
              <div className="text-gray-700">{order.customer_phone}</div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">عنوان التوصيل</div>
              <div className="text-gray-700">
                {order.wilayas.name_ar} - {order.commune}
                <br />
                {order.address}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">المجموع الفرعي</span>
                  <span className="font-semibold">{order.subtotal.toFixed(2)} دج</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">رسوم التوصيل</span>
                  <span className="font-semibold">{order.delivery_price.toFixed(2)} دج</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-2">
                  <span>الإجمالي</span>
                  <span className="text-primary">{order.total.toFixed(2)} دج</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <svg className="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm">
              <div className="font-semibold text-blue-900 mb-1">ماذا بعد؟</div>
              <ul className="text-blue-800 space-y-1">
                <li>• سنتصل بك قريباً لتأكيد الطلب</li>
                <li>• يتم التوصيل خلال 2-5 أيام عمل</li>
                <li>• الدفع عند الاستلام</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/products"
            className="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors"
          >
            متابعة التسوق
          </Link>
          <Link
            href="/orders"
            className="flex-1 text-center bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            عرض طلباتي
          </Link>
        </div>
      </div>
    </div>
  )
}
