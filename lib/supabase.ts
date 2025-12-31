import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          role: 'customer' | 'admin'
          full_name: string | null
          phone_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'customer' | 'admin'
          full_name?: string | null
          phone_number?: string | null
        }
        Update: {
          role?: 'customer' | 'admin'
          full_name?: string | null
          phone_number?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name_ar: string
          name_fr: string | null
          description: string | null
          image_url: string | null
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
      }
      products: {
        Row: {
          id: string
          category_id: string
          name_ar: string
          name_fr: string | null
          description: string | null
          image_url: string | null
          is_active: boolean
          has_variants: boolean
          price: number | null
          stock_quantity: number | null
          created_at: string
          updated_at: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          name_ar: string
          name_fr: string | null
          display_order: number
          created_at: string
          updated_at: string
        }
      }
      variant_items: {
        Row: {
          id: string
          variant_id: string
          name_ar: string
          name_fr: string | null
          description: string | null
          price: number
          stock_quantity: number
          image_url: string | null
          sku: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      wilayas: {
        Row: {
          id: number
          code: string
          name_ar: string
          name_fr: string
          delivery_price: number
          created_at: string
          updated_at: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          customer_name: string
          customer_phone: string
          wilaya_id: number
          commune: string
          address: string
          delivery_price: number
          subtotal: number
          total: number
          status: 'pending' | 'confirmed' | 'delivered' | 'canceled'
          notes: string | null
          created_at: string
          confirmed_at: string | null
          delivered_at: string | null
          canceled_at: string | null
          updated_at: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          variant_item_id: string | null
          product_name: string
          variant_name: string | null
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
      }
      store_settings: {
        Row: {
          id: string
          store_name: string
          store_logo_url: string | null
          primary_color: string
          secondary_color: string
          created_at: string
          updated_at: string
        }
      }
      home_page_content: {
        Row: {
          id: string
          hero_title: string
          hero_subtitle: string
          hero_description: string
          cta_text: string
          section_visible: boolean
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
