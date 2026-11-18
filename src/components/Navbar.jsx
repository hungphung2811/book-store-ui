import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import SearchBar from './SearchBar'
import Button from './ui/Button'
import { useAuth } from '../lib/auth'
import { useCart } from '../lib/cart'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const close = () => setOpen(false)
  const topLink = 'rounded-brutal border-2 border-transparent px-3 py-1 font-bold hover:border-ink hover:bg-brand/40'
  const signOut = async () => { close(); await logout(); navigate('/') }
  const cartLabel = `Giỏ hàng${count ? ` (${count})` : ''}`

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-xl font-bold" onClick={close}>
          <span className="rounded-brutal border-2 border-ink bg-brand px-2 shadow-brutal-sm">B</span>BOOKNOOK
        </Link>
        <SearchBar className="hidden flex-1 md:flex" />
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <NavLink to="/cart" className={topLink}>{cartLabel}</NavLink>
          {user ? (
            <>
              <NavLink to="/my-orders" className={topLink}>Đơn hàng</NavLink>
              <span className="max-w-32 truncate text-sm font-medium" title={user.username}>{user.username}</span>
              <Button variant="secondary" onClick={signOut}>Đăng xuất</Button>
            </>
          ) : (
            <>
              <Button as={Link} to="/login" variant="secondary">Đăng nhập</Button>
              <Button as={Link} to="/register">Đăng ký</Button>
            </>
          )}
        </div>
        <button
          type="button"
          aria-label={open ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="ml-auto rounded-brutal border-2 border-ink bg-brand px-3 py-1 font-bold shadow-brutal-sm md:hidden"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      <nav className="hidden border-t-2 border-ink bg-brand md:block" aria-label="Danh mục">
        <div className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-2">
          <Link to="/books" className={topLink}>Tất cả sách</Link>
          <Link to="/books?sort=newest" className={topLink}>Sách mới</Link>
          <Link to="/books?sort=price_asc" className={topLink}>Giá thấp đến cao</Link>
          <Link to="/books?inStock=true" className={topLink}>Còn hàng</Link>
        </div>
      </nav>

      {open && (
        <nav className="flex max-h-[80vh] flex-col gap-3 overflow-y-auto border-t-2 border-ink bg-white p-4 md:hidden">
          <SearchBar onDone={close} />
          <div className="flex flex-wrap gap-2" onClick={close}>
            <Link to="/books" className="rounded-brutal border-2 border-ink px-3 py-1 font-bold">Tất cả sách</Link>
            <Link to="/books?sort=newest" className="rounded-brutal border-2 border-ink bg-brand px-3 py-1 font-bold">Sách mới</Link>
            <Link to="/books?inStock=true" className="rounded-brutal border-2 border-ink px-3 py-1 font-bold">Còn hàng</Link>
          </div>
          <div className="flex flex-col gap-2 border-t-2 border-ink pt-3" onClick={close}>
            <Link to="/cart" className="font-bold">{cartLabel}</Link>
            {user ? (
              <>
                <Link to="/my-orders" className="font-bold">Đơn hàng</Link>
                <Button variant="secondary" onClick={signOut}>Đăng xuất ({user.username})</Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" variant="secondary">Đăng nhập</Button>
                <Button as={Link} to="/register">Đăng ký</Button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
