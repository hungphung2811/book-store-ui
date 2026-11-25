import { useMemo } from 'react'
import { useAuth } from './auth'
import { useCartStore, useSessionStore } from './stores'

const EMPTY = []

// Giỏ chỉ tồn tại khi đã đăng nhập: chưa đăng nhập thì lines rỗng và add() trả về false (nơi gọi chuyển sang trang đăng nhập).
export function useCart() {
  const { user } = useAuth()
  const username = user?.username
  const lines = useCartStore((s) => (username ? s.carts[username] : null)) || EMPTY
  const store = useCartStore

  return useMemo(() => {
    const { add, setQty, remove, clear } = store.getState()
    return {
      loggedIn: Boolean(username),
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      total: lines.reduce((n, l) => n + l.price * l.quantity, 0),
      add: (book, quantity) => { if (!username) return false; add(username, book, quantity); return true },
      setQty: (id, quantity) => username && setQty(username, id, quantity),
      remove: (id) => username && remove(username, id),
      clear: () => username && clear(username),
    }
  }, [username, lines, store])
}

// Thêm vào giỏ của người đang đăng nhập (đọc trạng thái mới nhất, dùng được trong callback sau khi đăng nhập xong).
// Trả về false khi chưa đăng nhập.
export function addToCart(book, quantity = 1) {
  const username = useSessionStore.getState().session?.username
  if (!username) return false
  useCartStore.getState().add(username, book, quantity)
  return true
}
