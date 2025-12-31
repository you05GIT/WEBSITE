import { randomUUID } from 'crypto'

const CART_SESSION_KEY = 'cart_session_id'

export function getCartSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  let sessionId = localStorage.getItem(CART_SESSION_KEY)
  
  if (!sessionId) {
    sessionId = randomUUID()
    localStorage.setItem(CART_SESSION_KEY, sessionId)
  }
  
  return sessionId
}

export function clearCartSessionId(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CART_SESSION_KEY)
}

