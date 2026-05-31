import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BookCard } from '../components/BookCard'
import type { Book } from '../types/book'

vi.mock('../hooks/useRating', () => ({
  useUpsertRating: () => ({ mutate: vi.fn() }),
  useDeleteRating: () => ({ mutate: vi.fn() }),
}))

const mockBook = (overrides: Partial<Book> = {}): Book => ({
  id: 1,
  title: 'Clean Code',
  author: 'Robert Martin',
  isbn: null,
  pages: 464,
  genre: 'Nauka',
  avg_rating: 4.2,
  ratings_count: 10,
  reviews_count: 3,
  user_rating: null,
  user_status: null,
  added_by: { id: 1, name: 'Demo User' },
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
})

function renderCard(book: Book, onOpen = vi.fn()) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <BookCard book={book} onOpen={onOpen} />
    </QueryClientProvider>,
  )
}

describe('BookCard', () => {
  it('wyświetla tytuł i autora', () => {
    renderCard(mockBook())
    expect(screen.getByText('Clean Code')).toBeInTheDocument()
    expect(screen.getByText('Robert Martin')).toBeInTheDocument()
  })

  it('wyświetla badge gatunku', () => {
    renderCard(mockBook({ genre: 'Fantastyka' }))
    expect(screen.getByText('FANTASTYKA')).toBeInTheDocument()
  })

  it('nie wyświetla badge gatunku gdy brak', () => {
    renderCard(mockBook({ genre: null }))
    expect(screen.queryByText('FANTASTYKA')).not.toBeInTheDocument()
  })

  it('wyświetla placeholder gdy brak ISBN', () => {
    renderCard(mockBook({ isbn: null }))
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('wyświetla obrazek okładki gdy jest ISBN', () => {
    const { container } = renderCard(mockBook({ isbn: '9780306406157' }))
    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', expect.stringContaining('9780306406157'))
  })

  it('wywołuje onOpen po kliknięciu karty', async () => {
    const onOpen = vi.fn()
    const book = mockBook()
    renderCard(book, onOpen)
    await userEvent.click(screen.getByText('Clean Code'))
    expect(onOpen).toHaveBeenCalledWith(book)
  })

  it('wyświetla badge statusu czytania', () => {
    renderCard(mockBook({ user_status: 'reading' }))
    expect(screen.getByText(/CZYTAM/)).toBeInTheDocument()
  })
})
