'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Category {
  id: string
  name_ar: string
  name_fr: string | null
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean
  display_order: number
  created_at: string
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name_ar: '',
    name_fr: '',
    slug: '',
    description: '',
    image_url: '',
    display_order: 0,
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('display_order')

    if (data) {
      setCategories(data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name_ar.trim()) {
      toast.error('الاسم بالعربية مطلوب')
      return
    }

    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({
            name_ar: formData.name_ar,
            name_fr: formData.name_fr || null,
            slug: formData.slug || null, // Auto-generate if empty
            description: formData.description || null,
            image_url: formData.image_url || null,
            display_order: formData.display_order,
          })
          .eq('id', editingCategory.id)

        if (error) throw error
        toast.success('تم تحديث الفئة بنجاح')
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert([{
            name_ar: formData.name_ar,
            name_fr: formData.name_fr || null,
            slug: formData.slug || null, // Auto-generate if empty
            description: formData.description || null,
            image_url: formData.image_url || null,
            display_order: formData.display_order,
            is_active: true,
          }])

        if (error) throw error
        toast.success('تم إضافة الفئة بنجاح')
      }

      resetForm()
      loadCategories()
    } catch (error: any) {
      console.error('Error saving category:', error)
      toast.error(error.message || 'فشل حفظ الفئة')
    }
  }

  const resetForm = () => {
    setFormData({
      name_ar: '',
      name_fr: '',
      slug: '',
      description: '',
      image_url: '',
      display_order: 0,
    })
    setEditingCategory(null)
    setShowForm(false)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name_ar: category.name_ar,
      name_fr: category.name_fr || '',
      slug: category.slug || '',
      description: category.description || '',
      image_url: category.image_url || '',
      display_order: category.display_order,
    })
    setShowForm(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟ سيتم حذف جميع المنتجات المرتبطة بها.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)

      if (error) throw error
      toast.success('تم حذف الفئة بنجاح')
      loadCategories()
    } catch (error: any) {
      console.error('Error deleting category:', error)
      toast.error(error.message || 'فشل حذف الفئة')
    }
  }

  const toggleStatus = async (categoryId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !currentStatus })
        .eq('id', categoryId)

      if (error) throw error
      toast.success('تم تحديث حالة الفئة')
      loadCategories()
    } catch (error: any) {
      console.error('Error toggling status:', error)
      toast.error('فشل تحديث حالة الفئة')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">إدارة الفئات</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold"
        >
          {showForm ? 'إلغاء' : '+ إضافة فئة جديدة'}
        </button>
      </div>

      {/* Category Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">
            {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  الاسم بالعربية <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  الاسم بالفرنسية
                </label>
                <input
                  type="text"
                  value={formData.name_fr}
                  onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Slug (اختياري - يتم التوليد تلقائياً)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                  placeholder="phone-accessories"
                />
                <p className="text-xs text-gray-500 mt-1">
                  استخدم حروف إنجليزية صغيرة وشرطات فقط. إذا تركته فارغاً سيتم التوليد تلقائياً
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  ترتيب العرض
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                الوصف
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                رابط الصورة
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white px-8 py-2 rounded-lg font-semibold"
              >
                {editingCategory ? 'تحديث' : 'إضافة'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-8 py-2 rounded-lg font-semibold"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">لا توجد فئات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-right py-3 px-4">الترتيب</th>
                  <th className="text-right py-3 px-4">الاسم بالعربية</th>
                  <th className="text-right py-3 px-4">الاسم بالفرنسية</th>
                  <th className="text-right py-3 px-4">Slug</th>
                  <th className="text-right py-3 px-4">الحالة</th>
                  <th className="text-right py-3 px-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">{category.display_order}</td>
                    <td className="py-3 px-4 font-semibold">{category.name_ar}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {category.name_fr || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 font-mono">
                      {category.slug}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleStatus(category.id, category.is_active)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          category.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {category.is_active ? 'نشط' : 'معطل'}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/category/${category.slug}`}
                          target="_blank"
                          className="text-purple-600 hover:text-purple-800"
                        >
                          عرض
                        </Link>
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          حذف
                        </button>
                      </div>
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
