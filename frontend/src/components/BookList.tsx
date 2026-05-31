import { useEffect, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useBooks } from '../hooks/useBooks'
import type { Book } from '../types/book'
import { BookCard } from './BookCard'
import { BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  search: string
  genre?: string
  onlyMine?: boolean
  onOpenBook: (book: Book) => void
}

const SkeletonCard = () => (
  <div className="glass-card p-4">
    <div className="flex gap-4">
      <div className="h-[110px] w-[80px] rounded-lg flex-shrink-0 bg-black/[0.06] dark:bg-white/[0.05] shimmer" />
      <div className="flex-1 space-y-2.5 py-1">
        <div className="h-4 w-3/4 rounded-lg bg-black/[0.06] dark:bg-white/[0.05] shimmer" />
        <div className="h-3 w-1/2 rounded-lg bg-black/[0.06] dark:bg-white/[0.05] shimmer" />
        <div className="h-3 w-2/3 rounded-lg bg-black/[0.06] dark:bg-white/[0.05] shimmer mt-3" />
        <div className="h-3 w-1/4 rounded-lg bg-black/[0.06] dark:bg-white/[0.05] shimmer" />
      </div>
    </div>
  </div>
)

export function BookList({ search, genre, onlyMine, onOpenBook }: Props) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useBooks(search, genre, onlyMine)

  const allBooks = data?.pages.flatMap((p) => p.data) ?? []

  const parentRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: allBooks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 160,
    overscan: 5,
    measureElement:
      typeof window !== 'undefined'
        ? (el) => el.getBoundingClientRect().height
        : undefined,
  })

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) {
    return (
      <div className="space-y-3" aria-label="Ładowanie książek">
        <span className="sr-only">Ładowanie…</span>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-sm font-medium text-red-500 dark:text-red-400">Błąd ładowania książek.</p>
      </div>
    )
  }

  if (allBooks.length === 0) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-14 text-center"
        >
          <motion.div
            animate={{ boxShadow: ['0 0 0px rgba(147,51,234,0)', '0 0 24px rgba(147,51,234,0.25)', '0 0 0px rgba(147,51,234,0)'] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40"
          >
            <BookOpen size={26} className="text-purple-600 dark:text-purple-400" strokeWidth={1.5} />
          </motion.div>
          <p className="text-base font-semibold text-slate-700 dark:text-white/70">
            {search
              ? 'Brak wyników dla podanej frazy.'
              : (
                <>
                  <span className="gradient-text">Twoja biblioteka czeka na pierwsze tytuły</span>
                  <span className="sr-only">Brak książek.</span>
                </>
              )
            }
          </p>
          {!search && (
            <p className="mt-2 text-sm text-slate-400 dark:text-white/30">
              Dodaj swoją pierwszą książkę po lewej stronie.
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div ref={parentRef} className="overflow-y-auto h-[500px] md:h-[calc(100vh-220px)]">
      <div
        style={{ height: virtualizer.getTotalSize(), position: 'relative' }}
        aria-label="Lista książek"
      >
        {virtualizer.getVirtualItems().map((item) => (
          <div
            key={item.key}
            data-index={item.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${item.start}px)`,
              padding: '4px 0',
            }}
          >
            <BookCard book={allBooks[item.index]} onOpen={onOpenBook} />
          </div>
        ))}
      </div>
      <div ref={sentinelRef} style={{ height: 1 }} />
      {isFetchingNextPage && (
        <div className="py-4 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 dark:text-white/30">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border border-slate-300 dark:border-white/20 border-t-purple-500 dark:border-t-purple-400" />
            ładowanie…
          </div>
        </div>
      )}
    </div>
  )
}
