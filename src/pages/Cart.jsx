import { Link } from 'react-router-dom'
import LoginPrompt from '../components/auth/LoginPrompt'
import BookCover from '../components/BookCover'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { formatVnd } from '../lib/api'
import { useCart } from '../lib/cart'

export default function Cart() {
  const { loggedIn, lines, total, setQty, remove } = useCart()
  // Giỏ chỉ có khi đã đăng nhập
  if (!loggedIn) return <LoginPrompt />

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-4xl">Giỏ hàng</h1>
      {lines.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <p className="text-xl font-bold">Giỏ hàng đang trống</p>
          <Button as={Link} to="/books">Đến kho sách</Button>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-4">
            {lines.map((l) => (
              <Card key={l.id} className="flex gap-4 p-3 sm:p-4">
                <BookCover book={l} className="w-20 shrink-0 sm:w-24" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Link to={`/books/${l.id}`} className="line-clamp-2 break-words text-lg font-bold hover:underline">{l.title}</Link>
                  <p className="truncate text-sm text-ink/70">{l.author}</p>
                  <p className="font-bold">{formatVnd(l.price)}</p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" className="px-3 py-1" aria-label="Giảm" onClick={() => setQty(l.id, l.quantity - 1)}>−</Button>
                      <span className="w-8 text-center font-bold">{l.quantity}</span>
                      <Button variant="secondary" className="px-3 py-1" aria-label="Tăng" onClick={() => setQty(l.id, l.quantity + 1)}>+</Button>
                    </div>
                    <span className="font-bold">{formatVnd(l.price * l.quantity)}</span>
                    <button type="button" className="text-sm font-bold underline" onClick={() => remove(l.id)}>Xóa</button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Card className="flex h-fit flex-col gap-4 bg-brand/20 p-4 lg:sticky lg:top-36">
            <h2 className="text-xl">Tóm tắt</h2>
            <div className="flex items-baseline justify-between border-t-2 border-ink pt-3">
              <span className="font-medium">Tạm tính</span>
              <span className="text-2xl font-bold">{formatVnd(total)}</span>
            </div>
            <p className="text-sm text-ink/70">Phí giao hàng và giảm giá (nếu có) được tính khi đặt hàng.</p>
            <Button as={Link} to="/checkout">Đặt hàng</Button>
          </Card>
        </div>
      )}
    </div>
  )
}
