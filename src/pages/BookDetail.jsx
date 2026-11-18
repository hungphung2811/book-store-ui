import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ErrorBox, Loading } from '../components/AsyncState'
import BookCover from '../components/BookCover'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { api, formatVnd } from '../lib/api'
import { useCart } from '../lib/cart'
import { useAsync } from '../lib/hooks'
import NotFound from './NotFound'

const formats = { PAPERBACK: 'Bìa mềm', HARDCOVER: 'Bìa cứng', EBOOK: 'Sách điện tử' }

export default function BookDetail() {
  const { id } = useParams()
  const { loading, data: book, error } = useAsync(() => api.book(id), [id])
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const cart = useCart()
  const navigate = useNavigate()

  if (loading) return <Loading />
  if (error?.code === 'BOOK_NOT_FOUND') return <NotFound title="Không tìm thấy sách" backTo="/books" backLabel="Về kho sách" />
  if (error) return <ErrorBox error={error} />

  const info = [
    ['Tác giả', book.author],
    ['Dịch giả', book.translator],
    ['Năm xuất bản', book.publicationYear],
    ['Lần xuất bản', book.edition],
    ['Số trang', book.pageCount],
    ['Ngôn ngữ', book.language],
    ['Hình thức', formats[book.format] || book.format],
    ['Bộ sách', book.series && `${book.series}${book.seriesNumber ? ` – tập ${book.seriesNumber}` : ''}`],
  ].filter(([, v]) => v)

  const addToCart = () => { cart.add(book, qty); setAdded(true) }
  const buyNow = () => { cart.add(book, qty); navigate('/checkout') }

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm font-medium">
        <Link to="/" className="underline">Trang chủ</Link><span>/</span>
        <Link to="/books" className="underline">Kho sách</Link><span>/</span>
        <span className="line-clamp-1 font-bold">{book.title}</span>
      </nav>
      <div className="grid gap-8 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr_300px]">
        <BookCover book={book} className="w-48 shadow-brutal md:w-full" />
        <div className="flex min-w-0 flex-col gap-3">
          {book.tags?.length > 0 && <div className="flex flex-wrap gap-2">{book.tags.map((t) => <Badge key={t} tone="white">{t}</Badge>)}</div>}
          <h1 className="break-words text-3xl sm:text-4xl">{book.title}</h1>
          {book.subtitle && <p className="text-lg text-ink/70">{book.subtitle}</p>}
          <p className="text-lg">Tác giả: <span className="font-bold">{book.author}</span></p>
          <p className="text-2xl font-bold">{formatVnd(book.price)}</p>
          {book.description && <p className="whitespace-pre-line break-words leading-relaxed">{book.description}</p>}
        </div>
        <div className="md:col-span-2 lg:col-span-1 lg:sticky lg:top-36 lg:self-start">
          <Card className="flex flex-col gap-4 bg-brand/20 p-4">
            <h2 className="text-xl">Mua sách này</h2>
            {book.inStock ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">Số lượng</span>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" className="px-3 py-1" aria-label="Giảm" onClick={() => setQty((n) => Math.max(1, n - 1))}>−</Button>
                    <span className="w-8 text-center font-bold" aria-live="polite">{qty}</span>
                    <Button variant="secondary" className="px-3 py-1" aria-label="Tăng" onClick={() => setQty((n) => Math.min(20, n + 1))}>+</Button>
                  </div>
                </div>
                <div className="flex items-baseline justify-between border-t-2 border-ink pt-3">
                  <span className="font-medium">Tạm tính</span>
                  <span className="text-2xl font-bold">{formatVnd(book.price * qty)}</span>
                </div>
                <Button onClick={buyNow}>Mua ngay</Button>
                <Button variant="secondary" onClick={addToCart}>Thêm vào giỏ</Button>
                {added && <p role="status" className="text-sm font-medium">Đã thêm vào giỏ. <Link to="/cart" className="font-bold underline">Xem giỏ hàng</Link></p>}
              </>
            ) : (
              <p className="font-bold">Sách tạm hết hàng.</p>
            )}
          </Card>
        </div>
      </div>

      {info.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-3 text-xl">Thông tin sách</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
            {info.map(([k, v]) => (<div key={k} className="contents"><dt className="text-ink/70">{k}</dt><dd className="break-words font-bold">{v}</dd></div>))}
          </dl>
        </Card>
      )}
    </div>
  )
}
