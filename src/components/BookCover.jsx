import { useState } from 'react'

const palette = ['bg-brand', 'bg-pink-300', 'bg-sky-300', 'bg-green-300', 'bg-orange-300', 'bg-violet-300']

// book: { title, author, coverImageUrl }. Không có ảnh (hoặc ảnh lỗi) thì dùng bìa màu theo chữ cái đầu.
export default function BookCover({ book, className = '' }) {
  const [failed, setFailed] = useState(false)
  const title = book.title || book.titleName || '?'
  const color = palette[(title.codePointAt(0) || 0) % palette.length]

  if (book.coverImageUrl && !failed) {
    return (
      <div className={`aspect-[3/4] overflow-hidden border-2 border-ink bg-white ${className}`}>
        <img
          src={book.coverImageUrl}
          alt={`Bìa sách ${title}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      </div>
    )
  }
  return (
    <div className={`flex aspect-[3/4] flex-col justify-between overflow-hidden border-2 border-ink p-3 ${color} ${className}`}>
      <span className="text-5xl font-bold leading-none">{title.charAt(0)}</span>
      <span className="line-clamp-3 text-sm font-bold">{book.author}</span>
    </div>
  )
}
