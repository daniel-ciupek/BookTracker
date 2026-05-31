import { useEffect, useRef, useState } from 'react'

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
      <input
        type="search"
        placeholder="Szukaj po tytule lub autorze… (min. 3 znaki)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      {showHint && (
        <p className="mt-1 text-xs text-gray-400">
          Wpisz jeszcze {MIN_CHARS - trimmed.length}{' '}
          {MIN_CHARS - trimmed.length === 1 ? 'znak' : 'znaki'}…
        </p>
      )}
    </div>
  )
}
