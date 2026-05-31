import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BookList } from '../components/BookList'
import type { Book } from '../types/book'

vi.mock('../hooks/useBooks', () => ({
  useBooks: vi.fn(),
}))

vi.mock('../hooks/useRating', () => ({
  useUpsertRating: () => ({ mutate: vi.fn() }),
  useDeleteRating: () => ({ mutate: vi.fn() }),
}))

// Virtualizer has no real dimensions in jsdom — render items directly
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({ count }: { count: number }) => ({
    getVirtualItems: () =>
      Array.from({ length: count }, (_, i) => ({ key: i, index: i, start: i * 88 })),
    getTotalSize: () => count * 88,
  }),
}))

const mockBook = (id: number): Book => ({
  id,
  title: `Book ${id}`,
  author: `Author ${id}`,
  isbn: null,
  pages: 100,
  genre: null,
  avg_rating: null,
  ratings_count: 0,
  reviews_count: 0,
  user_rating: null,
  user_status: null,
  added_by: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
})

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

const noop = vi.fn()

async function setupMock(
  books: Book[],
  options = { hasNextPage: false, isLoading: false, isError: false },
) {
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
    renderWithQuery(<BookList search="" onOpenBook={noop} />)
    expect(screen.getByText(/Ładowanie/)).toBeInTheDocument()
  })

  it('renders empty state when no books', async () => {
    await setupMock([])
    renderWithQuery(<BookList search="" onOpenBook={noop} />)
    expect(screen.getByText(/Brak książek/)).toBeInTheDocument()
  })

  it('renders empty state with search message when search active', async () => {
    await setupMock([])
    renderWithQuery(<BookList search="xyz" onOpenBook={noop} />)
    expect(screen.getByText(/Brak wyników/)).toBeInTheDocument()
  })

  it('renders a BookCard for each book', async () => {
    const books = [mockBook(1), mockBook(2), mockBook(3)]
    await setupMock(books)
    renderWithQuery(<BookList search="" onOpenBook={noop} />)
    expect(screen.getByText('Book 1')).toBeInTheDocument()
    expect(screen.getByText('Book 2')).toBeInTheDocument()
    expect(screen.getByText('Book 3')).toBeInTheDocument()
  })

  it('shows error state', async () => {
    await setupMock([], { hasNextPage: false, isLoading: false, isError: true })
    renderWithQuery(<BookList search="" onOpenBook={noop} />)
    expect(screen.getByText(/Błąd ładowania/)).toBeInTheDocument()
  })
})
