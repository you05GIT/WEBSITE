'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

interface Stats {
  totalOrders: number
  totalRevenue: number
  totalItemsSold: number
  pendingOrders: number
  confirmedOrders: number
  deliveredOrders: number
}

interface BestSellingProduct {
  name_ar: string
  times_sold: number
  total_quantity_sold: number
  total_revenue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalItemsSold: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
  })
  const [bestProducts, setBestProducts] = useState<BestSellingProduct[]>([])
  const [revenueByWilaya, setRevenueByWilaya] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)

    // Load order stats
    const { data: orders } = await supabase
      .from('orders')
      .select('status, total')

    if (orders) {
      const stats = {
        totalOrders: orders.length,
        totalRevenue: orders.filter(o => o.status !== 'canceled').reduce((sum, o) => sum + o.total, 0),
        totalItemsSold: 0,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        confirmedOrders: orders.filter(o => o.status === 'confirmed').length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
      }
      setStats(stats)
    }

    // Load total items sold
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('quantity, orders!inner(status)')
      .neq('orders.status', 'canceled')

    if (orderItems) {
      const totalItems = orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0)
      setStats(prev => ({ ...prev, totalItemsSold: totalItems }))
    }

    // Load best selling products
    const { data: bestSelling } = await supabase
      .from('best_selling_products')
      .select('*')
      .limit(5)

    if (bestSelling) {
      setBestProducts(bestSelling)
    }

    // Load revenue by wilaya
    const { data: revenueData } = await supabase
      .from('revenue_by_wilaya')
      .select('*')
      .limit(10)

    if (revenueData) {
      setRevenueByWilaya(revenueData)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">لوحة التحكم</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي الطلبات"
          value={stats.totalOrders}
          icon="📦"
          color="bg-blue-500"
        />
        <StatCard
          title="إجمالي الإيرادات"
          value={`${stats.totalRevenue.toFixed(2)} دج`}
          icon="💰"
          color="bg-green-500"
        />
        <StatCard
          title="إجمالي المبيعات"
          value={stats.totalItemsSold}
          icon="📊"
          color="bg-purple-500"
        />
        <StatCard
          title="طلبات قيد المعالجة"
          value={stats.pendingOrders}
          icon="⏳"
          color="bg-yellow-500"
        />
      </div>

      {/* Order Status Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">حالة الطلبات</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</div>
            <div className="text-gray-600">قيد المعالجة</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.confirmedOrders}</div>
            <div className="text-gray-600">مؤكد</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.deliveredOrders}</div>
            <div className="text-gray-600">تم التوصيل</div>
          </div>
        </div>
      </div>

      {/* Best Selling Products */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">المنتجات الأكثر مبيعاً</h2>
        {bestProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 px-4">المنتج</th>
                  <th className="text-right py-3 px-4">عدد المبيعات</th>
                  <th className="text-right py-3 px-4">الكمية المباعة</th>
                  <th className="text-right py-3 px-4">الإيرادات</th>
                </tr>
              </thead>
              <tbody>
                {bestProducts.map((product, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold">{product.name_ar}</td>
                    <td className="py-3 px-4">{product.times_sold}</td>
                    <td className="py-3 px-4">{product.total_quantity_sold}</td>
                    <td className="py-3 px-4 text-primary font-bold">
                      {product.total_revenue.toFixed(2)} دج
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">لا توجد بيانات</p>
        )}
      </div>

      {/* Revenue by Wilaya */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">أعلى 10 ولايات في المبيعات</h2>
        {revenueByWilaya.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByWilaya}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="wilaya_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_revenue" fill="#3B82F6" name="الإيرادات (دج)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">لا توجد بيانات</p>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
