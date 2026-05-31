import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BookList } from '../components/BookList'
import type { Book } from '../types/book'

vi.mock('../hooks/useBooks', () => ({
  useBooks: vi.fn(),
}))

// Virtualizer has no real dimensions in jsdom — render items directly
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({ count }: { count: number }) => ({
    getVirtualItems: () =>
      Array.from({ length: count }, (_, i) => ({ key: i, index: i, start: i * 76 })),
    getTotalSize: () => count * 76,
  }),
}))

const mockBook = (id: number): Book => ({
  id,
  title: `Book ${id}`,
  author: `Author ${id}`,
  isbn: null,
  pages: 100,
  rating: 4,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
})

async function setupMock(books: Book[], options = { hasNextPage: false, isLoading: false, isError: false }) {
  const { useBooks } = await import('../hooks/useBooks')
  vi.mocked(useBooks).mockReturnValue({
    data: { pages: [{ data: books, next_cursor: null }], pageParams: [null] },
    fetchNextPage: vi.fn(),
    hasNextPage: options.hasNextPage,
    isFetchingNextPage: false,
    isLoading: options.isLoading,
    isError: options.isError,
  } as ReturnType<typeof useBooks>)
}

describe('BookList', () => {
  it('renders loading state', async () => {
    await setupMock([], { hasNextPage: false, isLoading: true, isError: false })
    render(<BookList search="" />)
    expect(screen.getByText(/Ładowanie/)).toBeInTheDocument()
  })

  it('renders empty state when no books', async () => {
    await setupMock([])
    render(<BookList search="" />)
    expect(screen.getByText(/Brak książek/)).toBeInTheDocument()
  })

  it('renders empty state with search message when search active', async () => {
    await setupMock([])
    render(<BookList search="xyz" />)
    expect(screen.getByText(/Brak wyników/)).toBeInTheDocument()
  })

  it('renders a BookCard for each book', async () => {
    const books = [mockBook(1), mockBook(2), mockBook(3)]
    await setupMock(books)
    render(<BookList search="" />)
    expect(screen.getByText('Book 1')).toBeInTheDocument()
    expect(screen.getByText('Book 2')).toBeInTheDocument()
    expect(screen.getByText('Book 3')).toBeInTheDocument()
  })

  it('shows error state', async () => {
    await setupMock([], { hasNextPage: false, isLoading: false, isError: true })
    render(<BookList search="" />)
    expect(screen.getByText(/Błąd ładowania/)).toBeInTheDocument()
  })
})
