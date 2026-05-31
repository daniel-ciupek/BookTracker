import { useState } from 'react'
import { Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  value: number | null
  count?: number
  readonly?: boolean
  onRate?: (v: number | null) => void
}

export function StarRating({ value, count, readonly = false, onRate }: Props) {
  const [hovered, setHovered] = useState<number | null>(null)

  const display = hovered ?? value ?? 0

  if (readonly) {
    return (
      <span className="inline-flex items-center gap-1 text-sm">
        <span className="flex items-center gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              size={14}
              className={i < Math.round(display) ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-slate-300 dark:text-white/15'}
              strokeWidth={1.5}
              style={i < Math.round(display) ? { filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.5))' } : {}}
            />
          ))}
        </span>
        {value !== null && (
          <span className="font-mono text-xs font-medium text-slate-500 dark:text-white/60 ml-0.5">
            {value.toFixed(1)}
            {count !== undefined && <span className="ml-1 opacity-60">({count})</span>}
          </span>
        )}
        {value === null && <span className="font-mono text-[10px] text-slate-400 dark:text-white/25 ml-0.5">Brak ocen</span>}
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-0"
      onMouseLeave={() => setHovered(null)}
      onClick={(e) => e.stopPropagation()}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1
        const isActive = star <= display
        return (
          <motion.button
            key={star}
            type="button"
            aria-label={`Ocena ${star}`}
            onMouseEnter={() => setHovered(star)}
            onClick={() => onRate?.(value === star ? null : star)}
            whileTap={{ scale: 1.3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="p-1 focus:outline-none"
          >
            <Star
              size={20}
              strokeWidth={1.5}
              className={isActive ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-slate-300 dark:text-white/20'}
              style={isActive ? { filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.6))' } : {}}
            />
          </motion.button>
        )
      })}
    </span>
  )
}
