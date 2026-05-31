import type { Review } from '../types/review'

interface Props {
  review: Review
  currentUserId?: number
  onEdit?: (review: Review) => void
  onDelete?: (reviewId: number) => void
}

export function ReviewCard({ review, currentUserId, onEdit, onDelete }: Props) {
  const initials = review.user.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const date = new Date(review.created_at).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const isOwn = currentUserId === review.user.id

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{review.user.name}</p>
            <p className="text-xs text-gray-400">{date}</p>
          </div>
        </div>
        {isOwn && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(review)}
              className="text-xs text-indigo-600 hover:underline"
            >
              Edytuj
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(review.id)}
              className="text-xs text-red-500 hover:underline"
            >
              Usuń
            </button>
          </div>
        )}
      </div>
      <p className="whitespace-pre-wrap text-sm text-gray-700">{review.body}</p>
    </div>
  )
}
