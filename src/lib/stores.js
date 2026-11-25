// Trạng thái toàn cục (zustand): phiên đăng nhập và giỏ hàng. Cả hai lưu ở localStorage qua middleware persist.
// Không cần Provider nên không bị mất trạng thái khi Vite nạp lại module (lỗi `useAuth() is null`).
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Tổng số đơn của khách (lấy từ `total` của GET /orders, backend chưa có endpoint đếm riêng). Không lưu: luôn lấy mới.
export const useOrderCountStore = create((set) => ({
  total: null,
  setTotal: (total) => set({ total }),
}))

// session: { username, accessToken, refreshToken, expiresAt } hoặc null
export const useSessionStore = create(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
    }),
    { name: 'booknook.auth', partialize: (s) => ({ session: s.session }) },
  ),
)

// Mỗi dòng: { id (bookRef), title, author, price, coverImageUrl, quantity }. Giá chỉ để hiển thị: server tính lại khi đặt.
// Giỏ hàng theo tài khoản: carts[username] = các dòng. Chưa đăng nhập thì không có giỏ (xem cart.js).
// Đăng xuất không xóa giỏ, đăng nhập lại cùng tài khoản thì giỏ còn nguyên; tài khoản khác không thấy giỏ này.
export const useCartStore = create(
  persist(
    (set) => ({
      carts: {},
      add: (user, book, quantity = 1) => set(({ carts }) => mapLines(carts, user, (lines) => {
        const found = lines.find((l) => l.id === book.bookRef)
        if (found) {
          return lines.map((l) => (l === found ? { ...l, price: book.price, quantity: Math.min(MAX_QTY, l.quantity + quantity) } : l))
        }
        return [...lines, { id: book.bookRef, title: book.title, author: book.author, price: book.price, coverImageUrl: book.coverImageUrl, quantity: Math.min(MAX_QTY, quantity) }]
      })),
      setQty: (user, id, quantity) => set(({ carts }) => mapLines(carts, user, (lines) => lines.map((l) => (l.id === id ? { ...l, quantity: Math.max(1, Math.min(MAX_QTY, quantity)) } : l)))),
      remove: (user, id) => set(({ carts }) => mapLines(carts, user, (lines) => lines.filter((l) => l.id !== id))),
      clear: (user) => set(({ carts }) => mapLines(carts, user, () => [])),
    }),
    { name: 'booknook.cart.v3', partialize: (s) => ({ carts: s.carts }) },
  ),
)

// Đồng bộ giữa các tab: tab khác đổi localStorage thì nạp lại store ở tab này.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'booknook.auth' || e.key === null) useSessionStore.persist.rehydrate()
    if (e.key === 'booknook.cart.v3' || e.key === null) useCartStore.persist.rehydrate()
  })
}

// Popup đăng nhập/đăng ký/xác minh email (không lưu). onSuccess chạy sau khi đăng nhập xong (việc đang dở của khách).
export const useAuthModalStore = create((set) => ({
  open: false,
  view: 'login',
  onSuccess: null,
  show: (view = 'login', onSuccess = null) => set({ open: true, view, onSuccess }),
  setView: (view) => set({ view }),
  close: () => set({ open: false, onSuccess: null }),
}))

// ---- Hằng số, bảng nhãn và tiện ích ----

const MAX_QTY = 20

const mapLines = (carts, user, fn) => ({ carts: { ...carts, [user]: fn(carts[user] || []) } })
