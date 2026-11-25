import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ErrorBox } from '../components/AsyncState'
import BookCard from '../components/BookCard'
import BookCover from '../components/BookCover'
import { BookGridSkeleton, DetailSkeleton, Skeleton } from '../components/Skeleton'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { faqs, policies } from '../data/content'
import { api, formatVnd } from '../lib/api'
import { useRequireLogin } from '../lib/auth'
import { addToCart as addForUser } from '../lib/cart'
import { useAsync } from '../lib/hooks'
import NotFound from './NotFound'

function Quantity({ qty, setQty }) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" className="px-3 py-1" aria-label="Giảm số lượng" onClick={() => setQty((n) => Math.max(1, n - 1))}>−</Button>
      <span className="w-8 text-center font-bold" aria-live="polite">{qty}</span>
      <Button variant="secondary" className="px-3 py-1" aria-label="Tăng số lượng" onClick={() => setQty((n) => Math.min(MAX_QTY, n + 1))}>+</Button>
    </div>
  )
}

function Preview({ id }) {
  const { loading, data, error } = useAsync(() => api.preview(id), [id])
  if (loading) return <div className="flex flex-col gap-2" role="status" aria-busy="true"><span className="sr-only">Đang tải đoạn đọc thử...</span>{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className={`h-4 ${i === 5 ? 'w-2/3' : 'w-full'}`} />)}</div>
  if (error) return <ErrorBox error={error} />
  // văn bản thuần: React tự escape, whitespace-pre-line giữ xuống dòng
  return <p className="whitespace-pre-line break-words leading-relaxed">{data.previewText}</p>
}

export default function BookDetail() {
  const { id } = useParams()
  const { loading, data: book, error } = useAsync(() => api.book(id), [id])
  const author = book?.author
  // Gợi ý: cùng tác giả (tìm theo tên) và sách mới; hook phải đứng trước các return sớm
  const sameAuthor = useAsync(() => (author ? api.books({ keyword: author, size: 6 }) : Promise.resolve(null)), [author])
  const latest = useAsync(() => api.books({ sort: 'newest', size: 6 }), [])
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState('desc')
  const navigate = useNavigate()
  const requireLogin = useRequireLogin()

  if (loading) return <DetailSkeleton />
  if (error?.code === 'BOOK_NOT_FOUND') return <NotFound title="Không tìm thấy sách" backTo="/books" backLabel="Về kho sách" />
  if (error) return <ErrorBox error={error} />

  const specs = [
    ['Tác giả', book.author],
    ['Dịch giả', book.translator],
    ['Nhà xuất bản', null],
    ['Năm xuất bản', book.publicationYear],
    ['Lần xuất bản', book.edition],
    ['Số trang', book.pageCount],
    ['Ngôn ngữ', book.language],
    ['Hình thức', formats[book.format] || book.format],
    ['Bộ sách', book.series && `${book.series}${book.seriesNumber ? ` – tập ${book.seriesNumber}` : ''}`],
  ].filter(([k]) => k !== 'Nhà xuất bản') // API chưa có nhà xuất bản: không hiện dòng giả
  const chips = [formats[book.format], book.pageCount && `${book.pageCount} trang`, book.publicationYear && `Năm ${book.publicationYear}`, book.language].filter(Boolean)

  const related = (sameAuthor.data?.items || []).filter((b) => b.bookRef !== book.bookRef && b.author === book.author).slice(0, 4)
  const relatedIds = new Set([book.bookRef, ...related.map((b) => b.bookRef)])
  const suggested = (latest.data?.items || []).filter((b) => !relatedIds.has(b.bookRef)).slice(0, 4)

  // Giỏ chỉ có khi đã đăng nhập: chưa đăng nhập thì mở popup đăng nhập, xong tự làm tiếp việc vừa bấm (khách không rời trang)
  const addToCart = () => requireLogin(() => { if (addForUser(book, qty)) setAdded(true) })
  const buyNow = () => requireLogin(() => { if (addForUser(book, qty)) navigate('/checkout') })
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* trình duyệt chặn clipboard */ }
  }

  const tabs = [['desc', 'Mô tả'], ['info', 'Thông tin chi tiết'], ...(book.hasPreview ? [['preview', 'Đọc thử']] : []), ['ship', 'Giao hàng & đổi hủy'], ['faq', 'Hỏi đáp']]

  return (
    <div className="flex flex-col gap-8 pb-20 lg:pb-0">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm font-medium">
        <Link to="/" className="underline">Trang chủ</Link><span>/</span>
        <Link to="/books" className="underline">Kho sách</Link><span>/</span>
        {book.author && <><Link to={`/books?author=${encodeURIComponent(book.author)}`} className="underline">{book.author}</Link><span>/</span></>}
        <span className="line-clamp-1 font-bold">{book.title}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr_300px]">
        <div className="relative w-48 md:w-full">
          <BookCover book={book} className="w-full shadow-brutal" />
          {!book.inStock && <Badge tone="red" className="absolute left-2 top-2 shadow-brutal-sm">Hết hàng</Badge>}
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          {book.tags?.length > 0 && <div className="flex flex-wrap gap-2">{book.tags.map((t) => <Link key={t} to={`/books?tag=${encodeURIComponent(t)}`}><Badge tone="white">{t}</Badge></Link>)}</div>}
          <h1 className="break-words text-3xl sm:text-4xl">{book.title}</h1>
          {book.subtitle && <p className="text-lg text-ink/70">{book.subtitle}</p>}
          <p className="text-lg">Tác giả: <Link to={`/books?author=${encodeURIComponent(book.author)}`} className="font-bold underline">{book.author}</Link></p>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-3xl font-bold">{formatVnd(book.price)}</p>
            <Badge tone={book.inStock ? 'green' : 'red'}>{book.inStock ? 'Còn hàng' : 'Tạm hết hàng'}</Badge>
          </div>
          {chips.length > 0 && <div className="flex flex-wrap gap-2">{chips.map((c) => <Badge key={c} tone="white">{c}</Badge>)}</div>}
          <p className="break-words leading-relaxed text-ink/90 line-clamp-4">{book.description || 'Cửa hàng chưa cập nhật mô tả cho cuốn sách này. Bạn có thể xem thông tin chi tiết bên dưới hoặc liên hệ cửa hàng để biết thêm.'}</p>
          <ul className="mt-1 grid gap-2 text-sm font-medium sm:grid-cols-2">
            {['Nhận tại cửa hàng hoặc giao tận nơi', 'Chuyển khoản, COD hoặc tiền mặt', 'Hủy đơn khi đang chờ xác nhận', 'Cửa hàng xác nhận và chuẩn bị hàng'].map((t) => (
              <li key={t} className="flex gap-2"><span className="font-bold" aria-hidden="true">✓</span>{t}</li>
            ))}
          </ul>
          <div className="mt-1 flex flex-wrap gap-2">
            <Button variant="secondary" className="px-3 py-1 text-sm" onClick={copyLink}>{copied ? 'Đã chép liên kết ✓' : 'Chép liên kết'}</Button>
            <Button as={Link} to={`/books?author=${encodeURIComponent(book.author)}`} variant="secondary" className="px-3 py-1 text-sm">Sách khác của tác giả</Button>
          </div>
        </div>

        <div className="md:col-span-2 lg:col-span-1 lg:sticky lg:top-36 lg:self-start">
          <Card className="flex flex-col gap-4 bg-brand/20 p-4">
            <h2 className="text-xl">Mua sách này</h2>
            {book.inStock ? (
              <>
                <div className="flex items-center justify-between gap-3"><span className="font-medium">Số lượng</span><Quantity qty={qty} setQty={setQty} /></div>
                <div className="flex items-baseline justify-between border-t-2 border-ink pt-3">
                  <span className="font-medium">Tạm tính</span>
                  <span className="text-2xl font-bold">{formatVnd(book.price * qty)}</span>
                </div>
                <p className="text-xs text-ink/70">Phí giao hàng và VAT (nếu có) do cửa hàng tính khi đặt đơn.</p>
                <Button onClick={buyNow}>Mua ngay</Button>
                <Button variant="secondary" onClick={addToCart}>Thêm vào giỏ</Button>
                {added && <p role="status" className="text-sm font-medium">Đã thêm vào giỏ. <Link to="/cart" className="font-bold underline">Xem giỏ hàng</Link></p>}
              </>
            ) : (
              <>
                <p className="font-bold">Sách tạm hết hàng.</p>
                <Button as={Link} to="/books?inStock=true" variant="secondary">Xem sách còn hàng</Button>
              </>
            )}
          </Card>
        </div>
      </div>

      <section aria-label="Chi tiết sách" className="flex flex-col gap-4">
        <div role="tablist" className="flex flex-wrap gap-2">
          {tabs.map(([k, label]) => (
            <Button key={k} role="tab" id={`tab-${k}`} aria-selected={tab === k} aria-controls="tab-panel" variant={tab === k ? 'primary' : 'secondary'} className="px-3 py-1 text-sm" onClick={() => setTab(k)}>{label}</Button>
          ))}
        </div>
        <Card role="tabpanel" id="tab-panel" aria-labelledby={`tab-${tab}`} className="p-5">
          {tab === 'desc' && (book.description
            ? <p className="whitespace-pre-line break-words leading-relaxed">{book.description}</p>
            : <p className="text-ink/70">Chưa có mô tả cho cuốn sách này.</p>)}
          {tab === 'info' && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-2">
              {specs.map(([k, v]) => (
                <div key={k} className="contents"><dt className="text-ink/70">{k}</dt><dd className={`break-words ${v ? 'font-bold' : 'text-ink/50'}`}>{v || MISSING}</dd></div>
              ))}
              <div className="contents"><dt className="text-ink/70">Giá</dt><dd className="font-bold">{formatVnd(book.price)}</dd></div>
              <div className="contents"><dt className="text-ink/70">Tình trạng</dt><dd className="font-bold">{book.inStock ? 'Còn hàng' : 'Tạm hết hàng'}</dd></div>
            </dl>
          )}
          {tab === 'preview' && <Preview id={book.bookRef} />}
          {tab === 'ship' && (
            <div className="grid gap-6 md:grid-cols-3">
              {policies.map((p) => (
                <div key={p.title}>
                  <h3 className="mb-2 text-lg">{p.title}</h3>
                  <ul className="flex flex-col gap-2 text-sm">{p.items.map((t) => <li key={t} className="flex gap-2"><span className="font-bold">+</span>{t}</li>)}</ul>
                </div>
              ))}
            </div>
          )}
          {tab === 'faq' && (
            <div className="flex flex-col gap-3">
              {faqs.map((f) => (
                <details key={f.q} className="group rounded-brutal border-2 border-ink bg-white shadow-brutal-sm open:shadow-brutal">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-3 font-bold">{f.q}<span className="text-2xl leading-none transition-transform group-open:rotate-45">+</span></summary>
                  <p className="px-3 pb-3">{f.a}</p>
                </details>
              ))}
            </div>
          )}
        </Card>
      </section>

      {(sameAuthor.loading || related.length > 0) && (
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl">Sách cùng tác giả</h2>
          {sameAuthor.loading
            ? <BookGridSkeleton count={4} className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4" label="Đang tải sách cùng tác giả" />
            : <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">{related.map((b) => <BookCard key={b.bookRef} book={b} />)}</div>}
        </section>
      )}

      {(latest.loading || suggested.length > 0) && (
        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4"><h2 className="text-2xl">Có thể bạn quan tâm</h2><Link to="/books?sort=newest" className="font-bold underline">Xem sách mới →</Link></div>
          {latest.loading
            ? <BookGridSkeleton count={4} className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4" label="Đang tải gợi ý" />
            : <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">{suggested.map((b) => <BookCard key={b.bookRef} book={b} />)}</div>}
        </section>
      )}

      {/* Thanh mua cố định trên điện thoại */}
      {book.inStock && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t-2 border-ink bg-white px-4 py-3 lg:hidden">
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{book.title}</p><p className="font-bold">{formatVnd(book.price * qty)}</p></div>
          <Quantity qty={qty} setQty={setQty} />
          <Button onClick={buyNow}>Mua</Button>
        </div>
      )}
    </div>
  )
}

// ---- Hằng số, bảng nhãn và tiện ích ----

const formats = { PAPERBACK: 'Bìa mềm', HARDCOVER: 'Bìa cứng', EBOOK: 'Sách điện tử' }
const MAX_QTY = 20
const MISSING = 'Đang cập nhật'
