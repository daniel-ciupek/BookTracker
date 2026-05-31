import { useEffect, useRef, useState } from 'react'
import { IconSearch } from '@tabler/icons-react'

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
        <IconSearch 
          size={18} 
          className="absolute left-4 text-slate-400 dark:text-slate-500" 
          stroke={2.5} 
        />
        <input
          type="search"
          placeholder="Szukaj po tytule lub autorze…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-2.5 text-sm font-medium text-slate-700 placeholder-slate-400 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-indigo-500"
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
