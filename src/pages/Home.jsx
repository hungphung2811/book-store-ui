import { Link, useNavigate } from 'react-router-dom'
import BookCard from '../components/BookCard'
import BookCover from '../components/BookCover'
import CircularCarousel from '../components/CircularCarousel'
import FlexCarousel from '../components/FlexCarousel'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { books, categories, formatVnd, hotBooks, newBooks } from '../data/books'
import { faqs, plans, reviews, stats, ticker } from '../data/content'

const steps = [
  { n: '1', title: 'Chọn sách', text: 'Tìm trong kho hàng trăm đầu sách đủ thể loại.' },
  { n: '2', title: 'Chọn thời hạn', text: 'Thuê 3, 7 hoặc 14 ngày, giá tính theo ngày.' },
  { n: '3', title: 'Nhận & trả sách', text: 'Thủ thư duyệt đơn, bạn đọc xong thì trả lại.' },
]
const catColors = ['bg-brand', 'bg-pink-300', 'bg-sky-300', 'bg-green-300', 'bg-orange-300', 'bg-violet-300']
const grid = 'grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4'

const bandTone = {
  plain: '',
  yellow: 'bg-brand',
  soft: 'bg-brand/25',
  ink: 'bg-ink text-white',
}
const titleTone = { plain: 'bg-brand', yellow: 'bg-white', soft: 'bg-brand', ink: 'bg-brand text-ink' }

// Full-bleed band that breaks out of the centered layout
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
  // Mỗi mục lấy một nhóm sách riêng để không bị lặp lại
  const top = hotBooks.slice(0, 5)
  const spotlight = top[0]
  const hotRow = hotBooks.slice(5).filter((b) => b.cover).slice(0, 10)
  const navigate = useNavigate()
  const used = new Set([...top, ...hotRow].map((b) => b.id))
  const fresh = newBooks.filter((b) => !used.has(b.id)).slice(0, 4)
  fresh.forEach((b) => used.add(b.id))
  const heroItems = books
    .filter((b) => b.cover)
    .map((b) => ({ id: b.id, src: b.cover, alt: `Bìa sách ${b.title}`, title: b.title }))
  const popularPrice = 4000

  return (
    <div className="-mb-8 -mt-8">
      {/* Ticker */}
      <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-b-2 border-ink bg-ink py-2 text-white" aria-hidden="true">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-bold">
          {[...ticker, ...ticker].map((t, i) => <span key={i}>{t} <span className="text-brand">/</span></span>)}
        </div>
      </div>

      {/* Hero toàn trang: carousel phủ kín, thẻ nhỏ nằm gọn trong khoảng trống góc trái trên của đường cong chữ S */}
      <section className="relative left-1/2 min-h-[max(640px,calc(100vh-9.5rem))] w-screen -translate-x-1/2 border-b-2 border-ink bg-brand">
        <div className="absolute inset-0">
          <FlexCarousel
            items={heroItems}
            captureWheel={false}
            autoplay
            onSelect={(_, item) => item && navigate(`/books/${item.id}`)}
          />
        </div>

        {/* Trên: tiêu đề lớn + nút hành động */}
        <div className="absolute inset-x-4 top-4 z-20 flex flex-col gap-3 sm:inset-x-8 sm:top-6 lg:flex-row lg:items-end lg:justify-start lg:gap-10">
          <div className="flex flex-col items-start gap-2">
            <span className="flex items-center gap-2 text-sm font-bold">
              <span className="rounded-brutal border-2 border-ink bg-white px-1.5 shadow-brutal-sm">B</span>BOOKNOOK · Thuê sách theo ngày
            </span>
            <h1 className="text-4xl leading-[1.05] sm:text-6xl xl:text-7xl">
              MƯỢN SÁCH, <span className="inline-block rotate-1 border-2 border-ink bg-white px-2 shadow-brutal">ĐỌC THẢ GA!</span>
            </h1>
            <p className="max-w-xl text-base font-medium sm:text-lg">Kho sách đủ thể loại, thuê theo ngày với giá rẻ. Không cần mua, đọc xong trả lại.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Button as={Link} to="/books" className="text-base">Khám phá kho sách →</Button>
            <Button as={Link} to="/register" variant="secondary" className="text-base">Đăng ký</Button>
          </div>
        </div>

        {/* Dưới: ô thông tin + lợi ích */}
        <div className="absolute bottom-6 left-4 right-4 z-10 flex flex-col items-center gap-4 sm:left-52">
          <dl className="hidden w-full max-w-4xl grid-cols-4 gap-4 sm:grid">
            {stats.map((st, i) => (
              <div key={st.label} className={`rounded-brutal border-2 border-ink px-4 py-3 shadow-brutal ${i % 2 ? 'bg-brand' : 'bg-white'}`}>
                <dt className="sr-only">{st.label}</dt>
                <dd className="text-3xl font-bold leading-none">{st.value}</dd>
                <dd className="mt-1 text-sm font-medium text-ink/70">{st.label}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {['Giao nhận tận nhà', 'Gia hạn 1 lần miễn phí', 'Sách được vệ sinh mỗi lượt'].map((t) => (
              <span key={t} className="hidden rounded-brutal border-2 border-ink bg-white px-3 py-1 text-sm font-bold shadow-brutal-sm lg:inline-block">{t}</span>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute right-4 top-4 z-10 hidden h-24 w-24 md:flex rotate-12 items-center justify-center rounded-full border-2 border-ink bg-white text-center text-sm font-bold leading-tight shadow-brutal sm:right-10 sm:top-8">Giảm<br />20%<br />đơn đầu</div>
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 -rotate-6 border-2 border-ink bg-ink px-3 py-2 font-bold text-white shadow-brutal sm:left-10">Từ 3.000đ/ngày</div>
      </section>

      {/* Categories */}
      <Band>
        <Title sub="Chọn theo sở thích của bạn">Thể loại</Title>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c, i) => (
            <Link
              key={c}
              to={`/books?category=${encodeURIComponent(c)}`}
              className={`flex min-h-28 flex-col justify-between rounded-brutal border-2 border-ink p-4 shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm ${catColors[i % catColors.length]}`}
            >
              <span className="text-4xl font-bold leading-none opacity-30">{String(i + 1).padStart(2, '0')}</span>
              <span><span className="block text-lg font-bold">{c}</span><span className="text-sm">{books.filter((b) => b.category === c).length} cuốn</span></span>
            </Link>
          ))}
        </div>
      </Band>

      {/* Spotlight + ranking */}
      <Band tone="soft">
        <Title tone="soft" sub="Được thuê nhiều nhất và bảng xếp hạng top 5" to="/books?sort=hot">Sách của tuần</Title>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="grid gap-5 p-5 sm:grid-cols-[180px_1fr]">
            <BookCover book={spotlight} className="w-36 shadow-brutal sm:w-full" />
            <div className="flex min-w-0 flex-col gap-2">
              <Badge tone="red" className="self-start">SÁCH CỦA TUẦN</Badge>
              <h3 className="break-words text-2xl">{spotlight.title}</h3>
              <p className="font-medium">{spotlight.author} · {spotlight.publisher}, {spotlight.year}</p>
              <p className="line-clamp-3">{spotlight.description}</p>
              <p className="text-sm font-medium text-ink/70">{spotlight.pages} trang · {spotlight.rentCount} lượt thuê · điểm {spotlight.rating}/5</p>
              <Button as={Link} to={`/books/${spotlight.id}`} className="mt-auto self-start">Thuê {formatVnd(spotlight.pricePerDay)}/ngày</Button>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="mb-3 text-xl">Top 5 thuê nhiều</h3>
            <ol className="flex flex-col gap-2">
              {top.map((b, i) => (
                <li key={b.id}>
                  <Link to={`/books/${b.id}`} className="flex items-center gap-3 rounded-brutal border-2 border-transparent p-1 hover:border-ink hover:bg-brand/40">
                    <span className="w-12 shrink-0 text-center text-5xl font-bold leading-none text-brand [-webkit-text-stroke:2px_#0A0A0A]">{i + 1}</span>
                    <span className="min-w-0 flex-1"><span className="line-clamp-1 font-bold">{b.title}</span><span className="block truncate text-sm text-ink/70">{b.author}</span></span>
                    <span className="shrink-0 text-sm font-bold">{b.rentCount} lượt</span>
                  </Link>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </Band>

      {/* Hot: horizontal scroll */}
      <Band>
        <Title sub="Kéo hoặc vuốt để xoay, bấm vào bìa để xem sách" to="/books?sort=hot">Sách hot</Title>
        <div className="relative left-1/2 h-[400px] w-screen -translate-x-1/2 sm:h-[480px]">
          <CircularCarousel
            items={hotRow.map((b) => ({ id: b.id, src: b.cover, alt: `Bìa sách ${b.title}`, title: b.title, subtitle: b.author }))}
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

      {/* New: black band */}
      <Band tone="ink">
        <Title tone="ink" sub="Vừa lên kệ trong tháng này" to="/books?sort=new">Sách mới</Title>
        <div className={grid}>{fresh.map((b) => <BookCard key={b.id} book={b} tag="NEW" />)}</div>
      </Band>

      {/* How + pricing */}
      <Band>
        <Title>Cách thuê sách</Title>
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
          {steps.map((s) => (
            <Card key={s.n} className="relative flex flex-col gap-2 overflow-hidden p-5 pt-8">
              <span className="absolute -right-2 -top-4 text-8xl font-bold text-brand [-webkit-text-stroke:2px_#0A0A0A]">{s.n}</span>
              <h3 className="text-xl">{s.title}</h3>
              <p>{s.text}</p>
            </Card>
          ))}
        </div>
      </Band>

      <Band tone="yellow">
        <Title tone="yellow" sub={`Ví dụ với một cuốn giá ${formatVnd(popularPrice)}/ngày`}>Bảng giá thuê</Title>
        <div className="grid gap-6 sm:grid-cols-3">
          {plans.map((p) => (
            <Card key={p.days} className={`relative flex flex-col gap-2 p-5 ${p.popular ? 'sm:-translate-y-3 bg-white' : 'bg-white/90'}`}>
              {p.popular && <Badge tone="black" className="absolute -top-3 right-4 rotate-3">Phổ biến nhất</Badge>}
              <p className="font-bold">{p.name}</p>
              <p className="text-5xl font-bold">{p.days} <span className="text-2xl">ngày</span></p>
              <p className="inline-block self-start border-2 border-ink bg-brand px-2 text-2xl font-bold">{formatVnd(popularPrice * p.days)}</p>
              <p className="text-sm">{p.note}</p>
            </Card>
          ))}
        </div>
      </Band>

      {/* Reviews */}
      <Band>
        <Title sub="Hơn 5.000 bạn đọc đang thuê sách mỗi tháng">Độc giả nói gì</Title>
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {reviews.map((r, i) => (
            <Card key={r.name} className={`flex flex-col gap-3 p-5 ${i === 1 ? 'bg-brand md:translate-y-3' : ''}`}>
              <p className="text-6xl font-bold leading-none text-white [-webkit-text-stroke:2px_#0A0A0A]">“</p>
              <p className="flex-1">{r.text}</p>
              <p className="border-t-2 border-ink pt-3 font-bold">{r.name} <span className="font-medium text-ink/70">· {r.role}</span></p>
            </Card>
          ))}
        </div>
      </Band>

      {/* FAQ */}
      <Band tone="soft">
        <Title tone="soft">Câu hỏi thường gặp</Title>
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

      {/* CTA */}
      <Band tone="yellow" className="!border-b-0">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-4xl sm:text-5xl">Sẵn sàng đọc chưa?</h2>
          <p className="text-lg font-medium">Đăng ký chỉ mất một phút, chọn sách và thuê ngay hôm nay.</p>
          <Button as={Link} to="/register" variant="secondary" className="text-lg">Tạo tài khoản miễn phí</Button>
        </div>
      </Band>
    </div>
  )
}
