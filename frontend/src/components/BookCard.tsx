import React from 'react'
import { useDeleteRating, useUpsertRating } from '../hooks/useRating'
import type { Book, ReadingStatus } from '../types/book'
import { StarRating } from './StarRating'
import { ImageWithFallback } from './ImageWithFallback'

const STATUS_ICONS: Record<ReadingStatus, string> = {
  want_to_read: '🔖',
  reading: '📖',
  read: '✅',
}

interface Props {
  book: Book
  onOpen: (book: Book) => void
}

export function BookCard({ book, onOpen }: Props) {
  const upsertRating = useUpsertRating(book.id)
  const deleteRating = useDeleteRating(book.id)

  const coverUrl = book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg` : null

  function handleRate(v: number | null) {
    if (v === null) {
      deleteRating.mutate()
    } else {
      upsertRating.mutate(v)
    }
  }

  return (
    <div
      className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3 shadow-sm transition-shadow hover:shadow-md"
      onClick={() => onOpen(book)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(book)}
    >
      {/* Cover */}
      <ImageWithFallback
        src={coverUrl || undefined}
        alt=""
        className="h-16 w-10 flex-shrink-0 rounded object-cover shadow-sm"
        fallback={
          <div className="flex h-16 w-10 flex-shrink-0 items-center justify-center rounded bg-indigo-50 text-xl">
            📖
          </div>
        }
      />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">{book.title}</p>
        <p className="truncate text-xs text-gray-500">{book.author}</p>

        {/* Ratings row */}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <StarRating value={book.avg_rating} count={book.ratings_count} readonly />
          <span className="text-gray-300">·</span>
          <span onClick={(e) => e.stopPropagation()}>
            <StarRating value={book.user_rating} onRate={handleRate} />
          </span>
        </div>

        {/* Badges */}
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {book.genre && (
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">
              {book.genre}
            </span>
          )}
          {book.user_status && (
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
              {STATUS_ICONS[book.user_status]} {book.user_status === 'want_to_read' ? 'Chcę przeczytać' : book.user_status === 'reading' ? 'Czytam' : 'Przeczytane'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
