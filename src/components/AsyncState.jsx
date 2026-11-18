import Card from './ui/Card'

export function Loading({ text = 'Đang tải...' }) {
  return <p role="status" className="py-10 text-center font-medium text-ink/70">{text}</p>
}

export function ErrorBox({ error, onRetry }) {
  return (
    <Card className="flex flex-col items-center gap-3 bg-red-100 p-6 text-center">
      <p className="font-bold">{error?.message || 'Có lỗi xảy ra.'}</p>
      {onRetry && <button type="button" onClick={onRetry} className="font-bold underline">Thử lại</button>}
    </Card>
  )
}
