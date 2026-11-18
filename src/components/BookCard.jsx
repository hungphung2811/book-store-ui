import { Link } from 'react-router-dom'
import BookCover from './BookCover'
import Badge from './ui/Badge'
import { formatVnd } from '../lib/api'

export default function BookCard({ book, tag }) {
  return (
    <Link
      to={`/books/${book.bookRef}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-brutal border-2 border-ink bg-white text-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm"
    >
      {tag && <Badge tone="black" className="absolute right-2 top-2 z-10 shadow-brutal-sm">{tag}</Badge>}
      {!book.inStock && <Badge tone="red" className="absolute left-2 top-2 z-10 shadow-brutal-sm">Hết hàng</Badge>}
      <BookCover book={book} className="border-0 border-b-2 transition-transform duration-200 group-hover:scale-[1.03]" />
      <div className="flex flex-1 flex-col gap-1 p-3">
        {book.tags?.[0] && <Badge tone="white" className="self-start">{book.tags[0]}</Badge>}
        <h3 className="line-clamp-2 break-words text-base">{book.title}</h3>
        <p className="truncate text-sm text-ink/70">{book.author}</p>
      </div>
      <div className="flex items-center justify-between gap-2 border-t-2 border-ink bg-brand px-3 py-2">
        <p className="font-bold">{formatVnd(book.price)}</p>
        <span className="rounded-brutal border-2 border-ink bg-white px-2 py-0.5 text-sm font-bold group-hover:bg-ink group-hover:text-white">Mua →</span>
      </div>
    </Link>
  )
}
