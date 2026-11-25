import { useCallback, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import LoginPrompt from '../components/auth/LoginPrompt'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Dialog from '../components/ui/Dialog'
import Input from '../components/ui/Input'
import RequiredMark from '../components/ui/RequiredMark'
import Select from '../components/ui/Select'
import { fulfilmentLabel, methodLabel } from '../components/StatusBadge'
import { terms } from '../data/content'
import { api, formatVnd } from '../lib/api'
import { useAuth } from '../lib/auth'
import { useCart } from '../lib/cart'
import { useAuthModalStore } from '../lib/stores'
import { useAsync } from '../lib/hooks'

export default function Checkout() {
  const { user } = useAuth()
  const { lines, total, clear } = useCart()
  const navigate = useNavigate()
  const [fulfilment, setFulfilment] = useState('PICKUP')
  const [method, setMethod] = useState('BANK_TRANSFER')
  // Lỗi/chưa có API thì dùng danh sách tĩnh ở trên
  const options = useAsync(() => api.paymentOptions().catch(() => null), []).data
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  // Khách phải tích đồng ý điều khoản mới đặt được (chỉ kiểm ở FE: API đặt hàng chưa có trường đồng ý điều khoản)
  const [agreed, setAgreed] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const closeTerms = useCallback(() => setShowTerms(false), [])
  // Một khóa cho mỗi lần đặt: bấm lại/mạng lỗi gửi lại thì server trả đơn cũ thay vì tạo đơn trùng.
  const requestId = useRef(crypto.randomUUID())
  // Đặt xong giỏ bị xóa: không được tự đẩy về /cart đè lên việc chuyển sang /my-orders.
  const placed = useRef(false)

  if (!user) return <LoginPrompt />
  if (lines.length === 0 && !placed.current) return <Navigate to="/cart" replace />

  const methods = methodsFor(fulfilment, options)
  const field = (k) => ({ name: k, value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) })
  const changeFulfilment = (f) => {
    setFulfilment(f)
    if (!methodsFor(f, options).includes(method)) setMethod(methodsFor(f, options)[0] || 'BANK_TRANSFER')
  }
  const payOnline = method === 'SEPAY'
  const ttl = options?.methods?.find((m) => m.method === 'SEPAY')?.intentTtlMinutes

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!agreed) { setError('Vui lòng đồng ý với điều khoản mua hàng để đặt đơn.'); return }
    if (fulfilment === 'DELIVERY' && !form.address.trim()) { setError('Vui lòng nhập địa chỉ giao hàng.'); return }
    setBusy(true)
    try {
      const order = await api.placeOrder({
        lines: lines.map((l) => ({ titleId: l.id, quantity: l.quantity })),
        fulfilment,
        paymentMethod: method,
        recipient: { name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim() },
        clientRequestId: requestId.current,
      })
      requestId.current = crypto.randomUUID()
      placed.current = true
      // Thanh toán QR: sang trang quét mã (đơn đang chờ thanh toán); các phương thức khác về danh sách đơn
      if (payOnline && order?.id) navigate(`/orders/${order.id}/payment`)
      else navigate('/my-orders', { state: { placed: true } })
      clear()
    } catch (err) {
      if (err.code === 'INSUFFICIENT_STOCK') {
        const bad = lines.find((l) => l.id === err.details?.titleId)
        setError(`${bad ? `“${bad.title}”` : 'Một cuốn sách'} không đủ số lượng, vui lòng giảm số lượng hoặc bỏ khỏi giỏ.`)
      } else if (err.code === 'TITLE_NOT_AVAILABLE') {
        setError('Có sách trong giỏ hiện không còn bán, vui lòng kiểm tra lại giỏ hàng.')
      } else if (err.status === 401) {
        useAuthModalStore.getState().show('login')
      } else {
        // lỗi khác giữ nguyên khóa: bấm lại là thử lại cùng một đơn
        setError(err.message)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-4xl">Đặt hàng</h1>
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="flex flex-col gap-4 p-5">
          <Select label="Hình thức nhận hàng" required name="fulfilment" value={fulfilment} onChange={(e) => changeFulfilment(e.target.value)} options={opts(fulfilmentLabel, ['PICKUP', 'DELIVERY'])} />
          <Select label="Thanh toán" required name="method" value={method} onChange={(e) => setMethod(e.target.value)} options={opts(methodLabel, methods)} />
          <Input label="Họ tên người nhận" required maxLength={100} {...field('name')} />
          <Input label="Số điện thoại" required type="tel" maxLength={20} {...field('phone')} />
          {fulfilment === 'DELIVERY' && <Input label="Địa chỉ giao hàng" required maxLength={255} {...field('address')} />}
          {error && <p role="alert" className="font-medium text-red-600">{error}</p>}
        </Card>
        <Card className="flex h-fit flex-col gap-3 bg-brand/20 p-4 lg:sticky lg:top-36">
          <h2 className="text-xl">Đơn hàng ({lines.length} sách)</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {lines.map((l) => (
              <li key={l.id} className="flex justify-between gap-3"><span className="line-clamp-1">{l.title} × {l.quantity}</span><span className="shrink-0 font-bold">{formatVnd(l.price * l.quantity)}</span></li>
            ))}
          </ul>
          <div className="flex items-baseline justify-between border-t-2 border-ink pt-3">
            <span className="font-medium">Tạm tính</span>
            <span className="text-2xl font-bold">{formatVnd(total)}</span>
          </div>
          <p className="text-sm text-ink/70">
            {payOnline
              ? `Bước tiếp theo: quét mã QR để chuyển khoản${ttl ? ` trong ${ttl} phút` : ''}. Số tiền cần chuyển (đã gồm thuế${fulfilment === 'DELIVERY' && options?.deliveryFee != null ? ` và phí giao hàng ${formatVnd(options.deliveryFee)}` : ''}) hiện ở bước đó.`
              : 'Phí giao hàng và tổng cuối cùng do cửa hàng tính, xem trong mục Đơn hàng.'}
          </p>
          <label className="flex items-start gap-2 text-sm font-medium">
            <input type="checkbox" name="agree" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-4 w-4 shrink-0" />
            <span>
              Tôi đã đọc và đồng ý với{' '}
              <button type="button" onClick={() => setShowTerms(true)} className="font-bold underline">điều khoản mua hàng</button>.<RequiredMark />
            </span>
          </label>
          <Button type="submit" disabled={busy || !agreed}>{busy ? 'Đang đặt...' : 'Xác nhận đặt hàng'}</Button>
          <Button as={Link} to="/cart" variant="secondary">Quay lại giỏ hàng</Button>
        </Card>
      </form>

      <Dialog open={showTerms} onClose={closeTerms} title="Điều khoản mua hàng">
        <div className="mb-5 flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-1 text-sm">
          {terms.map((t) => <div key={t.title}><p className="font-bold">{t.title}</p><p className="text-ink/80">{t.text}</p></div>)}
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={closeTerms}>Đóng</Button>
          <Button className="flex-1" onClick={() => { setAgreed(true); closeTerms() }}>Đồng ý</Button>
        </div>
      </Dialog>
    </div>
  )
}

// ---- Hằng số, bảng nhãn và tiện ích ----

// Dự phòng khi backend chưa có /payment-options: COD chỉ với DELIVERY, CASH chỉ với PICKUP (sales kiểm), BANK_TRANSFER dùng được cho cả hai.
const staticMethodsFor = (f) => (f === 'DELIVERY' ? ['BANK_TRANSFER', 'COD'] : ['BANK_TRANSFER', 'CASH'])
// Phương thức đang bật (kể cả SEPAY) theo hình thức nhận hàng, lấy từ GET /payment-options.
const methodsFor = (f, options) => (options?.methods?.length
  ? options.methods.filter((m) => m.fulfilments.includes(f)).map((m) => m.method)
  : staticMethodsFor(f))
const opts = (map, keys) => keys.map((k) => ({ value: k, label: map[k] || k }))
