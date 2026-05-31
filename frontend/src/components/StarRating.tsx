import { useState } from 'react'
import { IconStarFilled } from '@tabler/icons-react'

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
            <IconStarFilled 
              key={i} 
              size={16}
              className={i < Math.round(display) ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'} 
            />
          ))}
        </span>
        {value !== null && (
          <span className="text-slate-500 dark:text-slate-400 font-medium ml-1">
            {value.toFixed(1)}
            {count !== undefined && <span className="ml-1 opacity-70">({count})</span>}
          </span>
        )}
        {value === null && <span className="text-slate-400 dark:text-slate-500 text-xs ml-1 font-medium">Brak ocen</span>}
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-0.5"
      onMouseLeave={() => setHovered(null)}
      onClick={(e) => e.stopPropagation()}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1
        return (
          <button
            key={star}
            type="button"
            aria-label={`Ocena ${star}`}
            onMouseEnter={() => setHovered(star)}
            onClick={() => onRate?.(value === star ? null : star)}
            className={[
              'transition-all hover:scale-110',
              star <= display ? 'text-amber-400 drop-shadow-sm' : 'text-slate-200 dark:text-slate-700 hover:text-amber-300',
            ].join(' ')}
          >
            <IconStarFilled size={22} />
          </button>
        )
      })}
    </span>
  )
}
