'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { trackAnalyticsEvent } from '@/lib/analytics'

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  total: number
  status: 'pending' | 'confirmed' | 'delivered' | 'canceled'
  created_at: string
  wilayas: {
    name_ar: string
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    loadOrders()
  }, [statusFilter])

  const loadOrders = async () => {
    setLoading(true)
    let query = supabase
      .from('orders')
      .select(`
        *,
        wilayas (
          name_ar
        )
      `)
      .order('created_at', { ascending: false })

    if (statusFilter) {
      query = query.eq('status', statusFilter)
    }

    const { data } = await query
    if (data) setOrders(data)
    setLoading(false)
  }

  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'confirmed' | 'delivered' | 'canceled') => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (!error) {
      toast.success('تم تحديث حالة الطلب')
      
      // Track analytics for delivered orders
      if (newStatus === 'delivered') {
        await trackAnalyticsEvent('order_delivered', { orderId })
      }
      
      loadOrders()
    } else {
      toast.error('فشل تحديث حالة الطلب')
    }
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

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">إدارة الطلبات</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="font-semibold">تصفية حسب الحالة:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg"
          >
            <option value="">جميع الطلبات</option>
            <option value="pending">قيد المعالجة</option>
            <option value="confirmed">مؤكد</option>
            <option value="delivered">تم التوصيل</option>
            <option value="canceled">ملغي</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">لا توجد طلبات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-right py-3 px-4">رقم الطلب</th>
                  <th className="text-right py-3 px-4">العميل</th>
                  <th className="text-right py-3 px-4">الهاتف</th>
                  <th className="text-right py-3 px-4">الولاية</th>
                  <th className="text-right py-3 px-4">الإجمالي</th>
                  <th className="text-right py-3 px-4">الحالة</th>
                  <th className="text-right py-3 px-4">التاريخ</th>
                  <th className="text-right py-3 px-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold">
                      <Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="py-3 px-4">{order.customer_name}</td>
                    <td className="py-3 px-4 ltr text-left">{order.customer_phone}</td>
                    <td className="py-3 px-4">{order.wilayas.name_ar}</td>
                    <td className="py-3 px-4 text-primary font-bold">
                      {order.total.toFixed(2)} دج
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                    <td className="py-3 px-4">
                      {new Date(order.created_at).toLocaleDateString('ar-DZ')}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                        className="px-3 py-1 border-2 border-gray-300 rounded text-sm"
                      >
                        <option value="pending">قيد المعالجة</option>
                        <option value="confirmed">مؤكد</option>
                        <option value="delivered">تم التوصيل</option>
                        <option value="canceled">ملغي</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
