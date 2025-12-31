import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { getCartSessionId } from '@/lib/cart-session'
import { trackAnalyticsEvent } from '@/lib/analytics'

export interface CartItem {
  id: string
  productId: string
  productName: string
  variantItemId?: string
  variantName?: string
  quantity: number
  price: number
  imageUrl?: string
  stockQuantity: number
}

interface CartStore {
  items: CartItem[]
  loading: boolean
  cartId: string | null
  
  // Actions
  loadCart: () => Promise<void>
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  getSubtotal: () => number
  mergeGuestCart: (userId: string) => Promise<void>
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  loading: false,
  cartId: null,

  loadCart: async () => {
    set({ loading: true })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      let cart
      if (user) {
        // Load user cart
        const { data } = await supabase
          .from('carts')
          .select('id')
          .eq('user_id', user.id)
          .single()
        cart = data
        
        if (!cart) {
          // Create cart for user
          const { data: newCart } = await supabase
            .from('carts')
            .insert({ user_id: user.id })
            .select('id')
            .single()
          cart = newCart
        }
      } else {
        // Load guest cart
        const sessionId = getCartSessionId()
        const { data } = await supabase
          .from('carts')
          .select('id')
          .eq('session_id', sessionId)
          .single()
        cart = data
        
        if (!cart) {
          // Create guest cart
          const { data: newCart } = await supabase
            .from('carts')
            .insert({ session_id: sessionId })
            .select('id')
            .single()
          cart = newCart
        }
      }
      
      if (cart) {
        set({ cartId: cart.id })
        
        // Load cart items with product details
        const { data: cartItems } = await supabase
          .from('cart_items')
          .select(`
            id,
            quantity,
            price,
            product_id,
            variant_item_id,
            products (
              name_ar,
              image_url,
              stock_quantity,
              price
            ),
            variant_items (
              name_ar,
              image_url,
              stock_quantity,
              price
            )
          `)
          .eq('cart_id', cart.id)
        
        const items: CartItem[] = (cartItems || []).map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          productName: item.products.name_ar,
          variantItemId: item.variant_item_id,
          variantName: item.variant_items?.name_ar,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.variant_items?.image_url || item.products.image_url,
          stockQuantity: item.variant_items?.stock_quantity || item.products.stock_quantity,
        }))
        
        set({ items })
      }
    } catch (error) {
      console.error('Error loading cart:', error)
    } finally {
      set({ loading: false })
    }
  },

  addItem: async (newItem) => {
    const { cartId, items } = get()
    
    try {
      // Check if item already exists
      const existingItem = items.find(
        item => item.productId === newItem.productId && 
        item.variantItemId === newItem.variantItemId
      )
      
      if (existingItem) {
        // Update quantity
        await get().updateQuantity(existingItem.id, existingItem.quantity + newItem.quantity)
      } else {
        // Add new item
        const { data } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cartId,
            product_id: newItem.productId,
            variant_item_id: newItem.variantItemId,
            quantity: newItem.quantity,
            price: newItem.price,
          })
          .select()
          .single()
        
        if (data) {
          set({
            items: [...items, {
              id: data.id,
              ...newItem,
            }]
          })
          
          // Track analytics
          await trackAnalyticsEvent('add_to_cart', {
            productId: newItem.productId,
            variantItemId: newItem.variantItemId,
            sessionId: getCartSessionId(),
          })
        }
      }
    } catch (error) {
      console.error('Error adding item to cart:', error)
      throw error
    }
  },

  updateQuantity: async (itemId, quantity) => {
    if (quantity <= 0) {
      await get().removeItem(itemId)
      return
    }
    
    try {
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
      
      set({
        items: get().items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      })
    } catch (error) {
      console.error('Error updating quantity:', error)
      throw error
    }
  },

  removeItem: async (itemId) => {
    try {
      await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
      
      set({
        items: get().items.filter(item => item.id !== itemId)
      })
    } catch (error) {
      console.error('Error removing item:', error)
      throw error
    }
  },

  clearCart: async () => {
    const { cartId } = get()
    
    try {
      if (cartId) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', cartId)
      }
      
      set({ items: [] })
    } catch (error) {
      console.error('Error clearing cart:', error)
      throw error
    }
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  },

  mergeGuestCart: async (userId: string) => {
    const sessionId = getCartSessionId()
    
    try {
      await supabase.rpc('merge_guest_cart_to_user', {
        p_session_id: sessionId,
        p_user_id: userId,
      })
      
      // Reload cart
      await get().loadCart()
    } catch (error) {
      console.error('Error merging guest cart:', error)
    }
  },
}))
