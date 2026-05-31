import { useEffect, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useBooks } from '../hooks/useBooks'
import type { Book } from '../types/book'
import { BookCard } from './BookCard'

interface Props {
  search: string
  genre?: string
  onOpenBook: (book: Book) => void
}

export function BookList({ search, genre, onOpenBook }: Props) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useBooks(search, genre)

  const allBooks = data?.pages.flatMap((p) => p.data) ?? []

  const parentRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: allBooks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 130,
    overscan: 10,
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
    return <p className="py-8 text-center text-sm text-gray-500">Ładowanie…</p>
  }

  if (isError) {
    return <p className="py-8 text-center text-sm text-red-500">Błąd ładowania książek.</p>
  }

  if (allBooks.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        {search ? 'Brak wyników dla podanej frazy.' : 'Brak książek. Dodaj pierwszą!'}
      </p>
    )
  }

  return (
    <div ref={parentRef} className="overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
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
        <p className="py-2 text-center text-xs text-gray-400">Ładowanie więcej…</p>
      )}
    </div>
  )
}
