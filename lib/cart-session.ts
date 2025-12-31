import { v4 as uuidv4 } from 'uuid'

const CART_SESSION_KEY = 'cart_session_id'

export function getCartSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  let sessionId = localStorage.getItem(CART_SESSION_KEY)
  
  if (!sessionId) {
    sessionId = uuidv4()
    localStorage.setItem(CART_SESSION_KEY, sessionId)
  }
  
  return sessionId
}

export function clearCartSessionId(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CART_SESSION_KEY)
}

