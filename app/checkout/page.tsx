'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/store/cart'
import { trackAnalyticsEvent } from '@/lib/analytics'
import { getCartSessionId } from '@/lib/cart-session'
import toast from 'react-hot-toast'

interface Wilaya {
  id: number
  code: string
  name_ar: string
  name_fr: string
  delivery_price: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getSubtotal, clearCart } = useCartStore()

  const [wilayas, setWilayas] = useState<Wilaya[]>([])
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    wilayaId: '',
    commune: '',
    address: '',
    notes: '',
  })

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
      return
    }
    
    loadWilayas()
    loadUserData()
    trackAnalyticsEvent('checkout_started', { sessionId: getCartSessionId() })
  }, [])

  const loadWilayas = async () => {
    const { data } = await supabase
      .from('wilayas')
      .select('*')
      .order('name_ar')
    
    if (data) setWilayas(data)
  }

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name, phone_number')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        setFormData(prev => ({
          ...prev,
          customerName: profile.full_name || '',
          customerPhone: profile.phone_number || '',
        }))
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const selectedWilaya = wilayas.find(w => w.id === parseInt(formData.wilayaId))
  const subtotal = getSubtotal()
  const deliveryPrice = selectedWilaya?.delivery_price || 0
  const total = subtotal + deliveryPrice

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customerName || !formData.customerPhone || !formData.wilayaId || !formData.commune || !formData.address) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          customer_name: formData.customerName,
          customer_phone: formData.customerPhone,
          wilaya_id: parseInt(formData.wilayaId),
          commune: formData.commune,
          address: formData.address,
          delivery_price: deliveryPrice,
          subtotal: subtotal,
          total: total,
          notes: formData.notes || null,
          status: 'pending',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        variant_item_id: item.variantItemId || null,
        product_name: item.productName,
        variant_name: item.variantName || null,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Track analytics
      await trackAnalyticsEvent('order_placed', {
        orderId: order.id,
        sessionId: getCartSessionId(),
      })

      // Clear cart
      await clearCart()

      // Redirect to confirmation page
      router.push(`/orders/${order.id}/confirmation`)
      toast.success('تم إنشاء الطلب بنجاح')
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('حدث خطأ أثناء إنشاء الطلب')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">إتمام الطلب</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">معلومات العميل</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">الاسم الكامل *</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">رقم الهاتف *</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  required
                  placeholder="0555123456"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary outline-none"
                />
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">معلومات التوصيل</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">الولاية *</label>
                <select
                  name="wilayaId"
                  value={formData.wilayaId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary outline-none"
                >
                  <option value="">اختر الولاية</option>
                  {wilayas.map(wilaya => (
                    <option key={wilaya.id} value={wilaya.id}>
                      {wilaya.code} - {wilaya.name_ar} ({wilaya.delivery_price.toFixed(2)} دج)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2">البلدية *</label>
                <input
                  type="text"
                  name="commune"
                  value={formData.commune}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">العنوان الكامل *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">ملاحظات (اختياري)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="أي ملاحظات إضافية للطلب"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg transition-colors disabled:bg-gray-300"
          >
            {loading ? 'جاري إنشاء الطلب...' : 'تأكيد الطلب'}
          </button>
        </form>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-2xl font-bold mb-6">ملخص الطلب</h2>

            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="flex-1">
                    {item.productName}
                    {item.variantName && ` - ${item.variantName}`}
                    <span className="text-gray-500"> × {item.quantity}</span>
                  </span>
                  <span className="font-semibold">
                    {(item.price * item.quantity).toFixed(2)} دج
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">المجموع الفرعي</span>
                <span className="font-semibold">{subtotal.toFixed(2)} دج</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">رسوم التوصيل</span>
                <span className="font-semibold">
                  {selectedWilaya ? `${deliveryPrice.toFixed(2)} دج` : '-'}
                </span>
              </div>

              <div className="border-t pt-3 flex justify-between items-center text-xl font-bold">
                <span>الإجمالي</span>
                <span className="text-primary">{total.toFixed(2)} دج</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-secondary/10 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <div className="font-semibold mb-1">الدفع عند الاستلام</div>
                  <div className="text-gray-600">ادفع نقداً عند استلام الطلب</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
