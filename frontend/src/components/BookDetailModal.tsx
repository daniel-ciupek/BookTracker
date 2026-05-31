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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-gray-100 p-1.5 text-gray-500 hover:bg-gray-200"
          aria-label="Zamknij"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex gap-4 p-6">
          <ImageWithFallback
            src={coverUrl || undefined}
            alt={`Okładka: ${book.title}`}
            className="h-36 w-24 flex-shrink-0 rounded-md object-cover shadow"
            fallback={
              <div className="flex h-36 w-24 flex-shrink-0 items-center justify-center rounded-md bg-indigo-50 text-3xl shadow">
                📖
              </div>
            }
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-gray-900">{book.title}</h2>
            <p className="mt-0.5 text-base text-gray-600">{book.author}</p>
            {book.genre && (
              <span className="mt-2 inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                {book.genre}
              </span>
            )}
            {book.pages && (
              <p className="mt-1 text-sm text-gray-400">{book.pages} stron</p>
            )}
            {book.added_by && (
              <p className="mt-1 text-xs text-gray-400">Dodał: {book.added_by.name}</p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 px-6 py-4">
          {/* Ratings */}
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">Średnia ocena</p>
              <StarRating value={book.avg_rating} count={book.ratings_count} readonly />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">Twoja ocena</p>
              <StarRating value={userRating} onRate={handleRate} />
            </div>
          </div>

          {/* Status */}
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium text-gray-500">Status czytania</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STATUS_LABELS) as ReadingStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleStatus(s)}
                  className={[
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    userStatus === s
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  ].join(' ')}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <p className="mb-3 text-sm font-semibold text-gray-800">
              Recenzje ({book.reviews_count})
            </p>

            {/* Add/Edit review form */}
            {!editingReview && !myReview && (
              <form onSubmit={handleReviewSubmit} className="mb-4">
                <textarea
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  placeholder="Napisz recenzję…"
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {reviewError && <p className="mt-1 text-xs text-red-600">{reviewError}</p>}
                <button
                  type="submit"
                  disabled={upsertReview.isPending}
                  className="mt-2 rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {upsertReview.isPending ? 'Zapisywanie…' : 'Dodaj recenzję'}
                </button>
              </form>
            )}

            {editingReview && (
              <form onSubmit={handleReviewSubmit} className="mb-4">
                <textarea
                  value={editingReview.body}
                  onChange={(e) => setEditingReview({ ...editingReview, body: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-indigo-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={upsertReview.isPending}
                    className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {upsertReview.isPending ? 'Zapisywanie…' : 'Zapisz'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingReview(null)}
                    className="rounded-lg bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            )}

            {/* Reviews list */}
            <div className="space-y-3">
              {allReviews.length === 0 && (
                <p className="text-sm text-gray-400">Brak recenzji. Bądź pierwszy!</p>
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
                className="mt-3 text-sm text-indigo-600 hover:underline disabled:opacity-50"
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
