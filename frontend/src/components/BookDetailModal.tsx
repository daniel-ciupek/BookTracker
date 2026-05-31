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
import { X, Check, Library } from 'lucide-react'
import { motion } from 'framer-motion'

const STATUS_LABELS: Record<ReadingStatus, string> = {
  want_to_read: 'Chcę przeczytać',
  reading: 'Czytam',
  read: 'Przeczytane',
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
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleRate(v: number | null) {
    setUserRating(v)
    if (v === null) {
      deleteRating.mutate()
    } else {
      upsertRating.mutate(v)
    }
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
    if (!body.trim()) {
      setReviewError('Recenzja nie może być pusta.')
      return
    }
    setReviewError('')
    await upsertReview.mutateAsync(body)
    setReviewBody('')
    setEditingReview(null)
  }

  async function handleDeleteReview() {
    await deleteReview.mutateAsync()
  }

  const coverUrl = book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg` : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 dark:bg-black/60 backdrop-blur-sm px-4 py-6 sm:p-6 transition-all"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
        ref={containerRef}
        className="relative flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-[24px] bg-white/95 dark:bg-[#0a0a0a]/90 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.7)] ring-1 ring-slate-200 dark:ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none rounded-t-[24px]" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100/50 text-slate-500 hover:bg-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors backdrop-blur-md"
          aria-label="Zamknij"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        <div className="overflow-y-auto relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 p-6 sm:p-10 items-start">
            {/* Cover */}
            <ImageWithFallback
              src={coverUrl || undefined}
              alt={`Okładka: ${book.title}`}
              className="h-56 w-36 sm:h-64 sm:w-44 flex-shrink-0 rounded-xl object-cover shadow-xl ring-1 ring-black/10 dark:ring-white/10"
              fallback={
                <div className="relative flex h-56 w-36 sm:h-64 sm:w-44 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 ring-1 ring-inset ring-slate-200 dark:ring-white/5 overflow-hidden">
                  <div className="absolute inset-0 bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
                  <Library size={36} className="text-slate-400 dark:text-slate-600 z-10" strokeWidth={1} />
                </div>
              }
            />

            {/* Info */}
            <div className="min-w-0 flex-1 pt-2 sm:pt-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-2">
                {book.title}
              </h2>
              <p className="text-lg font-medium text-slate-500 dark:text-slate-400 mb-6">
                {book.author}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {book.genre && (
                  <span className="rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {book.genre}
                  </span>
                )}
                {book.pages && (
                  <span className="rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {book.pages} stron
                  </span>
                )}
              </div>

              {book.added_by && (
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  Dodane przez: <span className="text-slate-700 dark:text-slate-300">{book.added_by.name}</span>
                </p>
              )}
            </div>
          </div>

          <div className="mx-6 sm:mx-10 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

          {/* Interaction Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 p-6 sm:p-10">
            {/* Ratings */}
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-[11px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Średnia ocena</h3>
                <StarRating value={book.avg_rating} count={book.ratings_count} readonly />
              </div>
              <div>
                <h3 className="mb-3 text-[11px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Twoja ocena</h3>
                <StarRating value={userRating} onRate={handleRate} />
              </div>
            </div>

            {/* Status */}
            <div>
              <h3 className="mb-3 text-[11px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Status czytania</h3>
              <div className="flex flex-col gap-2.5">
                {(Object.keys(STATUS_LABELS) as ReadingStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStatus(s)}
                    className={[
                      'group relative flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 border',
                      userStatus === s
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80',
                    ].join(' ')}
                  >
                    <span>{STATUS_LABELS[s]}</span>
                    {userStatus === s && <Check size={16} strokeWidth={2.5} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-slate-50/50 dark:bg-slate-900/30 p-6 sm:p-10 border-t border-slate-100 dark:border-slate-800/50">
            <h3 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">
              Recenzje <span className="text-slate-400 font-normal">({book.reviews_count})</span>
            </h3>

            {/* Add/Edit review form */}
            {!editingReview && !myReview && (
              <form onSubmit={handleReviewSubmit} className="mb-8">
                <textarea
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  placeholder="Napisz recenzję…"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0a0a] px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                {reviewError && <p className="mt-2 pl-2 text-xs font-bold text-red-500">{reviewError}</p>}
                <button
                  type="submit"
                  disabled={upsertReview.isPending}
                  className="mt-3 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {upsertReview.isPending ? 'Zapisywanie…' : 'Dodaj recenzję'}
                </button>
              </form>
            )}

            {editingReview && (
              <form onSubmit={handleReviewSubmit} className="mb-8">
                <textarea
                  value={editingReview.body}
                  onChange={(e) => setEditingReview({ ...editingReview, body: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-indigo-500/50 bg-white dark:bg-[#0a0a0a] px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <div className="mt-3 flex gap-3">
                  <button
                    type="submit"
                    disabled={upsertReview.isPending}
                    className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {upsertReview.isPending ? 'Zapisywanie…' : 'Zapisz zmiany'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingReview(null)}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0a0a] px-6 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            )}

            {/* Reviews list */}
            <div className="space-y-4">
              {allReviews.length === 0 && (
                <p className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-[#0a0a0a]/50 p-10 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                  Brak recenzji. Bądź pierwszy!
                </p>
              )}
              {allReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  currentUserId={user?.id}
                  onEdit={(r) => setEditingReview(r)}
                  onDelete={() => void handleDeleteReview()}
                />
              ))}
            </div>

            {hasNextPage && (
              <button
                type="button"
                onClick={() => void fetchNextPage()}
                disabled={isFetchingNextPage}
                className="mt-6 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0a0a] px-6 py-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors disabled:opacity-50"
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
