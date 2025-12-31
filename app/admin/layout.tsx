'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    console.log('AdminLayout - checking auth:', { user: user?.id, userError })

    if (userError || !user) {
      console.log('AdminLayout - no user, redirecting to login')
      router.push('/admin/login')
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('AdminLayout - profile check:', { profile, profileError })

    if (profileError) {
      console.error('AdminLayout - profile error:', profileError)
      toast.error('خطأ في التحقق من صلاحيات المستخدم')
      router.push('/admin/login')
      return
    }

    if (!profile || profile.role !== 'admin') {
      console.log('AdminLayout - not admin, redirecting')
      toast.error('غير مصرح لك بالدخول')
      router.push('/')
      return
    }

    console.log('AdminLayout - admin access granted')
    setIsAdmin(true)
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-primary">لوحة التحكم</h1>
            
            <nav className="flex items-center gap-6">
              <Link href="/admin" className="text-gray-700 hover:text-primary">
                الرئيسية
              </Link>
              <Link href="/admin/products" className="text-gray-700 hover:text-primary">
                المنتجات
              </Link>
              <Link href="/admin/orders" className="text-gray-700 hover:text-primary">
                الطلبات
              </Link>
              <Link href="/admin/settings" className="text-gray-700 hover:text-primary">
                الإعدادات
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                تسجيل الخروج
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
