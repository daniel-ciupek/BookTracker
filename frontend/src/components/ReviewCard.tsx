import type { Review } from '../types/review'
import { Edit2, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { getInitials } from '../lib/initials'

interface Props {
  review: Review
  currentUserId?: number
  onEdit?: (review: Review) => void
  onDelete?: (reviewId: number) => void
}

export function ReviewCard({ review, currentUserId, onEdit, onDelete }: Props) {
  const initials = getInitials(review.user.name)

  const date = new Date(review.created_at).toLocaleDateString('pl-PL', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  const isOwn = currentUserId === review.user.id

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="glass-card p-4 rounded-xl"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold
            bg-purple-100 dark:bg-purple-950/50
            text-purple-700 dark:text-purple-300
            border border-purple-200 dark:border-purple-800/40">
            {initials}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{review.user.name}</p>
            <p className="font-mono text-[10px] text-slate-400 dark:text-white/30">{date}</p>
          </div>
        </div>
        {isOwn && (
          <div className="flex gap-1.5">
            <motion.button
              type="button"
              onClick={() => onEdit?.(review)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-7 w-7 items-center justify-center rounded-lg
                bg-indigo-50 dark:bg-indigo-950/40
                border border-indigo-200 dark:border-indigo-800/40
                text-indigo-600 dark:text-indigo-400"
              aria-label="Edytuj"
            >
              <Edit2 size={12} strokeWidth={2.5} />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => onDelete?.(review.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-7 w-7 items-center justify-center rounded-lg
                bg-red-50 dark:bg-red-950/40
                border border-red-200 dark:border-red-800/40
                text-red-500 dark:text-red-400"
              aria-label="Usuń"
            >
              <Trash2 size={12} strokeWidth={2.5} />
            </motion.button>
          </div>
        )}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-white/65">
        {review.body}
      </p>
    </motion.div>
  )
}
