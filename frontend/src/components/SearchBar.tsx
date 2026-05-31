import { useEffect, useRef, useState } from 'react'

interface Props {
  onSearch: (value: string) => void
}

export function SearchBar({ onSearch }: Props) {
  const [value, setValue] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => onSearch(value.trim()), 300)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [value, onSearch])

  return (
    <input
      type="search"
      placeholder="Szukaj po tytule lub autorze…"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
    />
  )
}
