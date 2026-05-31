import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onSearch: (value: string) => void
}

const MIN_CHARS = 3

export function SearchBar({ onSearch }: Props) {
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)

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
    <div>
      <motion.div
        className="relative flex items-center"
        animate={{
          boxShadow: isFocused ? '0 0 0 2px rgba(168,85,247,0.4), 0 0 0 4px rgba(168,85,247,0.15)' : '0 0 0 0px transparent',
        }}
        transition={{ duration: 0.2 }}
        style={{ borderRadius: '12px' }}
      >
        <Search
          size={16}
          className="absolute left-3.5 pointer-events-none"
          style={{ color: isFocused ? 'rgba(168,85,247,0.7)' : 'rgba(255,255,255,0.3)' }}
          strokeWidth={2.5}
        />
        <input
          type="search"
          placeholder="Szukaj po tytule lub autorze…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="aurora-input pl-10 pr-10"
          style={{ boxShadow: 'none' }}
        />
        <AnimatePresence>
          {value.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              type="button"
              onClick={() => setValue('')}
              className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)',
              }}
              aria-label="Wyczyść"
            >
              <X size={11} strokeWidth={2.5} />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>
        {showHint && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 pl-1 text-xs font-medium text-white/30 overflow-hidden font-mono"
          >
            Wpisz jeszcze {MIN_CHARS - trimmed.length}{' '}
            {MIN_CHARS - trimmed.length === 1 ? 'znak' : 'znaki'}…
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
