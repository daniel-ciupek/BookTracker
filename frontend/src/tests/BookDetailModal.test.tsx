import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BookDetailModal } from '../components/BookDetailModal'
import type { Book } from '../types/book'

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 1, name: 'Jan', email: 'jan@example.com' } }),
}))

const mockUpsertReview = vi.fn()
const mockDeleteReview = vi.fn()
const mockUpsertRating = vi.fn()
const mockDeleteRating = vi.fn()
const mockUpsertStatus = vi.fn()
const mockDeleteStatus = vi.fn()

vi.mock('../hooks/useReviews', () => ({
  useReviews: () => ({
    data: {
      pages: [
        {
          data: [
            { id: 1, book_id: 1, user: { id: 2, name: 'Inna Osoba' }, body: 'Świetna książka!', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
          ],
          next_cursor: null,
        },
      ],
      pageParams: [null],
    },
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  }),
  useUpsertReview: () => ({ mutateAsync: mockUpsertReview, isPending: false }),
  useDeleteReview: () => ({ mutateAsync: mockDeleteReview }),
}))

vi.mock('../hooks/useRating', () => ({
  useUpsertRating: () => ({ mutate: mockUpsertRating }),
  useDeleteRating: () => ({ mutate: mockDeleteRating }),
}))

vi.mock('../hooks/useReadingStatus', () => ({
  useUpsertStatus: () => ({ mutate: mockUpsertStatus }),
  useDeleteStatus: () => ({ mutate: mockDeleteStatus }),
}))

const mockBook: Book = {
  id: 1,
  title: 'Dune',
  author: 'Frank Herbert',
  isbn: null,
  pages: 604,
  genre: 'Fantastyka',
  avg_rating: 4.5,
  ratings_count: 20,
  reviews_count: 1,
  user_rating: null,
  user_status: null,
  added_by: { id: 1, name: 'Demo User' },
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

describe('BookDetailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpsertReview.mockResolvedValue({})
  })

  it('wyświetla tytuł i autora książki', () => {
    render(<BookDetailModal book={mockBook} onClose={vi.fn()} />)
    expect(screen.getByText('Dune')).toBeInTheDocument()
    expect(screen.getByText('Frank Herbert')).toBeInTheDocument()
  })

  it('wyświetla recenzje innych użytkowników', () => {
    render(<BookDetailModal book={mockBook} onClose={vi.fn()} />)
    expect(screen.getByText('Świetna książka!')).toBeInTheDocument()
    expect(screen.getByText('Inna Osoba')).toBeInTheDocument()
  })

  it('wyświetla formularz dodania recenzji (brak własnej recenzji)', () => {
    render(<BookDetailModal book={mockBook} onClose={vi.fn()} />)
    expect(screen.getByPlaceholderText(/Napisz recenzję/)).toBeInTheDocument()
  })

  it('wysyła recenzję po wypełnieniu i kliknięciu Dodaj', async () => {
    render(<BookDetailModal book={mockBook} onClose={vi.fn()} />)
    await userEvent.type(screen.getByPlaceholderText(/Napisz recenzję/), 'Moja opinia o książce')
    await userEvent.click(screen.getByRole('button', { name: /Dodaj recenzję/ }))
    await waitFor(() => {
      expect(mockUpsertReview).toHaveBeenCalledWith('Moja opinia o książce')
    })
  })

  it('wyświetla przyciski statusu czytania', () => {
    render(<BookDetailModal book={mockBook} onClose={vi.fn()} />)
    expect(screen.getByText('Chcę przeczytać')).toBeInTheDocument()
    expect(screen.getByText('Czytam')).toBeInTheDocument()
    expect(screen.getByText('Przeczytane')).toBeInTheDocument()
  })

  it('wywołuje upsertStatus po kliknięciu statusu', async () => {
    render(<BookDetailModal book={mockBook} onClose={vi.fn()} />)
    await userEvent.click(screen.getByText('Czytam'))
    expect(mockUpsertStatus).toHaveBeenCalledWith('reading')
  })

  it('zamyka modal po kliknięciu przycisku ✕', async () => {
    const onClose = vi.fn()
    render(<BookDetailModal book={mockBook} onClose={onClose} />)
    await userEvent.click(screen.getByLabelText('Zamknij'))
    expect(onClose).toHaveBeenCalled()
  })

  it('zamyka modal po naciśnięciu Escape', async () => {
    const onClose = vi.fn()
    render(<BookDetailModal book={mockBook} onClose={onClose} />)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })
})
