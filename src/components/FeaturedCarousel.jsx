import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BookCover from './BookCover'
import Badge from './ui/Badge'
import Button from './ui/Button'
import { formatVnd } from '../lib/api'
import { addToCart as addForUser } from '../lib/cart'
import { useRequireLogin } from '../lib/auth'

// Carousel sản phẩm nổi bật: mua được ngay trên thẻ (Mua ngay / Thêm vào giỏ). Chưa đăng nhập thì chuyển sang đăng nhập
// rồi quay lại trang hiện tại (giỏ chỉ có khi đã đăng nhập).
export default function FeaturedCarousel({ books }) {
  const track = useRef(null)
  const paused = useRef(false)
  const requireLogin = useRequireLogin()
  const navigate = useNavigate()
  const [added, setAdded] = useState(null)

  const scrollByPage = useCallback((dir) => {
    const el = track.current
    if (!el) return
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
    if (dir > 0 && atEnd) el.scrollTo({ left: 0, behavior: 'smooth' })
    else el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }, [])

  // Tự chạy; dừng khi rê chuột/focus, tab ẩn hoặc người dùng giảm chuyển động
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || books.length < 2) return undefined
    const id = setInterval(() => { if (!paused.current && !document.hidden) scrollByPage(1) }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [books.length, scrollByPage])

  useEffect(() => {
    if (!added) return undefined
    const id = setTimeout(() => setAdded(null), 1600)
    return () => clearTimeout(id)
  }, [added])

  // Chưa đăng nhập thì mở popup đăng nhập, xong tự làm tiếp việc vừa bấm (khách không rời trang chủ)
  const addToCart = (b) => requireLogin(() => { if (addForUser(b, 1)) setAdded(b.bookRef) })
  const buyNow = (b) => requireLogin(() => { if (addForUser(b, 1)) navigate('/checkout') })
  const hold = (v) => () => { paused.current = v }

  return (
    <div
      className="relative w-full"
      role="region"
      aria-roledescription="carousel"
      aria-label="Sản phẩm nổi bật"
      onMouseEnter={hold(true)}
      onMouseLeave={hold(false)}
      onFocus={hold(true)}
      onBlur={hold(false)}
    >
      <ul ref={track} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 pr-1">
        {books.map((b, i) => (
          <li key={b.bookRef} aria-roledescription="slide" aria-label={`${i + 1} trên ${books.length}`} className="w-[72%] shrink-0 snap-start sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]">
            <div className="flex h-full flex-col overflow-hidden rounded-brutal border-2 border-ink bg-white shadow-brutal">
              <Link to={`/books/${b.bookRef}`} className="relative block" aria-label={`Xem ${b.title}`}>
                {i < 3 && b.inStock && <Badge tone="red" className="absolute right-2 top-2 z-10 shadow-brutal-sm">HOT</Badge>}
                {!b.inStock && <Badge tone="red" className="absolute left-2 top-2 z-10 shadow-brutal-sm">Hết hàng</Badge>}
                <BookCover book={b} className="border-0 border-b-2" />
              </Link>
              <div className="flex flex-1 flex-col gap-1 p-3">
                <Link to={`/books/${b.bookRef}`} className="line-clamp-2 break-words text-base font-bold hover:underline">{b.title}</Link>
                <p className="truncate text-sm text-ink/70">{b.author}</p>
                <p className="text-lg font-bold">{formatVnd(b.price)}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t-2 border-ink bg-brand p-2">
                <Button className="px-2 py-1 text-sm" disabled={!b.inStock} onClick={() => buyNow(b)}>Mua ngay</Button>
                <Button variant="secondary" className="px-2 py-1 text-sm" disabled={!b.inStock} onClick={() => addToCart(b)} aria-live="polite">
                  {added === b.bookRef ? 'Đã thêm ✓' : 'Thêm giỏ'}
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {books.length > 1 && (
        <div className="mt-1 flex justify-end gap-2">
          <Button variant="secondary" className="px-3 py-1" aria-label="Sản phẩm trước" onClick={() => scrollByPage(-1)}>←</Button>
          <Button variant="secondary" className="px-3 py-1" aria-label="Sản phẩm tiếp theo" onClick={() => scrollByPage(1)}>→</Button>
        </div>
      )}
    </div>
  )
}

// ---- Hằng số, bảng nhãn và tiện ích ----

const AUTOPLAY_MS = 4500
