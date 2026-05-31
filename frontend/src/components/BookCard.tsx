import { useDeleteRating, useUpsertRating } from '../hooks/useRating'
import type { Book, ReadingStatus } from '../types/book'
import { StarRating } from './StarRating'
import { ImageWithFallback } from './ImageWithFallback'
import { Bookmark, BookOpen, CheckCircle, Library } from 'lucide-react'
import { motion } from 'framer-motion'

const StatusIcon = ({ status, size = 14 }: { status: ReadingStatus; size?: number }) => {
  switch (status) {
    case 'want_to_read': return <Bookmark size={size} strokeWidth={2.5} />
    case 'reading': return <BookOpen size={size} strokeWidth={2.5} />
    case 'read': return <CheckCircle size={size} strokeWidth={2.5} />
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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 20 
      }}
      className="glass-panel flex cursor-pointer items-start gap-4 rounded-2xl p-4 transition-shadow hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
      onClick={() => onOpen(book)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(book)}
    >
      {/* Cover */}
      <ImageWithFallback
        src={coverUrl || undefined}
        alt=""
        className="h-24 w-16 flex-shrink-0 rounded-lg object-cover shadow-md dark:opacity-90"
        fallback={
          <div className="relative flex h-24 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50/30 dark:bg-slate-800/30 shadow-inner border border-white/20 dark:border-white/5 overflow-hidden">
            <div className="absolute inset-0 bg-indigo-200/20 dark:bg-indigo-500/10 animate-pulse" />
            <Library size={24} className="text-indigo-400/70 dark:text-slate-500/70 z-10" strokeWidth={1} />
          </div>
        }
      />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-extrabold text-slate-900 dark:text-slate-100 drop-shadow-sm">{book.title}</p>
        <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{book.author}</p>

        {/* Ratings row */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <StarRating value={book.avg_rating} count={book.ratings_count} readonly />
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span onClick={(e) => e.stopPropagation()}>
            <StarRating value={book.user_rating} onRate={handleRate} />
          </span>
        </div>

        {/* Badges */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {book.genre && (
            <span className="rounded-full bg-indigo-100/80 backdrop-blur-sm border border-indigo-200/50 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-400/20 dark:text-indigo-300">
              {book.genre.toUpperCase()}
            </span>
          )}
          {book.user_status && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-100/80 backdrop-blur-sm border border-emerald-200/50 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-400/20 dark:text-emerald-300">
              <StatusIcon status={book.user_status} />
              {book.user_status === 'want_to_read' ? 'CHCĘ PRZECZYTAĆ' : book.user_status === 'reading' ? 'CZYTAM' : 'PRZECZYTANE'}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
