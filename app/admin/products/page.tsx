'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name_ar: string
  is_active: boolean
}

interface Product {
  id: string
  name_ar: string
  has_variants: boolean
  price: number | null
  stock_quantity: number | null
  is_active: boolean
  image_url: string | null
  categories: {
    name_ar: string
  }
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  useEffect(() => {
    loadCategories()
    loadProducts()
  }, [selectedCategory])

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name_ar')
    
    if (data) setCategories(data)
  }

  const loadProducts = async () => {
    setLoading(true)
    let query = supabase
      .from('products')
      .select(`
        *,
        categories (
          name_ar
        )
      `)
      .order('created_at', { ascending: false })

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory)
    }

    const { data } = await query
    if (data) setProducts(data)
    setLoading(false)
  }

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !currentStatus })
      .eq('id', productId)

    if (!error) {
      toast.success('تم تحديث حالة المنتج')
      loadProducts()
    } else {
      toast.error('فشل تحديث حالة المنتج')
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (!error) {
      toast.success('تم حذف المنتج')
      loadProducts()
    } else {
      toast.error('فشل حذف المنتج')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">إدارة المنتجات</h1>
        <div className="flex gap-4">
          <Link
            href="/admin/categories"
            className="bg-secondary hover:bg-secondary/90 text-white px-6 py-3 rounded-lg font-semibold"
          >
            إدارة الفئات
          </Link>
          <Link
            href="/admin/products/new"
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold"
          >
            + إضافة منتج جديد
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="font-semibold">تصفية حسب الفئة:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg"
          >
            <option value="">جميع الفئات</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name_ar}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">لا توجد منتجات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-right py-3 px-4">الصورة</th>
                  <th className="text-right py-3 px-4">اسم المنتج</th>
                  <th className="text-right py-3 px-4">الفئة</th>
                  <th className="text-right py-3 px-4">السعر</th>
                  <th className="text-right py-3 px-4">المخزون</th>
                  <th className="text-right py-3 px-4">الحالة</th>
                  <th className="text-right py-3 px-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="w-16 h-16 relative bg-gray-100 rounded">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name_ar}
                            fill
                            className="object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold">{product.name_ar}</td>
                    <td className="py-3 px-4">{product.categories.name_ar}</td>
                    <td className="py-3 px-4">
                      {product.has_variants ? (
                        <span className="text-gray-500">متعدد</span>
                      ) : product.price ? (
                        <span className="text-primary font-bold">{product.price.toFixed(2)} دج</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {product.has_variants ? (
                        <span className="text-gray-500">متعدد</span>
                      ) : (
                        <span>{product.stock_quantity || 0}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleProductStatus(product.id, product.is_active)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          product.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.is_active ? 'نشط' : 'معطل'}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          تعديل
                        </Link>
                        {product.has_variants && (
                          <Link
                            href={`/admin/products/${product.id}/variants`}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            الأنواع
                          </Link>
                        )}
                        <button
                          onClick={() => deleteProduct(product.id)}
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
