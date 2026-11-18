import { Link, useSearchParams } from 'react-router-dom'
import { ErrorBox, Loading } from '../components/AsyncState'
import BookCard from '../components/BookCard'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { api } from '../lib/api'
import { useAsync } from '../lib/hooks'

const SIZE = 12
const sortOptions = [
  { value: 'default', label: 'Mặc định' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
]

export default function Books() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const sort = params.get('sort') || 'default'
  const inStock = params.get('inStock') === 'true'
  const page = Math.max(0, Number(params.get('page')) || 0)

  const set = (patch) => {
    const next = new URLSearchParams(params)
    Object.entries({ page: '', ...patch }).forEach(([k, v]) => {
      if (v && v !== 'default') next.set(k, v)
      else next.delete(k)
    })
    setParams(next)
  }

  const { loading, data, error } = useAsync(
    () => api.books({ keyword: q.trim(), sort: sort === 'default' ? '' : sort, inStock, page, size: SIZE }),
    [q, sort, inStock, page],
  )
  const hasFilter = q || sort !== 'default' || inStock
  const pages = data ? Math.ceil(data.total / SIZE) : 0

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-4xl">Kho sách</h1>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="flex flex-col gap-4 lg:sticky lg:top-36 lg:self-start">
          <Card className="flex flex-col gap-4 p-4">
            <Input label="Tìm kiếm" name="q" value={q} onChange={(e) => set({ q: e.target.value })} placeholder="Tên sách, tác giả..." maxLength={100} />
            <Select label="Sắp xếp" name="sort" value={sort} onChange={(e) => set({ sort: e.target.value })} options={sortOptions} />
            <label className="flex items-center gap-2 font-bold">
              <input type="checkbox" checked={inStock} onChange={(e) => set({ inStock: e.target.checked ? 'true' : '' })} className="h-4 w-4" />
              Chỉ sách còn hàng
            </label>
            {hasFilter && <Button as={Link} to="/books" variant="secondary" className="text-sm">Xóa bộ lọc</Button>}
          </Card>
        </aside>

        <section className="flex min-w-0 flex-col gap-4">
          {loading && !data ? <Loading /> : error ? <ErrorBox error={error} /> : (
            <>
              <p className="font-medium"><span className="font-bold">{data.total}</span> sách{q && <> cho “{q}”</>}</p>
              {data.items.length === 0 ? (
                <Card className="flex flex-col items-center gap-4 p-10 text-center">
                  <p className="text-xl font-bold">Không tìm thấy sách phù hợp</p>
                  <Button as={Link} to="/books">Xóa bộ lọc</Button>
                </Card>
              ) : (
                <div className={`grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
                  {data.items.map((b) => <BookCard key={b.bookRef} book={b} />)}
                </div>
              )}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <Button variant="secondary" disabled={page === 0} onClick={() => set({ page: String(page - 1) })}>← Trước</Button>
                  <span className="font-bold">Trang {page + 1}/{pages}</span>
                  <Button variant="secondary" disabled={page + 1 >= pages} onClick={() => set({ page: String(page + 1) })}>Sau →</Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
