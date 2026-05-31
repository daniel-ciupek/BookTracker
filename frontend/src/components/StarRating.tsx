import { useState } from 'react'
import { Star } from 'lucide-react'

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
              size={16}
              className={i < Math.round(display) ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'fill-slate-200/50 text-slate-300 dark:fill-slate-800 dark:text-slate-700'} 
              strokeWidth={1.5}
            />
          ))}
        </span>
        {value !== null && (
          <span className="text-slate-600 dark:text-slate-300 font-bold ml-1 drop-shadow-sm">
            {value.toFixed(1)}
            {count !== undefined && <span className="ml-1 font-medium opacity-70">({count})</span>}
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
              'transition-all duration-300 hover:scale-125 focus:outline-none',
              star <= display ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 'text-slate-300 dark:text-slate-600 hover:text-amber-300',
            ].join(' ')}
          >
            <Star size={22} className={star <= display ? 'fill-amber-400' : 'fill-transparent'} strokeWidth={1.5} />
          </button>
        )
      })}
    </span>
  )
}
