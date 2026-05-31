import React from 'react'
import { useDeleteRating, useUpsertRating } from '../hooks/useRating'
import type { Book, ReadingStatus } from '../types/book'
import { StarRating } from './StarRating'
import { ImageWithFallback } from './ImageWithFallback'
import { IconBookmark, IconBook2, IconCheck, IconBook } from '@tabler/icons-react'

const StatusIcon = ({ status, size = 14 }: { status: ReadingStatus; size?: number }) => {
  switch (status) {
    case 'want_to_read': return <IconBookmark size={size} stroke={2.5} />
    case 'reading': return <IconBook2 size={size} stroke={2.5} />
    case 'read': return <IconCheck size={size} stroke={2.5} />
    default: return null
  }
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
      className="flex cursor-pointer items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-800 dark:bg-slate-850"
      onClick={() => onOpen(book)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(book)}
    >
      {/* Cover */}
      <ImageWithFallback
        src={coverUrl || undefined}
        alt=""
        className="h-20 w-14 flex-shrink-0 rounded-lg object-cover shadow-sm dark:opacity-90"
        fallback={
          <div className="flex h-20 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-300 dark:bg-slate-800 dark:text-slate-600">
            <IconBook size={24} stroke={1.5} />
          </div>
        }
      />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-bold text-slate-900 dark:text-slate-100">{book.title}</p>
        <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{book.author}</p>

        {/* Ratings row */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StarRating value={book.avg_rating} count={book.ratings_count} readonly />
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span onClick={(e) => e.stopPropagation()}>
            <StarRating value={book.user_rating} onRate={handleRate} />
          </span>
        </div>

        {/* Badges */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {book.genre && (
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              {book.genre.toUpperCase()}
            </span>
          )}
          {book.user_status && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              <StatusIcon status={book.user_status} />
              {book.user_status === 'want_to_read' ? 'CHCĘ PRZECZYTAĆ' : book.user_status === 'reading' ? 'CZYTAM' : 'PRZECZYTANE'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
