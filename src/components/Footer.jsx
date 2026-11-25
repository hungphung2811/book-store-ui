import { Link } from 'react-router-dom'

export default function Footer({ flush = false }) {
  return (
    <footer className={`${flush ? '' : 'mt-16'} border-t-2 border-ink bg-brand`}>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm font-medium sm:grid-cols-2 lg:grid-cols-4">
        <div className={col}>
          <span className="mb-1 flex items-center gap-2 text-lg font-bold">
            <span className="rounded-brutal border-2 border-ink bg-white px-1.5 shadow-brutal-sm">B</span>BOOKNOOK
          </span>
          <p>Nhà sách trực tuyến: chọn sách, đặt hàng và nhận tại cửa hàng hoặc giao tận nơi.</p>
        </div>
        <nav className={col} aria-label="Mua sắm">
          <span className="mb-1 font-bold">Mua sắm</span>
          <Link className={link} to="/books">Tất cả sách</Link>
          <Link className={link} to="/books?sort=newest">Sách mới</Link>
          <Link className={link} to="/books?sort=price_asc">Giá thấp đến cao</Link>
          <Link className={link} to="/books?inStock=true">Còn hàng</Link>
        </nav>
        <nav className={col} aria-label="Tài khoản">
          <span className="mb-1 font-bold">Tài khoản</span>
          <Link className={link} to="/login">Đăng nhập</Link>
          <Link className={link} to="/register">Đăng ký</Link>
          <Link className={link} to="/cart">Giỏ hàng</Link>
          <Link className={link} to="/my-orders">Đơn hàng của tôi</Link>
        </nav>
        <div className={col}>
          <span className="mb-1 font-bold">Hỗ trợ</span>
          <span>Giao tận nơi hoặc nhận tại cửa hàng</span>
          <span>Thanh toán: chuyển khoản, COD, tiền mặt</span>
          <span>Hủy đơn khi đang chờ xác nhận</span>
        </div>
      </div>
      <div className="border-t-2 border-ink">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-sm sm:flex-row sm:justify-between">
          <span className="font-bold">BOOKNOOK – Nhà sách trực tuyến</span>
          <span>© 2026 BookNook</span>
        </div>
      </div>
    </footer>
  )
}

// ---- Hằng số, bảng nhãn và tiện ích ----

const col = 'flex flex-col gap-1'
const link = 'hover:underline'
