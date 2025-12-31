'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useStoreSettings } from '@/store/settings'
import { trackAnalyticsEvent } from '@/lib/analytics'

export default function HomePage() {
  const { settings, homeContent, loadSettings, loadHomeContent } = useStoreSettings()

  useEffect(() => {
    loadSettings()
    loadHomeContent()
    trackAnalyticsEvent('page_view')
  }, [])

  if (!settings || !homeContent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {homeContent.sectionVisible && (
        <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              {settings.storeLogoUrl && (
                <div className="mb-8 flex justify-center">
                  <Image
                    src={settings.storeLogoUrl}
                    alt={settings.storeName}
                    width={120}
                    height={120}
                    className="rounded-full"
                  />
                </div>
              )}
              
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                {homeContent.heroTitle}
              </h1>
              
              <h2 className="text-3xl text-primary font-semibold mb-6">
                {homeContent.heroSubtitle}
              </h2>
              
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                {homeContent.heroDescription}
              </p>
              
              <Link
                href="/products"
                className="inline-block bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
              >
                {homeContent.ctaText}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">أسعار الجملة</h3>
              <p className="text-gray-600">أفضل الأسعار للشراء بالكميات الكبيرة</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">توصيل لجميع الولايات</h3>
              <p className="text-gray-600">نوصل إلى كل ولايات الجزائر ال 58</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">جودة مضمونة</h3>
              <p className="text-gray-600">منتجات عالية الجودة ومضمونة</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-secondary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">ابدأ التسوق الآن</h2>
          <p className="text-xl mb-8">اكتشف مجموعتنا الواسعة من إكسسوارات الهواتف</p>
          <Link
            href="/products"
            className="inline-block bg-white text-primary hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            عرض المنتجات
          </Link>
        </div>
      </section>
    </div>
  )
}
