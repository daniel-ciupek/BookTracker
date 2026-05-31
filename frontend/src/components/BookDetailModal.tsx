import React, { useEffect, useRef, useState } from 'react'
import { useDeleteRating, useUpsertRating } from '../hooks/useRating'
import { useDeleteReview, useReviews, useUpsertReview } from '../hooks/useReviews'
import { useDeleteStatus, useUpsertStatus } from '../hooks/useReadingStatus'
import type { Book, ReadingStatus } from '../types/book'
import type { Review } from '../types/review'
import { useAuth } from '../hooks/useAuth'
import { ReviewCard } from './ReviewCard'
import { StarRating } from './StarRating'
import { ImageWithFallback } from './ImageWithFallback'
import { X, Check, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { getInitials } from '../lib/initials'

const STATUS_LABELS: Record<ReadingStatus, string> = {
  want_to_read: 'Chcę przeczytać',
  reading: 'Czytam',
  read: 'Przeczytane',
}

const STATUS_ACTIVE_CLASS: Record<ReadingStatus, string> = {
  want_to_read: 'bg-sky-100 dark:bg-sky-950/40 border-sky-300 dark:border-sky-700/60 text-sky-700 dark:text-sky-300',
  reading: 'bg-purple-100 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700/60 text-purple-700 dark:text-purple-300',
  read: 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300',
}

interface Props {
  book: Book
  onClose: () => void
}


export function BookDetailModal({ book, onClose }: Props) {
  const { user } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)

  const [userRating, setUserRating] = useState(book.user_rating)
  const [userStatus, setUserStatus] = useState(book.user_status)
  const [reviewBody, setReviewBody] = useState('')
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [reviewError, setReviewError] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data: reviewsData, fetchNextPage, hasNextPage, isFetchingNextPage } = useReviews(book.id)
  const allReviews = reviewsData?.pages.flatMap((p) => p.data) ?? []
  const myReview = allReviews.find((r) => r.user.id === user?.id)

  const upsertRating = useUpsertRating(book.id)
  const deleteRating = useDeleteRating(book.id)
  const upsertReview = useUpsertReview(book.id)
  const deleteReview = useDeleteReview(book.id)
  const upsertStatus = useUpsertStatus(book.id)
  const deleteStatus = useDeleteStatus(book.id)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleRate(v: number | null) {
    setUserRating(v)
    if (v === null) deleteRating.mutate()
    else upsertRating.mutate(v)
  }

  function handleStatus(s: ReadingStatus) {
    if (userStatus === s) {
      setUserStatus(null)
      deleteStatus.mutate()
    } else {
      setUserStatus(s)
      upsertStatus.mutate(s)
    }
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body = editingReview ? editingReview.body : reviewBody
    if (!body.trim()) { setReviewError('Recenzja nie może być pusta.'); return }
    setReviewError('')
    await upsertReview.mutateAsync(body)
    setReviewBody('')
    setEditingReview(null)
  }

  const coverUrl = book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg` : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 16 }}
        transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
        ref={containerRef}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl glass-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* close button */}
        <motion.button
          type="button"
          onClick={onClose}
          whileHover={{ rotate: 90, scale: 1.1 }}
          transition={{ duration: 0.2 }}
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full
            bg-black/[0.06] dark:bg-white/[0.06]
            border border-black/[0.08] dark:border-white/[0.08]
            text-slate-500 dark:text-white/60
            hover:bg-black/[0.1] dark:hover:bg-white/[0.1]"
          aria-label="Zamknij"
        >
          <X size={16} strokeWidth={2.5} />
        </motion.button>

        <div className="overflow-y-auto">
          {/* header */}
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-7 p-6 sm:p-8 items-start">
            <ImageWithFallback
              src={coverUrl || undefined}
              alt={`Okładka: ${book.title}`}
              className="h-[160px] w-[110px] flex-shrink-0 rounded-xl object-cover shadow-xl"
              fallback={
                <div
                  className="flex h-[160px] w-[110px] flex-shrink-0 items-center justify-center rounded-xl
                    text-xl font-bold select-none shadow-xl
                    bg-purple-100 dark:bg-purple-950/40
                    text-purple-600 dark:text-purple-300
                    border border-purple-200 dark:border-purple-800/40"
                >
                  {getInitials(book.title)}
                </div>
              }
            />

            <div className="min-w-0 flex-1 pt-1">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-1">
                {book.title}
              </h2>
              <p className="text-base font-medium mb-4 text-indigo-600 dark:text-indigo-400">
                {book.author}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {book.genre && (
                  <span className="font-mono text-[10px] font-semibold rounded-full px-2.5 py-1
                    bg-purple-100 dark:bg-purple-950/40
                    border border-purple-200 dark:border-purple-800/40
                    text-purple-700 dark:text-purple-300">
                    {book.genre.toUpperCase()}
                  </span>
                )}
                {book.pages && (
                  <span className="font-mono text-[10px] font-semibold rounded-full px-2.5 py-1
                    bg-slate-100 dark:bg-white/[0.05]
                    border border-slate-200 dark:border-white/[0.08]
                    text-slate-500 dark:text-white/50">
                    {book.pages} STR.
                  </span>
                )}
              </div>

              {book.added_by && (
                <p className="font-mono text-[10px] text-slate-400 dark:text-white/30">
                  dodane przez: <span className="text-slate-500 dark:text-white/50">{book.added_by.name}</span>
                </p>
              )}
            </div>
          </div>

          {/* divider */}
          <div className="mx-6 sm:mx-8 h-px bg-black/[0.06] dark:bg-white/[0.06]" />

          {/* ratings + status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 sm:p-8">
            <div className="space-y-5">
              <div>
                <h3 className="mb-2.5 font-mono text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-white/35">
                  Średnia ocena
                </h3>
                <StarRating value={book.avg_rating} count={book.ratings_count} readonly />
              </div>
              <div>
                <h3 className="mb-2.5 font-mono text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-white/35">
                  Twoja ocena
                </h3>
                <StarRating value={userRating} onRate={handleRate} />
              </div>
            </div>

            <div>
              <h3 className="mb-2.5 font-mono text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-white/35">
                Status czytania
              </h3>
              <div className="flex flex-col gap-2">
                {(Object.keys(STATUS_LABELS) as ReadingStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStatus(s)}
                    className={[
                      'flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold border transition-all duration-200',
                      userStatus === s
                        ? STATUS_ACTIVE_CLASS[s]
                        : 'bg-black/[0.03] dark:bg-white/[0.03] border-black/[0.07] dark:border-white/[0.07] text-slate-600 dark:text-white/50 hover:bg-black/[0.06] dark:hover:bg-white/[0.06]',
                    ].join(' ')}
                  >
                    <span>{STATUS_LABELS[s]}</span>
                    {userStatus === s && <Check size={14} strokeWidth={2.5} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* reviews section */}
          <div className="p-6 sm:p-8 border-t border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-black/[0.15]">
            <h3 className="mb-5 text-base font-bold text-slate-800 dark:text-white">
              Recenzje{' '}
              <span className="font-mono text-xs text-slate-400 dark:text-white/30">({book.reviews_count})</span>
            </h3>

            {!editingReview && !myReview && (
              <form onSubmit={handleReviewSubmit} className="mb-6">
                <textarea
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  placeholder="Napisz recenzję…"
                  rows={3}
                  className="aurora-textarea"
                />
                {reviewError && (
                  <p className="mt-2 pl-1 text-xs font-medium text-red-500 dark:text-red-400">{reviewError}</p>
                )}
                <button
                  type="submit"
                  disabled={upsertReview.isPending}
                  className="mt-3 glow-button rounded-xl px-5 py-2 text-sm font-semibold"
                >
                  {upsertReview.isPending ? 'Zapisywanie…' : 'Dodaj recenzję'}
                </button>
              </form>
            )}

            {editingReview && (
              <form onSubmit={handleReviewSubmit} className="mb-6">
                <textarea
                  value={editingReview.body}
                  onChange={(e) => setEditingReview({ ...editingReview, body: e.target.value })}
                  rows={3}
                  className="aurora-textarea"
                />
                <div className="mt-3 flex gap-3">
                  <button type="submit" disabled={upsertReview.isPending} className="glow-button rounded-xl px-5 py-2 text-sm font-semibold">
                    {upsertReview.isPending ? 'Zapisywanie…' : 'Zapisz zmiany'}
                  </button>
                  <button type="button" onClick={() => setEditingReview(null)} className="glass-button-secondary rounded-xl px-5 py-2 text-sm font-semibold">
                    Anuluj
                  </button>
                </div>
              </form>
            )}

            {deleteError && (
              <p className="mb-3 text-xs font-medium text-red-500 dark:text-red-400">{deleteError}</p>
            )}

            <div className="space-y-3">
              {allReviews.length === 0 && (
                <div className="glass-card p-8 text-center border-dashed">
                  <BookOpen size={20} className="mx-auto mb-2 text-slate-300 dark:text-white/20" strokeWidth={1.5} />
                  <p className="text-sm font-medium text-slate-400 dark:text-white/30">Brak recenzji. Bądź pierwszy!</p>
                </div>
              )}
              {allReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  currentUserId={user?.id}
                  onEdit={(r) => setEditingReview(r)}
                  onDelete={async () => {
                    setDeleteError(null)
                    try {
                      await deleteReview.mutateAsync()
                    } catch {
                      setDeleteError('Nie udało się usunąć recenzji. Spróbuj ponownie.')
                    }
                  }}
                />
              ))}
            </div>

            {hasNextPage && (
              <button
                type="button"
                onClick={() => void fetchNextPage()}
                disabled={isFetchingNextPage}
                className="mt-5 w-full glass-button-secondary rounded-xl py-2.5 text-sm font-semibold"
              >
                {isFetchingNextPage ? 'Ładowanie…' : 'Załaduj więcej recenzji'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
