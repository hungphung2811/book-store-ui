import Card from './ui/Card'

// Khối giữ chỗ khi đang tải. Chỉ nhấp nháy khi người dùng không tắt hiệu ứng chuyển động.
export function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`rounded-brutal bg-ink/10 motion-safe:animate-pulse ${className}`} />
}

function Busy({ label = 'Đang tải', className = '', children }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}...</span>
      {children}
    </div>
  )
}

export function BookCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex h-full flex-col overflow-hidden rounded-brutal border-2 border-ink bg-white shadow-brutal">
      <Skeleton className="aspect-[3/4] !rounded-none border-b-2 border-ink" />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="border-t-2 border-ink bg-brand/60 px-3 py-3"><Skeleton className="h-5 w-1/3 !bg-ink/20" /></div>
    </div>
  )
}

export function BookGridSkeleton({ count = 8, className = 'grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4', label }) {
  return (
    <Busy label={label} className={className}>
      {Array.from({ length: count }, (_, i) => <BookCardSkeleton key={i} />)}
    </Busy>
  )
}

export function DetailSkeleton() {
  return (
    <Busy label="Đang tải thông tin sách" className="flex flex-col gap-6">
      <Skeleton className="h-4 w-64" />
      <div className="grid gap-8 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr_300px]">
        <Skeleton className="aspect-[3/4] w-48 border-2 border-ink md:w-full" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Card className="flex flex-col gap-4 p-4 md:col-span-2 lg:col-span-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </Card>
      </div>
      <Skeleton className="h-48 w-full" />
    </Busy>
  )
}

export function OrdersSkeleton({ count = 3 }) {
  return (
    <Busy label="Đang tải đơn hàng" className="flex flex-col gap-4">
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} className="flex flex-col gap-3 p-4">
          <div className="flex justify-between gap-2"><Skeleton className="h-6 w-32" /><Skeleton className="h-6 w-24" /></div>
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{Array.from({ length: 4 }, (_, j) => <Skeleton key={j} className="h-10" />)}</div>
          <Skeleton className="h-7 w-40" />
        </Card>
      ))}
    </Busy>
  )
}
