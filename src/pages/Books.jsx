import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ErrorBox } from '../components/AsyncState'
import { BookGridSkeleton } from '../components/Skeleton'
import BookCard from '../components/BookCard'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { api, formatVnd } from '../lib/api'
import { useAsync } from '../lib/hooks'

function Facet({ title, children }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-bold">{title}</p>
      {children}
    </div>
  )
}

export default function Books() {
  const [params, setParams] = useSearchParams()
  const g = (k) => params.get(k) || ''
  const q = g('q')
  const sort = g('sort') || 'default'
  const inStock = g('inStock') === 'true'
  const page = Math.max(0, Number(g('page')) || 0)
  const f = { price: g('price'), min: g('min'), max: g('max'), author: g('author'), format: g('format'), lang: g('lang'), tag: g('tag'), year: g('year'), preview: g('preview') === 'true' }
  // 5 tác giả nổi bật (có sách mới và bán chạy 3 tháng gần nhất) do backend chọn; lỗi/chưa có API thì dự phòng bên dưới
  const featured = useAsync(() => api.featuredAuthors().catch(() => null), [])

  const set = (patch) => {
    // dạng hàm: hai thay đổi liên tiếp không ghi đè nhau bằng params cũ
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries({ page: '', ...patch }).forEach(([k, v]) => {
        if (v && v !== 'default') next.set(k, v)
        else next.delete(k)
      })
      return next
    })
  }

  const { loading, data, error } = useAsync(
    () => loadAll({ keyword: q.trim(), sort: sort === 'default' ? '' : sort, inStock }),
    [q, sort, inStock],
  )
  const all = useMemo(() => data?.items || [], [data])

  // Khoảng giá: ô nhập tay thắng mức giá nhanh
  const [lo, hi] = useMemo(() => {
    if (f.min || f.max) return [f.min ? Number(f.min) : 0, f.max ? Number(f.max) : Infinity]
    if (!f.price) return [0, Infinity]
    const [a, b] = f.price.split('-')
    return [a ? Number(a) : 0, b ? Number(b) : Infinity]
  }, [f.price, f.min, f.max])

  const results = useMemo(() => all.filter((b) =>
    b.price >= lo && b.price < hi
    && (!f.author || b.author === f.author)
    && (!f.format || b.format === f.format)
    && (!f.lang || b.language === f.lang)
    && (!f.tag || b.tags?.includes(f.tag))
    && (!f.year || String(b.publicationYear) === f.year)
    && (!f.preview || b.hasPreview)), [all, lo, hi, f.author, f.format, f.lang, f.tag, f.year, f.preview])

  const authors = useMemo(() => countBy(all, (b) => b.author), [all])
  const formats = useMemo(() => countBy(all, (b) => b.format), [all])
  const langs = useMemo(() => countBy(all, (b) => b.language), [all])
  const tags = useMemo(() => countBy(all, (b) => b.tags), [all])
  const years = useMemo(() => countBy(all, (b) => b.publicationYear).sort((a, b) => b[0] - a[0]), [all])
  const hasPreviewAny = all.some((b) => b.hasPreview)
  const prices = all.map((b) => b.price)

  const active = [
    f.author && ['author', `Tác giả: ${f.author}`],
    (f.price || f.min || f.max) && ['price', `Giá: ${f.min || f.max ? `${f.min ? formatVnd(f.min) : '0đ'} – ${f.max ? formatVnd(f.max) : '…'}` : priceRanges.find((r) => r.value === f.price)?.label}`],
    f.format && ['format', formatLabel[f.format] || f.format],
    f.lang && ['lang', `Ngôn ngữ: ${f.lang}`],
    f.tag && ['tag', `Thẻ: ${f.tag}`],
    f.year && ['year', `Năm ${f.year}`],
    f.preview && ['preview', 'Có đọc thử'],
    inStock && ['inStock', 'Còn hàng'],
  ].filter(Boolean)
  const clearOne = (k) => set(k === 'price' ? { price: '', min: '', max: '' } : { [k]: '' })
  const hasFilter = q || sort !== 'default' || active.length > 0

  const pages = Math.ceil(results.length / SIZE)
  const shown = results.slice(page * SIZE, page * SIZE + SIZE)
  // Danh sách chip tác giả: tối đa 5 (số sách khớp bộ lọc hiện tại hiển thị nếu biết). Tác giả đang chọn luôn hiện để bỏ chọn được.
  const authorList = useMemo(() => {
    const countOf = new Map(authors)
    const names = featured.data?.length ? featured.data.map((a) => a.name) : authors.slice(0, 5).map(([n]) => n)
    const list = names.slice(0, 5).map((n) => [n, countOf.get(n) ?? null])
    if (f.author && !list.some(([n]) => n === f.author)) list.unshift([f.author, countOf.get(f.author) ?? null])
    return list
  }, [featured.data, authors, f.author])

  const chips = (list, key, label = (v) => v) => (
    <div className="flex flex-wrap gap-2">
      {list.map(([v, n]) => (
        <Button key={v} variant={f[key] === String(v) ? 'primary' : 'secondary'} className="px-2 py-1 text-xs" aria-pressed={f[key] === String(v)} onClick={() => set({ [key]: f[key] === String(v) ? '' : String(v) })}>
          {label(v)}{n != null && ` (${n})`}
        </Button>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-4xl">Kho sách</h1>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col gap-4 lg:sticky lg:top-36 lg:max-h-[calc(100vh-10rem)] lg:self-start lg:overflow-y-auto">
          <Card className="flex flex-col gap-5 p-4">
            <Input label="Tìm kiếm" name="q" value={q} onChange={(e) => set({ q: e.target.value })} placeholder="Tên sách, tác giả..." maxLength={100} />
            <Select label="Sắp xếp" name="sort" value={sort} onChange={(e) => set({ sort: e.target.value })} options={sortOptions} />
            <label className="flex items-center gap-2 font-bold">
              <input type="checkbox" checked={inStock} onChange={(e) => set({ inStock: e.target.checked ? 'true' : '' })} className="h-4 w-4" />
              Chỉ sách còn hàng
            </label>
            {hasPreviewAny && (
              <label className="flex items-center gap-2 font-bold">
                <input type="checkbox" checked={f.preview} onChange={(e) => set({ preview: e.target.checked ? 'true' : '' })} className="h-4 w-4" />
                Có đọc thử
              </label>
            )}

            <Facet title="Mức giá">
              <Select name="price" value={f.min || f.max ? '' : f.price} onChange={(e) => set({ price: e.target.value, min: '', max: '' })} options={priceRanges} />
              <div className="grid grid-cols-2 gap-2">
                <Input name="min" type="number" min="0" step="1000" inputMode="numeric" placeholder={prices.length ? `Từ ${Math.min(...prices)}` : 'Từ'} aria-label="Giá từ" value={f.min} onChange={(e) => set({ min: e.target.value, price: '' })} />
                <Input name="max" type="number" min="0" step="1000" inputMode="numeric" placeholder={prices.length ? `Đến ${Math.max(...prices)}` : 'Đến'} aria-label="Giá đến" value={f.max} onChange={(e) => set({ max: e.target.value, price: '' })} />
              </div>
            </Facet>

            {authorList.length > 0 && (
              <Facet title="Tác giả nổi bật">
                {chips(authorList, 'author')}
              </Facet>
            )}
            {formats.length > 0 && <Facet title="Hình thức">{chips(formats, 'format', (v) => formatLabel[v] || v)}</Facet>}
            {langs.length > 0 && <Facet title="Ngôn ngữ">{chips(langs, 'lang')}</Facet>}
            {years.length > 0 && <Facet title="Năm xuất bản">{chips(years.slice(0, 10), 'year')}</Facet>}
            {tags.length > 0 && <Facet title="Thẻ">{chips(tags.slice(0, 15), 'tag')}</Facet>}

            {hasFilter && <Button as={Link} to="/books" variant="secondary" className="text-sm">Xóa tất cả bộ lọc</Button>}
          </Card>
        </aside>

        <section className="flex min-w-0 flex-col gap-4">
          {loading && !data ? <BookGridSkeleton count={9} className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3" label="Đang tải danh sách sách" /> : error ? <ErrorBox error={error} /> : (
            <>
              <p className="font-medium"><span className="font-bold">{results.length}</span> sách{q && <> cho “{q}”</>}{results.length !== all.length && <> (lọc từ {all.length})</>}</p>
              {active.length > 0 && (
                <div className="flex flex-wrap gap-2" aria-label="Bộ lọc đang áp dụng">
                  {active.map(([k, label]) => (
                    <button key={k} type="button" onClick={() => clearOne(k)} aria-label={`Bỏ lọc ${label}`}>
                      <Badge tone="yellow" className="cursor-pointer hover:bg-ink hover:text-white">{label} ✕</Badge>
                    </button>
                  ))}
                </div>
              )}
              {data.truncated && <p className="text-sm text-ink/70">Chỉ lọc trong {all.length}/{data.total} sách đầu tiên. Hãy thu hẹp bằng từ khóa để xem đầy đủ.</p>}
              {results.length === 0 ? (
                <Card className="flex flex-col items-center gap-4 p-10 text-center">
                  <p className="text-xl font-bold">Không tìm thấy sách phù hợp</p>
                  <Button as={Link} to="/books">Xóa bộ lọc</Button>
                </Card>
              ) : (
                <div className={`grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
                  {shown.map((b) => <BookCard key={b.bookRef} book={b} />)}
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

// ---- Hằng số, bảng nhãn và tiện ích ----

const SIZE = 12
const FETCH_SIZE = 50 // tối đa của API
const MAX_BOOKS = 300 // chặn số trang tải về để lọc phía FE
const sortOptions = [
  { value: 'default', label: 'Mặc định' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
]
const priceRanges = [
  { value: '', label: 'Tất cả mức giá' },
  { value: '0-100000', label: 'Dưới 100.000đ' },
  { value: '100000-200000', label: '100.000đ – 200.000đ' },
  { value: '200000-', label: 'Trên 200.000đ' },
]
const formatLabel = { PAPERBACK: 'Bìa mềm', HARDCOVER: 'Bìa cứng', EBOOK: 'Sách điện tử' }

// Tải mọi trang khớp từ khóa/sắp xếp/còn hàng (server lọc), các tiêu chí còn lại lọc phía FE.
async function loadAll({ keyword, sort, inStock }) {
  const all = []
  let total = 0
  for (let page = 0; all.length < MAX_BOOKS; page++) {
    const r = await api.books({ keyword, sort, inStock, page, size: FETCH_SIZE })
    all.push(...r.items)
    total = r.total
    if (all.length >= total || r.items.length === 0) break
  }
  return { items: all, total, truncated: total > all.length }
}

const countBy = (items, pick) => {
  const m = new Map()
  items.forEach((b) => [].concat(pick(b) ?? []).forEach((v) => v && m.set(v, (m.get(v) || 0) + 1)))
  return [...m.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), 'vi'))
}
