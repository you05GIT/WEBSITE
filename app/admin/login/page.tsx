'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      console.log('Admin login - user authenticated:', data.user.id)

      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      console.log('Admin login - profile check:', { profile, profileError })

      if (profileError) {
        await supabase.auth.signOut()
        console.error('Profile error:', profileError)
        throw new Error('لم يتم العثور على ملف تعريف المستخدم. يرجى الاتصال بمسؤول النظام.')
      }

      if (!profile || profile.role !== 'admin') {
        await supabase.auth.signOut()
        throw new Error('غير مصرح لك بالدخول - حساب المشرف فقط')
      }

      console.log('Admin login - access granted')
      toast.success('تم تسجيل الدخول بنجاح')
      router.push('/admin')
    } catch (error: any) {
      console.error('Admin login error:', error)
      toast.error(error.message || 'فشل تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-center mb-8">
            تسجيل دخول المشرف
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block font-semibold mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-gray-300"
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
