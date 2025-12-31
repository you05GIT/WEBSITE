'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/store/cart'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const router = useRouter()
  const { mergeGuestCart } = useCartStore()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Sign up user
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      if (data.user) {
        // Create user profile
        await supabase.from('user_profiles').insert({
          id: data.user.id,
          role: 'customer',
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
        })

        // Merge guest cart
        await mergeGuestCart(data.user.id)

        toast.success('تم إنشاء الحساب بنجاح')
        router.push('/')
      }
    } catch (error: any) {
      toast.error(error.message || 'فشل إنشاء الحساب')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-center mb-8">إنشاء حساب جديد</h2>

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block font-semibold mb-2">الاسم الكامل</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">رقم الهاتف</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                placeholder="0555123456"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">كلمة المرور</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary outline-none"
              />
              <p className="text-sm text-gray-500 mt-1">على الأقل 6 أحرف</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-gray-300"
            >
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              لديك حساب بالفعل؟{' '}
              <Link href="/auth/login" className="text-primary hover:underline font-semibold">
                تسجيل الدخول
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              العودة إلى الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
