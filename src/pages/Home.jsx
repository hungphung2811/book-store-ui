import { Link, useNavigate } from 'react-router-dom'
import { ErrorBox } from '../components/AsyncState'
import { BookGridSkeleton } from '../components/Skeleton'
import BookCard from '../components/BookCard'
import CircularCarousel from '../components/CircularCarousel'
import FeaturedCarousel from '../components/FeaturedCarousel'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { faqs, perks, policies, ticker } from '../data/content'
import { api } from '../lib/api'
import { useAsync } from '../lib/hooks'

// Dải toàn chiều ngang, thoát khỏi layout căn giữa
function Band({ tone = 'plain', className = '', children }) {
  return (
    <div className={`relative left-1/2 w-screen -translate-x-1/2 ${tone === 'plain' ? '' : 'border-y-2 border-ink'} ${bandTone[tone]} ${className}`}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">{children}</div>
    </div>
  )
}

function Title({ children, tone = 'plain', sub, to }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className={`inline-block -rotate-1 rounded-brutal border-2 border-ink px-3 py-1 text-3xl shadow-brutal-sm sm:text-4xl ${titleTone[tone]}`}>{children}</h2>
        {sub && <p className={`mt-3 ${tone === 'ink' ? 'text-white/80' : 'text-ink/70'}`}>{sub}</p>}
      </div>
      {to && <Link to={to} className="shrink-0 font-bold underline">Xem tất cả →</Link>}
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const newest = useAsync(() => api.books({ sort: 'newest', size: 24 }), [])
  // banner là tùy chọn: lỗi hoặc rỗng thì dùng nội dung mặc định
  const banners = useAsync(() => api.banners().catch(() => []), [])
  const banner = banners.data?.[0]
  const bannerLink = safeLink(banner?.linkPath)
  // Chương trình đang diễn ra = các banner của cửa hàng (hệ thống chưa có giảm giá/voucher tự động)
  const programs = banners.data || []
  // Sản phẩm nổi bật = bán chạy 3 tháng gần nhất do backend chọn; lỗi/chưa có API/rỗng thì ẩn mục này
  const featured = useAsync(() => api.featuredBooks().catch(() => null), [])
  const featuredBooks = featured.data || []

  const books = newest.data?.items || []
  const withCover = books.filter((b) => b.coverImageUrl)
  // Carousel chỉ khi đủ bìa thật: danh sách rỗng thì component tự rơi về ảnh mẫu, không dùng được
  const rowItems = withCover.length >= 5 ? withCover.slice(0, 10).map(toItem) : null
  const fresh = books.slice(0, 8)
  // Carousel đầu trang: bán chạy do backend chọn; chưa có thì dùng sách mới còn hàng. null = đang tải
  const heroBooks = featured.loading || newest.loading ? null : (featuredBooks.length ? featuredBooks : books.filter((b) => b.inStock)).slice(0, 8)
  // Sách giá tốt: gọi riêng theo giá tăng dần, chỉ sách còn hàng
  const cheap = useAsync(() => api.books({ sort: 'price_asc', inStock: true, size: 4 }), [])
  const total = newest.data?.total
  // Tác giả: gom từ danh sách đã tải (không gọi thêm API)
  const authors = [...new Map(books.filter((b) => b.author).map((b) => [b.author, b])).values()].slice(0, 8)

  return (
    <div className="-mb-8 -mt-8">
      <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-b-2 border-ink bg-ink py-2 text-white" aria-hidden="true">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-bold">
          {[...ticker, ...ticker].map((t, i) => <span key={i}>{t} <span className="text-brand">/</span></span>)}
        </div>
      </div>

      <section className="relative left-1/2 w-screen -translate-x-1/2 border-b-2 border-ink bg-brand">
        <div className={`relative z-20 mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-14 sm:py-20 `}>
          <span className="flex items-center gap-2 text-sm font-bold">
            <span className="rounded-brutal border-2 border-ink bg-white px-1.5 shadow-brutal-sm">B</span>BOOKNOOK · Nhà sách trực tuyến
          </span>
          <h1 className="max-w-3xl text-4xl leading-[1.05] sm:text-6xl">
            {banner?.title || <>MUA SÁCH HAY, <span className="inline-block rotate-1 border-2 border-ink bg-white px-2 shadow-brutal">ĐỌC THẢ GA!</span></>}
          </h1>
          <p className="max-w-xl text-base font-medium sm:text-lg">{banner?.subtitle || 'Hàng trăm đầu sách, đặt online, nhận tại cửa hàng hoặc giao tận nơi.'}</p>
          <div className="flex flex-wrap gap-3">
            <Button as={Link} to={bannerLink || '/books'} className="text-base">{bannerLink ? 'Xem ngay →' : 'Khám phá kho sách →'}</Button>
            <Button as={Link} to="/register" variant="secondary" className="text-base">Đăng ký</Button>
          </div>
          <div className="mt-2 w-full">
            <p className="mb-3 text-lg font-bold">Sản phẩm nổi bật{featuredBooks.length ? " · bán chạy 3 tháng gần đây" : ""}</p>
            {heroBooks === null ? <BookGridSkeleton count={4} className="grid grid-cols-2 gap-4 lg:grid-cols-4" label="Đang tải sản phẩm nổi bật" /> : heroBooks.length > 0 && <FeaturedCarousel books={heroBooks} />}
          </div>
        </div>
      </section>

      <Band tone="yellow" className="[&>div]:!py-8 sm:[&>div]:!py-10">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {perks.map((p) => (
            <Card key={p.title} className="flex flex-col gap-1 p-4">
              <span className="text-3xl" aria-hidden="true">{p.icon}</span>
              <h3 className="text-lg">{p.title}</h3>
              <p className="text-sm text-ink/80">{p.text}</p>
            </Card>
          ))}
        </div>
      </Band>

      {programs.length > 0 && (
        <Band tone="soft">
          <Title tone="soft" sub="Ưu đãi và thông báo từ cửa hàng">Chương trình đang diễn ra</Title>
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            {programs.map((p) => {
              const link = safeLink(p.linkPath)
              return (
                <Card key={p.id} className="flex flex-col gap-2 p-5">
                  <Badge tone="red" className="self-start">ĐANG DIỄN RA</Badge>
                  <h3 className="break-words text-2xl">{p.title}</h3>
                  {p.subtitle && <p className="break-words text-ink/80">{p.subtitle}</p>}
                  {link && <Button as={Link} to={link} className="mt-auto self-start">Xem ngay →</Button>}
                </Card>
              )
            })}
          </div>
        </Band>
      )}

      {total != null && (
        <Band>
          <dl className="grid grid-cols-2 gap-4">
            {[[total, 'Đầu sách đang bán'], [authors.length ? `${authors.length}+` : '—', 'Tác giả nổi bật']].map(([v, l], i) => (
              <div key={l} className={`rounded-brutal border-2 border-ink px-4 py-3 shadow-brutal ${i % 2 ? 'bg-brand' : 'bg-white'}`}>
                <dd className="text-4xl font-bold leading-none">{v}</dd>
                <dt className="mt-1 text-sm font-medium text-ink/70">{l}</dt>
              </div>
            ))}
          </dl>
        </Band>
      )}

      {rowItems && (
        <Band>
          <Title sub="Kéo hoặc vuốt để xoay, bấm vào bìa để xem sách" to="/books?sort=newest">Sách nổi bật</Title>
          <div className="relative left-1/2 h-[400px] w-screen -translate-x-1/2 sm:h-[480px]">
            <CircularCarousel
              items={rowItems}
              preset="cylinder"
              intro="rise"
              cardWidth={300}
              gap={240}
              aspectRatio={0.82}
              cornerRadius={4}
              thickness={56}
              tilt={-7}
              autoplay="drift"
              speed={8}
              depthFade={0.5}
              fadeColor="#ffffff"
              innerShade={0.3}
              captions
              onItemClick={(item) => navigate(`/books/${item.id}`)}
            />
          </div>
        </Band>
      )}

      <Band tone="ink">
        <Title tone="ink" sub="Vừa lên kệ" to="/books?sort=newest">Sách mới</Title>
        {newest.loading ? <BookGridSkeleton count={8} label="Đang tải sách mới" /> : newest.error ? <ErrorBox error={newest.error} /> : fresh.length === 0 ? (
          <p>Chưa có sách nào đang bán.</p>
        ) : (
          <div className={grid}>{fresh.map((b, i) => <BookCard key={b.bookRef} book={b} tag={i < 3 ? 'MỚI' : undefined} />)}</div>
        )}
      </Band>

      <Band tone="soft">
        <Title tone="soft" sub="Còn hàng, giá tăng dần" to="/books?sort=price_asc&inStock=true">Sách giá tốt</Title>
        {cheap.loading ? <BookGridSkeleton count={4} label="Đang tải sách giá tốt" /> : cheap.error || !cheap.data?.items.length ? <p>Chưa có sách phù hợp.</p> : (
          <div className={grid}>{cheap.data.items.map((b) => <BookCard key={b.bookRef} book={b} />)}</div>
        )}
      </Band>

      {authors.length > 0 && (
        <Band>
          <Title sub="Bấm để xem sách của tác giả">Tác giả nổi bật</Title>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {authors.map((b, i) => (
              <Link
                key={b.author}
                to={`/books?q=${encodeURIComponent(b.author)}`}
                className={`flex min-h-24 flex-col justify-between rounded-brutal border-2 border-ink p-4 shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm ${['bg-brand', 'bg-pink-300', 'bg-sky-300', 'bg-green-300'][i % 4]}`}
              >
                <span className="text-3xl font-bold leading-none opacity-30">{String(i + 1).padStart(2, '0')}</span>
                <span className="line-clamp-2 font-bold">{b.author}</span>
              </Link>
            ))}
          </div>
        </Band>
      )}

      <Band>
        <Title>Cách mua sách</Title>
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
          {steps.map(([n, title, text]) => (
            <Card key={n} className="relative flex flex-col gap-2 overflow-hidden p-5 pt-8">
              <span className="absolute -right-2 -top-4 text-8xl font-bold text-brand [-webkit-text-stroke:2px_#0A0A0A]">{n}</span>
              <h3 className="text-xl">{title}</h3>
              <p>{text}</p>
            </Card>
          ))}
        </div>
      </Band>

      <Band tone="yellow">
        <Title tone="yellow" sub="Giao nhận, thanh toán và đổi hủy">Chính sách mua hàng</Title>
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {policies.map((p) => (
            <Card key={p.title} className="p-5">
              <h3 className="mb-3 text-xl">{p.title}</h3>
              <ul className="flex flex-col gap-2">{p.items.map((t) => <li key={t} className="flex gap-2"><span className="font-bold">+</span>{t}</li>)}</ul>
            </Card>
          ))}
        </div>
      </Band>

      <Band>
        <Title>Câu hỏi thường gặp</Title>
        <div className="flex flex-col gap-3">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-brutal border-2 border-ink bg-white shadow-brutal-sm open:shadow-brutal">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 font-bold">
                {f.q}
                <span className="text-2xl leading-none transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="px-4 pb-4">{f.a}</p>
            </details>
          ))}
        </div>
      </Band>

      <Band tone="yellow" className="!border-b-0">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-4xl sm:text-5xl">Sẵn sàng chọn sách chưa?</h2>
          <Badge tone="black">Giao tận nơi hoặc nhận tại cửa hàng</Badge>
          <Button as={Link} to="/books" variant="secondary" className="text-lg">Vào kho sách</Button>
        </div>
      </Band>
    </div>
  )
}

// ---- Hằng số, bảng nhãn và tiện ích ----

const grid = 'grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4'
const bandTone = { plain: '', yellow: 'bg-brand', soft: 'bg-brand/25', ink: 'bg-ink text-white' }
const titleTone = { plain: 'bg-brand', yellow: 'bg-white', soft: 'bg-brand', ink: 'bg-brand text-ink' }

const safeLink = (p) => (typeof p === 'string' && p.startsWith('/') && !p.startsWith('//') ? p : null)
const toItem = (b) => ({ id: b.bookRef, src: b.coverImageUrl, alt: `Bìa sách ${b.title}`, title: b.title, subtitle: b.author })

const steps = [
  ['1', 'Chọn sách', 'Tìm theo tên, tác giả và thêm vào giỏ.'],
  ['2', 'Đặt hàng', 'Đăng nhập, chọn nhận tại cửa hàng hoặc giao tận nơi.'],
  ['3', 'Nhận sách', 'Cửa hàng xác nhận đơn và chuẩn bị hàng cho bạn.'],
]
