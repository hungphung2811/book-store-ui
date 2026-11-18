import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const KEY = 'booknook.cart'
const MAX_QTY = 20
const Ctx = createContext(null)

const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }

// Mỗi dòng: { id (bookRef), title, author, price, coverImageUrl, quantity }. Giá chỉ để hiển thị: server tính lại khi đặt.
export function CartProvider({ children }) {
  const [lines, setLines] = useState(read)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(lines)) } catch { /* bỏ qua */ } }, [lines])

  const value = useMemo(() => ({
    lines,
    count: lines.reduce((n, l) => n + l.quantity, 0),
    total: lines.reduce((n, l) => n + l.price * l.quantity, 0),
    add: (book, quantity = 1) => setLines((ls) => {
      const found = ls.find((l) => l.id === book.bookRef)
      if (found) return ls.map((l) => (l === found ? { ...l, price: book.price, quantity: Math.min(MAX_QTY, l.quantity + quantity) } : l))
      return [...ls, { id: book.bookRef, title: book.title, author: book.author, price: book.price, coverImageUrl: book.coverImageUrl, quantity: Math.min(MAX_QTY, quantity) }]
    }),
    setQty: (id, quantity) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, quantity: Math.max(1, Math.min(MAX_QTY, quantity)) } : l))),
    remove: (id) => setLines((ls) => ls.filter((l) => l.id !== id)),
    clear: () => setLines([]),
  }), [lines])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useCart = () => useContext(Ctx)
