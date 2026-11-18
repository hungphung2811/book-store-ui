// Client cho customer-api (/public/**). Hợp đồng: docs/api/customer-api.md của hệ thống LMS.
export const SHOP_CODE = (import.meta.env.VITE_SHOP_CODE || 'demo').toLowerCase()
const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')
const SESSION_KEY = 'booknook.session'

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

// ---- phiên (bearer token, không cookie) ----
function loadSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) } catch { return null }
}
let memory = loadSession()
const listeners = new Set()
export function saveSession(s) {
  try {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s))
    else localStorage.removeItem(SESSION_KEY)
  } catch { /* trình duyệt chặn storage: phiên chỉ sống trong bộ nhớ */ }
  memory = s
  listeners.forEach((fn) => fn(s))
}
export const onSessionChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }
export const currentSession = () => memory

const shopPath = (p) => `${BASE}/public/t/${SHOP_CODE}${p}`

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

const tokens = (t) => ({
  accessToken: t.accessToken,
  refreshToken: t.refreshToken,
  expiresAt: Date.now() + (t.expiresIn || 300) * 1000,
})

let refreshing = null
function refresh() {
  const s = currentSession()
  if (!s?.refreshToken) return Promise.reject(new ApiError(401, 'UNAUTHORIZED', 'Phiên đã hết hạn'))
  // dùng chung một lời gọi refresh khi nhiều request cùng gặp 401
  refreshing ||= raw(shopPath('/auth/refresh'), { method: 'POST', body: { refreshToken: s.refreshToken } })
    .then((t) => { saveSession({ ...s, ...tokens(t) }); return currentSession() })
    .catch((e) => { saveSession(null); throw e })
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

const qs = (o) => {
  const p = new URLSearchParams()
  Object.entries(o).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '' && v !== false) p.set(k, v) })
  const s = p.toString()
  return s ? `?${s}` : ''
}

export const api = {
  shop: () => call(''),
  books: (q) => call(`/books${qs(q)}`),
  book: (id) => call(`/books/${id}`),
  suggestions: (q, limit = 5) => call(`/books/suggestions${qs({ q, limit })}`),
  banners: () => call('/banners'),
  async login(username, password) {
    const t = await call('/auth/login', { method: 'POST', body: { username, password } })
    saveSession({ username, ...tokens(t) })
  },
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
  cancelOrder: (id, reason) => call(`/orders/${id}/cancellation`, { method: 'POST', body: reason ? { reason } : {}, auth: true }),
}

export const formatVnd = (n) => `${Number(n || 0).toLocaleString('vi-VN')}đ`
