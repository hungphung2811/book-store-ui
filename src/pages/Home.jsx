import { Link, useNavigate } from 'react-router-dom'
import { ErrorBox, Loading } from '../components/AsyncState'
import BookCard from '../components/BookCard'
import CircularCarousel from '../components/CircularCarousel'
import FlexCarousel from '../components/FlexCarousel'
import SearchBar from '../components/SearchBar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { api } from '../lib/api'
import { useAsync } from '../lib/hooks'

const grid = 'grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4'
const bandTone = { plain: '', yellow: 'bg-brand', soft: 'bg-brand/25', ink: 'bg-ink text-white' }
const titleTone = { plain: 'bg-brand', yellow: 'bg-white', soft: 'bg-brand', ink: 'bg-brand text-ink' }

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

const safeLink = (p) => (typeof p === 'string' && p.startsWith('/') && !p.startsWith('//') ? p : null)
const toItem = (b) => ({ id: b.bookRef, src: b.coverImageUrl, alt: `Bìa sách ${b.title}`, title: b.title, subtitle: b.author })

const steps = [
  ['1', 'Chọn sách', 'Tìm theo tên, tác giả và thêm vào giỏ.'],
  ['2', 'Đặt hàng', 'Đăng nhập, chọn nhận tại cửa hàng hoặc giao tận nơi.'],
  ['3', 'Nhận sách', 'Cửa hàng xác nhận đơn và chuẩn bị hàng cho bạn.'],
]

export default function Home() {
  const navigate = useNavigate()
  const newest = useAsync(() => api.books({ sort: 'newest', size: 24 }), [])
  // banner là tùy chọn: lỗi hoặc rỗng thì dùng nội dung mặc định
  const banners = useAsync(() => api.banners().catch(() => []), [])
  const banner = banners.data?.[0]
  const bannerLink = safeLink(banner?.linkPath)

  const books = newest.data?.items || []
  const withCover = books.filter((b) => b.coverImageUrl)
  // Carousel chỉ khi đủ bìa thật: danh sách rỗng thì component tự rơi về ảnh mẫu, không dùng được
  const heroItems = withCover.length >= 3 ? withCover.map(toItem) : null
  const rowItems = withCover.length >= 5 ? withCover.slice(0, 10).map(toItem) : null
  const fresh = books.slice(0, 8)

  return (
    <div className="-mb-8 -mt-8">
      <section className="relative left-1/2 w-screen -translate-x-1/2 border-b-2 border-ink bg-brand">
        {heroItems && (
          <div className="absolute inset-0">
            <FlexCarousel items={heroItems} captureWheel={false} autoplay onSelect={(_, item) => item && navigate(`/books/${item.id}`)} />
          </div>
        )}
        <div className={`relative z-20 mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-14 sm:py-20 ${heroItems ? 'min-h-[max(640px,calc(100vh-9.5rem))] pointer-events-none [&>*]:pointer-events-auto' : ''}`}>
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
          <SearchBar size="lg" className="w-full max-w-md" />
        </div>
      </section>

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
        {newest.loading ? <Loading /> : newest.error ? <ErrorBox error={newest.error} /> : fresh.length === 0 ? (
          <p>Chưa có sách nào đang bán.</p>
        ) : (
          <div className={grid}>{fresh.map((b, i) => <BookCard key={b.bookRef} book={b} tag={i < 3 ? 'MỚI' : undefined} />)}</div>
        )}
      </Band>

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
