import { QRCodeSVG } from 'qrcode.react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import LoginPrompt from '../components/auth/LoginPrompt'
import { ErrorBox } from '../components/AsyncState'
import { Skeleton } from '../components/Skeleton'
import StatusBadge, { methodLabel } from '../components/StatusBadge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { api, formatVnd } from '../lib/api'
import { useAuth } from '../lib/auth'
import NotFound from './NotFound'

// Thăm dò trạng thái thanh toán mỗi 3 giây cho tới khi lệnh không còn PENDING; tạm dừng khi tab bị ẩn.
function usePaymentPolling(orderId, enabled) {
  const [state, setState] = useState({ data: null, error: null, loaded: false })
  const timer = useRef(null)
  const alive = useRef(true)

  const load = useCallback(async () => {
    try {
      const data = await api.orderPayment(orderId)
      if (!alive.current) return null
      setState({ data, error: null, loaded: true })
      return data
    } catch (error) {
      if (!alive.current) return null
      setState((s) => ({ data: s.data, error, loaded: true }))
      return { failed: error }
    }
  }, [orderId])

  useEffect(() => {
    if (!enabled) return undefined
    alive.current = true
    let stopped = false
    const tick = async () => {
      if (stopped) return
      if (document.hidden) { timer.current = setTimeout(tick, POLL_MS); return }
      const d = await load()
      if (stopped) return
      // dừng khi đơn không còn tồn tại/không có quyền, hoặc lệnh đã kết thúc; lỗi tạm thời thì thăm dò tiếp
      const final = d?.failed ? [401, 403, 404].includes(d.failed.status) : d && (!d.intent || d.intent.status !== 'PENDING')
      if (!final) timer.current = setTimeout(tick, POLL_MS)
    }
    const onVisible = () => { if (!document.hidden) { clearTimeout(timer.current); tick() } }
    document.addEventListener('visibilitychange', onVisible)
    tick()
    return () => {
      stopped = true
      alive.current = false
      clearTimeout(timer.current)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [enabled, load])

  return { ...state, reload: load }
}

function Countdown({ expiresAt }) {
  const [left, setLeft] = useState(() => new Date(expiresAt).getTime() - Date.now())
  useEffect(() => {
    const id = setInterval(() => setLeft(new Date(expiresAt).getTime() - Date.now()), 1000)
    return () => clearInterval(id)
  }, [expiresAt])
  return left > 0
    ? <span className="font-bold tabular-nums" aria-live="off">{fmtClock(left)}</span>
    : <span className="font-bold">Đã hết hạn</span>
}

function CopyButton({ text, label }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500) } catch { /* trình duyệt chặn clipboard */ }
  }
  return <Button variant="secondary" className="px-2 py-0.5 text-xs" onClick={copy} aria-label={`Chép ${label}`}>{done ? 'Đã chép ✓' : 'Chép'}</Button>
}

export default function Payment() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data, error, loaded, reload } = usePaymentPolling(id, Boolean(user))
  const [busy, setBusy] = useState(false)
  const [cancelError, setCancelError] = useState('')

  if (!user) return <LoginPrompt />
  if (!loaded) {
    return (
      <div role="status" aria-busy="true" className="mx-auto flex max-w-lg flex-col gap-4">
        <span className="sr-only">Đang tải thông tin thanh toán...</span>
        <Skeleton className="h-10 w-2/3" /><Skeleton className="mx-auto h-64 w-64" /><Skeleton className="h-24 w-full" />
      </div>
    )
  }
  if (!data && (error?.status === 404 || error?.code === 'ORDER_NOT_FOUND')) return <NotFound title="Không tìm thấy đơn hàng" backTo="/my-orders" backLabel="Về đơn hàng" />
  if (!data) return <ErrorBox error={error} onRetry={reload} />

  const intent = data.intent
  const paid = data.paymentStatus === 'PAID' || intent?.status === 'PAID'
  // Đơn không đi qua cổng thanh toán: không có gì để trả ở đây
  if (!intent && !paid) return <Navigate to="/my-orders" replace />

  const cancelled = data.orderStatus === 'CANCELLED' || intent?.status === 'CANCELLED'
  const expired = intent?.status === 'EXPIRED'
  const waiting = intent?.status === 'PENDING' && !paid

  const cancel = async () => {
    if (!window.confirm('Hủy đơn hàng này? Hàng đang giữ cho bạn sẽ được nhả.')) return
    setBusy(true)
    setCancelError('')
    try { await api.cancelOrder(id); await reload() } catch (e) { setCancelError(e.message) } finally { setBusy(false) }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl">Thanh toán đơn {data.orderNo}</h1>
        <StatusBadge value={data.orderStatus} />
      </div>

      {paid && (
        <Card className="flex flex-col items-center gap-3 bg-green-200 p-6 text-center" role="status">
          <p className="text-2xl font-bold">Đã nhận thanh toán</p>
          <p>Cảm ơn bạn. Cửa hàng sẽ xác nhận và chuẩn bị đơn của bạn.</p>
          <Button as={Link} to="/my-orders">Xem đơn hàng</Button>
        </Card>
      )}

      {!paid && (cancelled || expired) && (
        <Card className="flex flex-col items-center gap-3 bg-red-100 p-6 text-center" role="status">
          <p className="text-xl font-bold">{cancelled ? 'Đơn đã được hủy' : 'Mã thanh toán đã hết hạn, đơn đã hủy'}</p>
          <p className="text-sm">Hàng đã được nhả. Nếu bạn đã chuyển tiền, vui lòng liên hệ cửa hàng kèm mã {intent?.reference}.</p>
          <div className="flex gap-2"><Button as={Link} to="/books">Về kho sách</Button><Button as={Link} to="/my-orders" variant="secondary">Đơn hàng</Button></div>
        </Card>
      )}

      {waiting && (
        <Card className="flex flex-col items-center gap-4 p-5 text-center">
          <p className="font-medium">Quét mã bằng ứng dụng ngân hàng để chuyển khoản ({methodLabel[data.paymentMethod] || data.paymentMethod})</p>
          {intent.qrPayload
            ? <div className="rounded-brutal border-2 border-ink bg-white p-3"><QRCodeSVG value={intent.qrPayload} size={224} level="M" title="Mã QR thanh toán" /></div>
            : <p className="text-sm">Không có mã QR, vui lòng chuyển khoản theo thông tin bên dưới.</p>}
          <dl className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2 text-left text-sm">
            <dt className="text-ink/70">Số tiền</dt><dd className="text-xl font-bold">{formatVnd(intent.amount)}</dd><dd><CopyButton text={String(intent.amount)} label="số tiền" /></dd>
            <dt className="text-ink/70">Nội dung</dt><dd className="break-all font-bold">{intent.reference}</dd><dd><CopyButton text={intent.reference} label="nội dung chuyển khoản" /></dd>
            <dt className="text-ink/70">Hết hạn sau</dt><dd><Countdown expiresAt={intent.expiresAt} /></dd><dd />
          </dl>
          <p className="text-xs text-ink/70">Vui lòng chuyển ĐÚNG số tiền và giữ nguyên nội dung chuyển khoản. Trang tự cập nhật khi cửa hàng nhận được tiền, không cần tải lại.</p>
          <p role="status" className="flex items-center gap-2 text-sm font-bold"><span className="inline-block h-2 w-2 rounded-full bg-ink motion-safe:animate-pulse" aria-hidden="true" />Đang chờ thanh toán...</p>
          {error && <p className="text-xs text-red-600">Chưa cập nhật được trạng thái, đang thử lại...</p>}
          {cancelError && <p role="alert" className="text-sm font-medium text-red-600">{cancelError}</p>}
          <Button variant="secondary" disabled={busy} onClick={cancel}>Hủy đơn</Button>
        </Card>
      )}
    </div>
  )
}

// ---- Hằng số, bảng nhãn và tiện ích ----

const POLL_MS = 3000

const fmtClock = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}
