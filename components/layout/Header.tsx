'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useStoreSettings } from '@/store/settings'
import { useCartStore } from '@/store/cart'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function Header() {
  const { settings, loadSettings } = useStoreSettings()
  const { items, loadCart } = useCartStore()
  const router = useRouter()

  useEffect(() => {
    loadSettings()
    loadCart()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        loadCart()
        toast.success('تم تسجيل الدخول بنجاح')
      } else if (event === 'SIGNED_OUT') {
        loadCart()
        toast.success('تم تسجيل الخروج بنجاح')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Store Name */}
          <Link href="/" className="flex items-center gap-3">
            {settings?.storeLogoUrl && (
              <Image
                src={settings.storeLogoUrl}
                alt={settings.storeName}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <span className="text-xl font-bold text-gray-900">
              {settings?.storeName || 'متجر الجملة'}
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-primary transition-colors"
            >
              الرئيسية
            </Link>
            <Link 
              href="/products" 
              className="text-gray-700 hover:text-primary transition-colors"
            >
              المنتجات
            </Link>
            <Link 
              href="/orders" 
              className="text-gray-700 hover:text-primary transition-colors"
            >
              طلباتي
            </Link>
          </nav>

          {/* Cart and Auth */}
          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <AuthButton />
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center gap-4 pb-3 border-t pt-3">
          <Link 
            href="/" 
            className="text-gray-700 hover:text-primary transition-colors text-sm"
          >
            الرئيسية
          </Link>
          <Link 
            href="/products" 
            className="text-gray-700 hover:text-primary transition-colors text-sm"
          >
            المنتجات
          </Link>
          <Link 
            href="/orders" 
            className="text-gray-700 hover:text-primary transition-colors text-sm"
          >
            طلباتي
          </Link>
        </nav>
      </div>
    </header>
  )
}

function AuthButton() {
  const router = useRouter()

  const handleAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Sign out
      await supabase.auth.signOut()
      router.push('/')
    } else {
      // Go to login
      router.push('/auth/login')
    }
  }

  return (
    <button
      onClick={handleAuth}
      className="text-sm bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
    >
      حسابي
    </button>
  )
}
