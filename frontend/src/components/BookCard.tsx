import type { Book } from '../types/book'

interface Props {
  book: Book
}

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`Ocena: ${rating} na 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </span>
  )
}

export function BookCard({ book }: Props) {
  return (
    <div className="flex items-start justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">{book.title}</p>
        <p className="truncate text-xs text-gray-500">{book.author}</p>
        {book.isbn && <p className="mt-0.5 text-xs text-gray-400">ISBN: {book.isbn}</p>}
      </div>
      <div className="ml-3 flex flex-shrink-0 flex-col items-end gap-1">
        <Stars rating={book.rating} />
        {book.pages && <span className="text-xs text-gray-400">{book.pages} str.</span>}
      </div>
    </div>
  )
}
