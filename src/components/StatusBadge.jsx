import Badge from './ui/Badge'

export default function StatusBadge({ value }) {
  const [label, tone] = status[value] || [value, 'white']
  return <Badge tone={tone}>{label}</Badge>
}

// ---- Hằng số, bảng nhãn và tiện ích ----

const status = {
  PENDING_CONFIRMATION: ['Chờ xác nhận', 'white'],
  AWAITING_PAYMENT: ['Chờ thanh toán', 'white'],
  CONFIRMED: ['Đã xác nhận', 'yellow'],
  READY_FOR_PICKUP: ['Sẵn sàng nhận', 'yellow'],
  SHIPPING: ['Đang giao', 'yellow'],
  COMPLETED: ['Hoàn thành', 'green'],
  CANCELLED: ['Đã hủy', 'red'],
}

export const paymentLabel = { UNPAID: 'Chưa thanh toán', PAID: 'Đã thanh toán', PARTIALLY_REFUNDED: 'Hoàn tiền một phần', REFUNDED: 'Đã hoàn tiền' }
export const methodLabel = { BANK_TRANSFER: 'Chuyển khoản', COD: 'Thanh toán khi nhận hàng', CASH: 'Tiền mặt tại cửa hàng', SEPAY: 'Chuyển khoản QR (SePay)' }
export const fulfilmentLabel = { PICKUP: 'Nhận tại cửa hàng', DELIVERY: 'Giao tận nơi' }
