'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Order {
  id: string
  order_number: string
  customer_name: string
  total: number
  status: 'pending' | 'confirmed' | 'delivered' | 'canceled'
  created_at: string
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      setUser(user)
      loadOrders(user.id)
    } else {
      setLoading(false)
    }
  }

  const loadOrders = async (userId: string) => {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, total, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (data) setOrders(data)
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'قيد المعالجة', className: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'مؤكد', className: 'bg-blue-100 text-blue-800' },
      delivered: { label: 'تم التوصيل', className: 'bg-green-100 text-green-800' },
      canceled: { label: 'ملغي', className: 'bg-red-100 text-red-800' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${config.className}`}>
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-md mx-auto">
          <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-2xl font-bold mb-2">تسجيل الدخول مطلوب</h2>
          <p className="text-gray-600 mb-6">
            يجب عليك تسجيل الدخول لعرض طلباتك
          </p>
          <Link
            href="/auth/login"
            className="inline-block bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-2xl font-bold mb-2">لا توجد طلبات</h2>
          <p className="text-gray-600 mb-6">لم تقم بإنشاء أي طلبات بعد</p>
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
      <h1 className="text-4xl font-bold mb-8">طلباتي</h1>

      <div className="space-y-4">
        {orders.map(order => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold">{order.order_number}</h3>
                  {getStatusBadge(order.status)}
                </div>
                <p className="text-gray-600">
                  {new Date(order.created_at).toLocaleDateString('ar-DZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="text-left">
                <div className="text-2xl font-bold text-primary">
                  {order.total.toFixed(2)} دج
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  عرض التفاصيل ←
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
