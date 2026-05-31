import type { Review } from '../types/review'
import { IconEdit, IconTrash } from '@tabler/icons-react'

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
    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-850/50 dark:hover:bg-slate-850">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-extrabold text-indigo-600 shadow-sm dark:bg-indigo-500/20 dark:text-indigo-400">
            {initials}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{review.user.name}</p>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{date}</p>
          </div>
        </div>
        {isOwn && (
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => onEdit?.(review)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm transition-colors hover:bg-indigo-50 dark:bg-slate-800 dark:text-indigo-400 dark:hover:bg-slate-700"
              aria-label="Edytuj"
            >
              <IconEdit size={16} stroke={2.5} />
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(review.id)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 shadow-sm transition-colors hover:bg-red-50 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-slate-700"
              aria-label="Usuń"
            >
              <IconTrash size={16} stroke={2.5} />
            </button>
          </div>
        )}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">{review.body}</p>
    </div>
  )
}
