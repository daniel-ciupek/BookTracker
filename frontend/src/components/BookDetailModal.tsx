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
import { X, Book as BookIcon } from 'lucide-react'

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6 backdrop-blur-md transition-all"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="glass-panel relative flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-[2rem]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Blurred Background */}
        {coverUrl && (
          <div 
            className="absolute inset-x-0 top-0 h-80 opacity-30 dark:opacity-40"
            style={{
              backgroundImage: `url(${coverUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(50px)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
            }}
          />
        )}

        <button
          type="button"
          onClick={onClose}
          className="glass-icon-btn absolute right-5 top-5 z-20"
          aria-label="Zamknij"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className="overflow-y-auto relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-8 p-6 sm:p-10 items-start">
            <ImageWithFallback
              src={coverUrl || undefined}
              alt={`Okładka: ${book.title}`}
              className="h-64 w-44 sm:h-72 sm:w-48 flex-shrink-0 rounded-2xl object-cover shadow-[0_15px_40px_rgba(0,0,0,0.25)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/30 dark:ring-white/10 z-10"
              fallback={
                <div className="flex h-64 w-44 sm:h-72 sm:w-48 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-slate-400 shadow-inner border border-white/20 dark:border-white/5 backdrop-blur-md">
                  <BookIcon size={48} strokeWidth={1.5} />
                </div>
              }
            />
            <div className="min-w-0 flex-1 pt-2 sm:pt-4 z-10">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl drop-shadow-md leading-tight">{book.title}</h2>
              <p className="mt-3 text-lg font-bold text-slate-600 dark:text-slate-300 opacity-90">{book.author}</p>
              
              <div className="mt-6 flex flex-wrap gap-3">
                {book.genre && (
                  <span className="flex items-center rounded-xl bg-indigo-500/10 backdrop-blur-md border border-indigo-500/20 px-3 py-1.5 text-xs font-extrabold tracking-widest text-indigo-700 dark:text-indigo-300 shadow-sm uppercase">
                    {book.genre}
                  </span>
                )}
                {book.pages && (
                  <span className="flex items-center rounded-xl bg-slate-500/10 backdrop-blur-md border border-slate-500/20 px-3 py-1.5 text-xs font-extrabold tracking-widest text-slate-700 dark:text-slate-300 shadow-sm uppercase">
                    {book.pages} STRON
                  </span>
                )}
              </div>
              
              {book.added_by && (
                <div className="mt-8 flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400 bg-white/40 dark:bg-slate-900/40 p-2.5 pr-4 rounded-2xl backdrop-blur-md border border-white/30 dark:border-white/5 w-fit shadow-sm">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-extrabold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 shadow-inner">
                    {book.added_by.name.charAt(0).toUpperCase()}
                  </div>
                  <span>DODAŁ(A): <span className="text-slate-900 dark:text-slate-200">{book.added_by.name}</span></span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-y border-white/20 dark:border-slate-700/50 bg-white/20 dark:bg-slate-900/20 backdrop-blur-lg px-6 py-8 sm:px-10">
            {/* Ratings */}
            <div className="flex flex-col gap-5">
              <div>
                <p className="mb-2 text-[11px] font-extrabold tracking-widest text-slate-500 uppercase dark:text-slate-400 drop-shadow-sm">Średnia ocena</p>
                <div className="bg-white/50 dark:bg-slate-800/50 px-4 py-3 rounded-2xl border border-white/50 dark:border-white/5 w-fit shadow-sm backdrop-blur-md">
                  <StarRating value={book.avg_rating} count={book.ratings_count} readonly />
                </div>
              </div>
              <div>
                <p className="mb-2 text-[11px] font-extrabold tracking-widest text-slate-500 uppercase dark:text-slate-400 drop-shadow-sm">Twoja ocena</p>
                <div className="bg-white/50 dark:bg-slate-800/50 px-4 py-3 rounded-2xl border border-white/50 dark:border-white/5 w-fit shadow-sm backdrop-blur-md">
                  <StarRating value={userRating} onRate={handleRate} />
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="mb-3 text-[11px] font-extrabold tracking-widest text-slate-500 uppercase dark:text-slate-400 drop-shadow-sm">Status czytania</p>
              <div className="flex flex-wrap gap-2.5">
                {(Object.keys(STATUS_LABELS) as ReadingStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStatus(s)}
                    className={[
                      'rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 border backdrop-blur-md shadow-sm',
                      userStatus === s
                        ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] border-indigo-500 scale-[1.02]'
                        : 'bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-white/60 dark:border-slate-700/60 hover:bg-white/80 dark:hover:bg-slate-700/80',
                    ].join(' ')}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="px-6 py-8 sm:px-10">
            <p className="mb-5 text-lg font-extrabold text-slate-900 dark:text-slate-100 drop-shadow-sm">
              Recenzje <span className="text-slate-500 dark:text-slate-400 font-medium">({book.reviews_count})</span>
            </p>

            {/* Add/Edit review form */}
            {!editingReview && !myReview && (
              <form onSubmit={handleReviewSubmit} className="mb-8">
                <textarea
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  placeholder="Napisz recenzję…"
                  rows={3}
                  className="glass-input"
                />
                {reviewError && <p className="mt-2 pl-2 text-xs font-bold text-red-500">{reviewError}</p>}
                <button
                  type="submit"
                  disabled={upsertReview.isPending}
                  className="glass-button mt-3 w-max px-6"
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
                  className="glass-input focus:ring-indigo-500/80 border-indigo-400/50"
                />
                <div className="mt-3 flex gap-3">
                  <button
                    type="submit"
                    disabled={upsertReview.isPending}
                    className="glass-button px-6"
                  >
                    {upsertReview.isPending ? 'Zapisywanie…' : 'Zapisz zmiany'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingReview(null)}
                    className="glass-button-secondary px-6"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            )}

            {/* Reviews list */}
            <div className="space-y-4">
              {allReviews.length === 0 && (
                <p className="rounded-3xl border border-dashed border-slate-300 bg-white/40 dark:bg-slate-900/40 dark:border-slate-700 p-10 text-center text-sm font-bold text-slate-500 dark:text-slate-400 backdrop-blur-md">
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
                className="glass-button-secondary mt-5 w-full py-3"
              >
                {isFetchingNextPage ? 'Ładowanie…' : 'Załaduj więcej recenzji'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
