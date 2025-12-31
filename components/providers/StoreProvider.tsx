'use client'

import { useEffect } from 'react'
import { useStoreSettings } from '@/store/settings'
import { useCartStore } from '@/store/cart'

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const { loadSettings } = useStoreSettings()
  const { loadCart } = useCartStore()

  useEffect(() => {
    loadSettings()
    loadCart()
  }, [])

  return <>{children}</>
}
