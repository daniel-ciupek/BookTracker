import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'

interface Props {
  onSearch: (value: string) => void
}

const MIN_CHARS = 3

export function SearchBar({ onSearch }: Props) {
  const [value, setValue] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)

    // Fire search only when input is empty (reset) or has enough characters
    const term = value.trim()
    if (term.length === 0 || term.length >= MIN_CHARS) {
      timer.current = setTimeout(() => onSearch(term), 300)
    }

    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [value, onSearch])

  const trimmed = value.trim()
  const showHint = trimmed.length > 0 && trimmed.length < MIN_CHARS

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Search 
          size={18} 
          className="absolute left-4 text-slate-400 dark:text-slate-500" 
          strokeWidth={2.5} 
        />
        <input
          type="search"
          placeholder="Szukaj po tytule lub autorze…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="glass-input pl-11"
        />
      </div>
      {showHint && (
        <p className="mt-2 pl-1 text-xs font-medium text-slate-400 dark:text-slate-500">
          Wpisz jeszcze {MIN_CHARS - trimmed.length}{' '}
          {MIN_CHARS - trimmed.length === 1 ? 'znak' : 'znaki'}…
        </p>
      )}
    </div>
  )
}
