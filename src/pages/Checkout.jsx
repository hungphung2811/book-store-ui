import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { fulfilmentLabel, methodLabel } from '../components/StatusBadge'
import { api, formatVnd } from '../lib/api'
import { useAuth } from '../lib/auth'
import { useCart } from '../lib/cart'

// COD chỉ với DELIVERY, CASH chỉ với PICKUP (sales kiểm), BANK_TRANSFER dùng được cho cả hai.
const methodsFor = (f) => (f === 'DELIVERY' ? ['BANK_TRANSFER', 'COD'] : ['BANK_TRANSFER', 'CASH'])
const opts = (map, keys) => keys.map((k) => ({ value: k, label: map[k] }))

export default function Checkout() {
  const { user } = useAuth()
  const { lines, total, clear } = useCart()
  const navigate = useNavigate()
  const [fulfilment, setFulfilment] = useState('PICKUP')
  const [method, setMethod] = useState('BANK_TRANSFER')
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  // Một khóa cho mỗi lần đặt: bấm lại/mạng lỗi gửi lại thì server trả đơn cũ thay vì tạo đơn trùng.
  const requestId = useRef(crypto.randomUUID())
  // Đặt xong giỏ bị xóa: không được tự đẩy về /cart đè lên việc chuyển sang /my-orders.
  const placed = useRef(false)

  if (!user) return <Navigate to="/login" state={{ from: '/checkout' }} replace />
  if (lines.length === 0 && !placed.current) return <Navigate to="/cart" replace />

  const methods = methodsFor(fulfilment)
  const field = (k) => ({ name: k, value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) })
  const changeFulfilment = (f) => {
    setFulfilment(f)
    if (!methodsFor(f).includes(method)) setMethod('BANK_TRANSFER')
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (fulfilment === 'DELIVERY' && !form.address.trim()) { setError('Vui lòng nhập địa chỉ giao hàng.'); return }
    setBusy(true)
    try {
      await api.placeOrder({
        lines: lines.map((l) => ({ titleId: l.id, quantity: l.quantity })),
        fulfilment,
        paymentMethod: method,
        recipient: { name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim() },
        clientRequestId: requestId.current,
      })
      requestId.current = crypto.randomUUID()
      placed.current = true
      navigate('/my-orders', { state: { placed: true } })
      clear()
    } catch (err) {
      if (err.code === 'INSUFFICIENT_STOCK') {
        const bad = lines.find((l) => l.id === err.details?.titleId)
        setError(`${bad ? `“${bad.title}”` : 'Một cuốn sách'} không đủ số lượng, vui lòng giảm số lượng hoặc bỏ khỏi giỏ.`)
      } else if (err.code === 'TITLE_NOT_AVAILABLE') {
        setError('Có sách trong giỏ hiện không còn bán, vui lòng kiểm tra lại giỏ hàng.')
      } else if (err.status === 401) {
        navigate('/login', { state: { from: '/checkout' } })
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
          <Select label="Hình thức nhận hàng" name="fulfilment" value={fulfilment} onChange={(e) => changeFulfilment(e.target.value)} options={opts(fulfilmentLabel, ['PICKUP', 'DELIVERY'])} />
          <Select label="Thanh toán" name="method" value={method} onChange={(e) => setMethod(e.target.value)} options={opts(methodLabel, methods)} />
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
          <p className="text-sm text-ink/70">Phí giao hàng và tổng cuối cùng do cửa hàng tính, xem trong mục Đơn hàng.</p>
          <Button type="submit" disabled={busy}>{busy ? 'Đang đặt...' : 'Xác nhận đặt hàng'}</Button>
          <Button as={Link} to="/cart" variant="secondary">Quay lại giỏ hàng</Button>
        </Card>
      </form>
    </div>
  )
}
