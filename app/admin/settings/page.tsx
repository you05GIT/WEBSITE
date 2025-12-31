'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { CldUploadWidget } from 'next-cloudinary'

export default function AdminSettingsPage() {
  const [storeSettings, setStoreSettings] = useState({
    storeName: '',
    storeLogoUrl: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
  })

  const [homeContent, setHomeContent] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroDescription: '',
    ctaText: '',
    sectionVisible: true,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)

    // Load store settings
    const { data: settings } = await supabase
      .from('store_settings')
      .select('*')
      .single()

    if (settings) {
      setStoreSettings({
        storeName: settings.store_name,
        storeLogoUrl: settings.store_logo_url || '',
        primaryColor: settings.primary_color,
        secondaryColor: settings.secondary_color,
      })
    }

    // Load home page content
    const { data: content } = await supabase
      .from('home_page_content')
      .select('*')
      .single()

    if (content) {
      setHomeContent({
        heroTitle: content.hero_title,
        heroSubtitle: content.hero_subtitle,
        heroDescription: content.hero_description,
        ctaText: content.cta_text,
        sectionVisible: content.section_visible,
      })
    }

    setLoading(false)
  }

  const saveStoreSettings = async () => {
    const { error } = await supabase
      .from('store_settings')
      .update({
        store_name: storeSettings.storeName,
        store_logo_url: storeSettings.storeLogoUrl,
        primary_color: storeSettings.primaryColor,
        secondary_color: storeSettings.secondaryColor,
      })
      .eq('id', (await supabase.from('store_settings').select('id').single()).data?.id)

    if (!error) {
      toast.success('تم حفظ إعدادات المتجر')
    } else {
      toast.error('فشل حفظ الإعدادات')
    }
  }

  const saveHomeContent = async () => {
    const { error } = await supabase
      .from('home_page_content')
      .update({
        hero_title: homeContent.heroTitle,
        hero_subtitle: homeContent.heroSubtitle,
        hero_description: homeContent.heroDescription,
        cta_text: homeContent.ctaText,
        section_visible: homeContent.sectionVisible,
      })
      .eq('id', (await supabase.from('home_page_content').select('id').single()).data?.id)

    if (!error) {
      toast.success('تم حفظ محتوى الصفحة الرئيسية')
    } else {
      toast.error('فشل حفظ المحتوى')
    }
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
      <h1 className="text-4xl font-bold">إعدادات المتجر</h1>

      {/* Store Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">إعدادات عامة</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-2">اسم المتجر</label>
            <input
              type="text"
              value={storeSettings.storeName}
              onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">شعار المتجر</label>
            {storeSettings.storeLogoUrl && (
              <img
                src={storeSettings.storeLogoUrl}
                alt="Logo"
                className="w-32 h-32 object-cover rounded-lg mb-2"
              />
            )}
            <CldUploadWidget
              uploadPreset="wholesale_store"
              onSuccess={(result: any) => {
                setStoreSettings({ ...storeSettings, storeLogoUrl: result.info.secure_url })
              }}
            >
              {({ open }) => (
                <button
                  onClick={() => open()}
                  className="bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg"
                >
                  رفع شعار جديد
                </button>
              )}
            </CldUploadWidget>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2">اللون الأساسي</label>
              <input
                type="color"
                value={storeSettings.primaryColor}
                onChange={(e) => setStoreSettings({ ...storeSettings, primaryColor: e.target.value })}
                className="w-full h-12 border-2 border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">اللون الثانوي</label>
              <input
                type="color"
                value={storeSettings.secondaryColor}
                onChange={(e) => setStoreSettings({ ...storeSettings, secondaryColor: e.target.value })}
                className="w-full h-12 border-2 border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <button
            onClick={saveStoreSettings}
            className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg"
          >
            حفظ إعدادات المتجر
          </button>
        </div>
      </div>

      {/* Home Page Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">محتوى الصفحة الرئيسية</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-2">العنوان الرئيسي</label>
            <input
              type="text"
              value={homeContent.heroTitle}
              onChange={(e) => setHomeContent({ ...homeContent, heroTitle: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">العنوان الفرعي</label>
            <input
              type="text"
              value={homeContent.heroSubtitle}
              onChange={(e) => setHomeContent({ ...homeContent, heroSubtitle: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">الوصف</label>
            <textarea
              value={homeContent.heroDescription}
              onChange={(e) => setHomeContent({ ...homeContent, heroDescription: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">نص زر الدعوة لاتخاذ إجراء</label>
            <input
              type="text"
              value={homeContent.ctaText}
              onChange={(e) => setHomeContent({ ...homeContent, ctaText: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={homeContent.sectionVisible}
                onChange={(e) => setHomeContent({ ...homeContent, sectionVisible: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="font-semibold">إظهار القسم الرئيسي</span>
            </label>
          </div>

          <button
            onClick={saveHomeContent}
            className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg"
          >
            حفظ محتوى الصفحة الرئيسية
          </button>
        </div>
      </div>

      {/* Delivery Prices */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">أسعار التوصيل</h2>
        <p className="text-gray-600 mb-4">
          لتعديل أسعار التوصيل لكل ولاية، يمكنك تحديث البيانات مباشرة في قاعدة البيانات Supabase.
        </p>
        <a
          href={process.env.NEXT_PUBLIC_SUPABASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-secondary hover:bg-secondary/90 text-white font-bold py-3 px-6 rounded-lg"
        >
          فتح Supabase Dashboard
        </a>
      </div>
    </div>
  )
}
