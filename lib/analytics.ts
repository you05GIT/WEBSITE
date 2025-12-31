import { supabase } from './supabase'

export async function trackAnalyticsEvent(
  eventType: 'page_view' | 'product_view' | 'add_to_cart' | 'cart_abandonment' | 'checkout_started' | 'order_placed' | 'order_delivered',
  data?: {
    productId?: string
    variantItemId?: string
    orderId?: string
    sessionId?: string
    metadata?: any
  }
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    await supabase.from('analytics_events').insert({
      event_type: eventType,
      user_id: user?.id || null,
      session_id: data?.sessionId || null,
      product_id: data?.productId || null,
      variant_item_id: data?.variantItemId || null,
      order_id: data?.orderId || null,
      metadata: data?.metadata || null,
    })
  } catch (error) {
    console.error('Analytics tracking error:', error)
  }
}
