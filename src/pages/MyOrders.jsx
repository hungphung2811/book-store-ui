import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { ErrorBox, Loading } from '../components/AsyncState'
import StatusBadge, { fulfilmentLabel, methodLabel, paymentLabel } from '../components/StatusBadge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { api, formatVnd } from '../lib/api'
import { useAuth } from '../lib/auth'
import { useAsync } from '../lib/hooks'

const fmt = (d) => (d ? new Date(d).toLocaleString('vi-VN') : '—')

function Order({ order, onChanged }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const cancel = async () => {
    if (!window.confirm('Hủy đơn hàng này?')) return
    setBusy(true)
    setError('')
    try { await api.cancelOrder(order.id); onChanged() } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-lg font-bold">{order.orderNo}</p>
        <div className="flex flex-wrap gap-2"><StatusBadge value={order.status} /><span className="self-center text-sm">{paymentLabel[order.paymentStatus] || order.paymentStatus}</span></div>
      </div>
      <ul className="flex flex-col gap-1 border-y-2 border-ink py-2 text-sm">
        {order.lines.map((l) => (
          <li key={l.titleId} className="flex justify-between gap-3">
            <span><Link to={`/books/${l.titleId}`} className="hover:underline">{l.titleName}</Link> × {l.quantity}</span>
            <span className="shrink-0 font-bold">{formatVnd(l.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <div><dt className="text-ink/60">Đặt lúc</dt><dd className="font-bold">{fmt(order.createdAt)}</dd></div>
        <div><dt className="text-ink/60">Nhận hàng</dt><dd className="font-bold">{fulfilmentLabel[order.fulfilment] || order.fulfilment}</dd></div>
        <div><dt className="text-ink/60">Thanh toán</dt><dd className="font-bold">{methodLabel[order.paymentMethod] || order.paymentMethod}</dd></div>
        <div><dt className="text-ink/60">Phí giao hàng</dt><dd className="font-bold">{formatVnd(order.shippingFee)}</dd></div>
      </dl>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xl font-bold">Tổng: {formatVnd(order.grandTotal)}</p>
        {order.cancellable && <Button variant="secondary" disabled={busy} onClick={cancel}>Hủy đơn</Button>}
      </div>
      {error && <p role="alert" className="font-medium text-red-600">{error}</p>}
    </Card>
  )
}

export default function MyOrders() {
  const { user } = useAuth()
  const location = useLocation()
  const [page, setPage] = useState(0)
  const [nonce, setNonce] = useState(0)
  const { loading, data, error } = useAsync(() => (user ? api.orders(page) : Promise.resolve(null)), [user, page, nonce])

  if (!user) return <Navigate to="/login" state={{ from: '/my-orders' }} replace />
  const pages = data ? Math.ceil(data.total / data.size) : 0

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-4xl">Đơn hàng của tôi</h1>
      {location.state?.placed && <Card className="bg-green-200 p-4 font-bold" role="status">Đặt hàng thành công. Cửa hàng sẽ xác nhận đơn của bạn.</Card>}
      {loading && !data ? <Loading /> : error ? <ErrorBox error={error} onRetry={() => setNonce((n) => n + 1)} /> : data.items.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <p className="text-xl font-bold">Bạn chưa có đơn hàng nào</p>
          <Button as={Link} to="/books">Đến kho sách</Button>
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-4">{data.items.map((o) => <Order key={o.id} order={o} onChanged={() => setNonce((n) => n + 1)} />)}</div>
          {pages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button variant="secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>← Trước</Button>
              <span className="font-bold">Trang {page + 1}/{pages}</span>
              <Button variant="secondary" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Sau →</Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
