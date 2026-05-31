import { useState, useRef } from 'react'
import { useTheme } from './ThemeProvider'
import { useDeleteRating, useUpsertRating } from '../hooks/useRating'
import type { Book, ReadingStatus } from '../types/book'
import { StarRating } from './StarRating'
import { ImageWithFallback } from './ImageWithFallback'
import { Bookmark, BookOpen, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const STATUS_CONFIG: Record<ReadingStatus, { label: string; color: string }> = {
  want_to_read: { label: 'Chcę przeczytać', color: 'rgba(56,189,248,0.8)' },
  reading: { label: 'Czytam', color: 'rgba(232,121,249,0.8)' },
  read: { label: 'Przeczytane', color: 'rgba(52,211,153,0.8)' },
}

const STATUS_DOT: Record<ReadingStatus, string> = {
  want_to_read: 'bg-sky-100 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40 text-sky-700 dark:text-sky-300',
  reading: 'bg-purple-100 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 text-purple-700 dark:text-purple-300',
  read: 'bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300',
}

const StatusIcon = ({ status, size = 12 }: { status: ReadingStatus; size?: number }) => {
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

const titleInitials = (title: string) =>
  title
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

export function BookCard({ book, onOpen }: Props) {
  const upsertRating = useUpsertRating(book.id)
  const deleteRating = useDeleteRating(book.id)
  const { theme } = useTheme()
  const [isHovered, setIsHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const coverUrl = book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg` : null

  function handleRate(v: number | null) {
    if (v === null) {
      deleteRating.mutate()
    } else {
      upsertRating.mutate(v)
    }
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <motion.div
      ref={cardRef}
      whileTap={{ scale: 0.99 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className="glass-card flex cursor-pointer items-start gap-4 p-4 overflow-hidden relative"
      style={{
        borderColor: isHovered ? 'rgba(147,51,234,0.3)' : undefined,
        boxShadow: isHovered ? '0 8px 32px rgba(0,0,0,0.12)' : undefined,
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
      }}
      onClick={() => onOpen(book)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(book)}
    >
      {isHovered && theme === 'dark' && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            background: `radial-gradient(220px at ${mousePos.x}px ${mousePos.y}px, rgba(147,51,234,0.09), transparent)`,
            pointerEvents: 'none',
          }}
        />
      )}
      <ImageWithFallback
        src={coverUrl || undefined}
        alt=""
        className="h-[110px] w-[80px] flex-shrink-0 rounded-lg object-cover shadow-md"
        fallback={
          <div className="flex h-[110px] w-[80px] flex-shrink-0 items-center justify-center rounded-lg text-lg font-bold select-none
            bg-purple-100 dark:bg-purple-950/40
            text-purple-600 dark:text-purple-300
            border border-purple-200 dark:border-purple-800/40">
            {titleInitials(book.title)}
          </div>
        }
      />

      <div className="min-w-0 flex-1 flex flex-col gap-1.5 py-0.5">
        <p className="font-bold text-base text-slate-800 dark:text-white leading-snug line-clamp-2">{book.title}</p>
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 line-clamp-1">
          {book.author}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <StarRating value={book.avg_rating} count={book.ratings_count} readonly />
        </div>

        <div className="mt-0.5" onClick={(e) => e.stopPropagation()}>
          <StarRating value={book.user_rating} onRate={handleRate} />
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {book.genre && (
            <span className="font-mono text-[10px] font-semibold rounded-full px-2 py-0.5
              bg-purple-100 dark:bg-purple-950/40
              border border-purple-200 dark:border-purple-800/40
              text-purple-700 dark:text-purple-300">
              {book.genre.toUpperCase()}
            </span>
          )}
          {book.user_status && (
            <span className={`font-mono text-[10px] font-semibold rounded-full px-2 py-0.5 flex items-center gap-1 ${STATUS_DOT[book.user_status]}`}>
              <StatusIcon status={book.user_status} size={10} />
              {STATUS_CONFIG[book.user_status].label.toUpperCase()}
            </span>
          )}
          {book.reviews_count > 0 && (
            <span className="font-mono text-[10px] text-slate-400 dark:text-white/30 ml-auto">
              {book.reviews_count} rec.
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
