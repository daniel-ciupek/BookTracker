import { useState } from 'react'

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
        <span className="text-yellow-400">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < Math.round(display) ? 'text-yellow-400' : 'text-gray-300'}>
              ★
            </span>
          ))}
        </span>
        {value !== null && (
          <span className="text-gray-500">
            {value.toFixed(1)}
            {count !== undefined && <span className="ml-1">({count})</span>}
          </span>
        )}
        {value === null && <span className="text-gray-400 text-xs">Brak ocen</span>}
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
              'text-xl leading-none transition-colors',
              star <= display ? 'text-yellow-400' : 'text-gray-300',
              'hover:scale-110',
            ].join(' ')}
          >
            ★
          </button>
        )
      })}
    </span>
  )
}
