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
import { IconX, IconBook } from '@tabler/icons-react'

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="relative flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-soft-lg dark:bg-slate-850 dark:border dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          aria-label="Zamknij"
        >
          <IconX size={20} stroke={2.5} />
        </button>

        <div className="overflow-y-auto">
          {/* Header */}
          <div className="flex gap-5 p-6 sm:p-8">
            <ImageWithFallback
              src={coverUrl || undefined}
              alt={`Okładka: ${book.title}`}
              className="h-40 w-28 flex-shrink-0 rounded-xl object-cover shadow-md dark:opacity-90"
              fallback={
                <div className="flex h-40 w-28 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-300 dark:bg-slate-800 dark:text-slate-600 shadow-sm">
                  <IconBook size={40} stroke={1.5} />
                </div>
              }
            />
            <div className="min-w-0 flex-1 pt-1">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">{book.title}</h2>
              <p className="mt-1 text-base font-medium text-slate-500 dark:text-slate-400">{book.author}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {book.genre && (
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold tracking-wide text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    {book.genre.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="mt-3 text-sm text-slate-400 dark:text-slate-500">
                {book.pages && <span className="mr-3">{book.pages} stron</span>}
                {book.added_by && <span>Dodał: {book.added_by.name}</span>}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 px-6 py-6 dark:border-slate-800 sm:px-8">
            {/* Ratings */}
            <div className="mb-6 flex flex-wrap items-center gap-8">
              <div>
                <p className="mb-1.5 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">Średnia ocena</p>
                <StarRating value={book.avg_rating} count={book.ratings_count} readonly />
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">Twoja ocena</p>
                <StarRating value={userRating} onRate={handleRate} />
              </div>
            </div>

            {/* Status */}
            <div className="mb-8">
              <p className="mb-2.5 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">Status czytania</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(STATUS_LABELS) as ReadingStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStatus(s)}
                    className={[
                      'rounded-full px-4 py-1.5 text-sm font-bold transition-colors',
                      userStatus === s
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
                    ].join(' ')}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <p className="mb-4 text-base font-bold text-slate-800 dark:text-slate-200">
                Recenzje <span className="text-slate-400 dark:text-slate-500 font-normal">({book.reviews_count})</span>
              </p>

              {/* Add/Edit review form */}
              {!editingReview && !myReview && (
                <form onSubmit={handleReviewSubmit} className="mb-6">
                  <textarea
                    value={reviewBody}
                    onChange={(e) => setReviewBody(e.target.value)}
                    placeholder="Napisz recenzję…"
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder-slate-400 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-500"
                  />
                  {reviewError && <p className="mt-1.5 pl-2 text-xs font-medium text-red-500">{reviewError}</p>}
                  <button
                    type="submit"
                    disabled={upsertReview.isPending}
                    className="mt-2.5 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
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
                    className="w-full rounded-2xl border border-indigo-300 bg-white px-4 py-3 text-sm text-slate-700 placeholder-slate-400 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-indigo-500/50 dark:bg-slate-900 dark:text-slate-200"
                  />
                  <div className="mt-2.5 flex gap-2.5">
                    <button
                      type="submit"
                      disabled={upsertReview.isPending}
                      className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {upsertReview.isPending ? 'Zapisywanie…' : 'Zapisz zmiany'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingReview(null)}
                      className="rounded-xl bg-slate-100 px-5 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Anuluj
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews list */}
              <div className="space-y-4">
                {allReviews.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm font-medium text-slate-400 dark:border-slate-800 dark:text-slate-500">
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
                  className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-slate-800 dark:text-indigo-400 dark:hover:bg-slate-800/50 disabled:opacity-50"
                >
                  {isFetchingNextPage ? 'Ładowanie…' : 'Załaduj więcej recenzji'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
