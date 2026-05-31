import type { Review } from '../types/review'
import { Edit2, Trash2 } from 'lucide-react'

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
    <div className="rounded-2xl border border-white/40 bg-white/40 p-5 shadow-sm backdrop-blur-md transition-all hover:bg-white/60 dark:border-white/5 dark:bg-slate-900/40 dark:hover:bg-slate-900/60">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-extrabold text-indigo-600 shadow-inner backdrop-blur-md dark:bg-indigo-400/10 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-400/20">
            {initials}
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 drop-shadow-sm">{review.user.name}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{date}</p>
          </div>
        </div>
        {isOwn && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(review)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/50 text-indigo-600 shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/80 dark:bg-slate-800/50 dark:text-indigo-400 dark:hover:bg-slate-700/80 border border-white/40 dark:border-white/5"
              aria-label="Edytuj"
            >
              <Edit2 size={14} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(review.id)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/50 text-red-500 shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-red-50 dark:bg-slate-800/50 dark:text-red-400 dark:hover:bg-slate-700/80 border border-white/40 dark:border-white/5"
              aria-label="Usuń"
            >
              <Trash2 size={14} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium">{review.body}</p>
    </div>
  )
}
