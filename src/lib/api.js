// Client cho customer-api (/public/**). Hợp đồng: docs/api/customer-api.md của hệ thống LMS.
import { useSessionStore } from './stores'

export const SHOP_CODE = (import.meta.env.VITE_SHOP_CODE || 'demo').toLowerCase()
const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

// ---- phiên (bearer token, không cookie) ----
// Phiên nằm trong store zustand (stores.js), tự lưu localStorage và đồng bộ giữa các tab.
export const currentSession = () => useSessionStore.getState().session
export const saveSession = (s) => useSessionStore.getState().setSession(s)

async function raw(url, { method = 'GET', body, token } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  let res
  try {
    res = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  } catch {
    throw new ApiError(0, 'NETWORK', 'Không kết nối được máy chủ, vui lòng thử lại sau.')
  }
  const text = res.status === 204 ? '' : await res.text()
  let data = null
  if (text) { try { data = JSON.parse(text) } catch { /* thân không phải JSON */ } }
  if (!res.ok) {
    if (res.status === 429 && !data?.code) {
      throw new ApiError(429, 'RATE_LIMITED', 'Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút.')
    }
    throw new ApiError(res.status, data?.code || 'ERROR', data?.message || 'Có lỗi xảy ra, vui lòng thử lại.', data?.details)
  }
  return data
}

let refreshing = null
function refresh() {
  const s = currentSession()
  if (!s?.refreshToken) return Promise.reject(new ApiError(401, 'UNAUTHORIZED', 'Phiên đã hết hạn'))
  // dùng chung một lời gọi refresh khi nhiều request cùng gặp 401
  refreshing ||= raw(shopPath('/auth/refresh'), { method: 'POST', body: { refreshToken: s.refreshToken } })
    .then((t) => { saveSession({ ...s, ...tokens(t) }); return currentSession() })
    .catch((e) => {
      // Tab khác vừa xoay vòng token: dùng phiên mới họ đã lưu thay vì đăng xuất người dùng
      const latest = currentSession()
      if (e.code === 'REFRESH_TOKEN_SUPERSEDED' && latest && latest.refreshToken !== s.refreshToken) return latest
      saveSession(null)
      throw e
    })
    .finally(() => { refreshing = null })
  return refreshing
}

async function call(path, opts = {}) {
  if (!opts.auth) return raw(shopPath(path), opts)
  let s = currentSession()
  if (!s) throw new ApiError(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.')
  if (s.expiresAt && s.expiresAt - Date.now() < 15000) s = await refresh()
  try {
    return await raw(shopPath(path), { ...opts, token: s.accessToken })
  } catch (e) {
    if (e.status !== 401) throw e
    s = await refresh()
    return raw(shopPath(path), { ...opts, token: s.accessToken })
  }
}

export const api = {
  shop: () => call(''),
  books: (q) => call(`/books${qs(q)}`),
  book: (id) => call(`/books/${id}`),
  preview: (id) => call(`/books/${id}/preview`),
  suggestions: (q, limit = 5) => call(`/books/suggestions${qs({ q, limit })}`),
  banners: () => call('/banners'),
  async login(username, password) {
    const t = await call('/auth/login', { method: 'POST', body: { username, password } })
    saveSession({ username, ...tokens(t) })
  },
  // Xác minh email bằng OTP 6 số (identity bật mặc định): đăng nhập khi chưa xác minh trả 403 EMAIL_NOT_VERIFIED
  verifyEmail: (b) => call('/auth/verify-email', { method: 'POST', body: b }),
  resendVerification: (b) => call('/auth/resend-verification', { method: 'POST', body: b }),
  signup: (b) => call('/auth/signup', { method: 'POST', body: b }),
  async logout() {
    const s = currentSession()
    saveSession(null)
    if (s?.refreshToken) {
      try { await call('/auth/logout', { method: 'POST', body: { refreshToken: s.refreshToken } }) } catch { /* đã xóa phiên phía client */ }
    }
  },
  placeOrder: (b) => call('/orders', { method: 'POST', body: b, auth: true }),
  orders: (page = 0, size = 20) => call(`/orders${qs({ page, size })}`, { auth: true }),
  // Số đơn: dùng GET /orders/count; backend chưa có endpoint này (404) thì lấy `total` của trang đơn đầu.
  async orderCount() {
    try {
      return (await call('/orders/count', { auth: true })).total
    } catch (e) {
      if (e.status !== 404) throw e
      return (await call(`/orders${qs({ page: 0, size: 1 })}`, { auth: true })).total
    }
  },
  // 5 tác giả nổi bật (có sách mới và bán chạy 3 tháng gần nhất): [{ name }]
  featuredAuthors: () => call('/authors/featured'),
  // Sản phẩm nổi bật = bán chạy 3 tháng gần nhất (cùng dạng phần tử với books().items)
  featuredBooks: () => call('/books/featured'),
  // Thanh toán QR (SePay): lệnh thanh toán của đơn và các phương thức đang bật
  orderPayment: (id) => call(`/orders/${id}/payment`, { auth: true }),
  paymentOptions: () => call('/payment-options', { auth: true }),
  cancelOrder: (id, reason) => call(`/orders/${id}/cancellation`, { method: 'POST', body: reason ? { reason } : {}, auth: true }),
}

export const formatVnd = (n) => `${Number(n || 0).toLocaleString('vi-VN')}đ`

// ---- Hằng số, bảng nhãn và tiện ích ----

const shopPath = (p) => `${BASE}/public/t/${SHOP_CODE}${p}`

const tokens = (t) => ({
  accessToken: t.accessToken,
  refreshToken: t.refreshToken,
  expiresAt: Date.now() + (t.expiresIn || 300) * 1000,
})

const qs = (o) => {
  const p = new URLSearchParams()
  Object.entries(o).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '' && v !== false) p.set(k, v) })
  const s = p.toString()
  return s ? `?${s}` : ''
}

