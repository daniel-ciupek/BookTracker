import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AddBookForm } from '../components/AddBookForm'

const mockMutateAsync = vi.fn()

vi.mock('../api/books', () => ({
  addBook: vi.fn(),
  ValidationError: class ValidationError extends Error {
    constructor(public errors: Record<string, string[]>) {
      super('Validation failed')
    }
  },
}))

vi.mock('../hooks/useBooks', () => ({
  useAddBook: () => ({ mutateAsync: mockMutateAsync }),
}))

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('AddBookForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMutateAsync.mockResolvedValue({})
  })

  it('renders all required fields', () => {
    renderWithQuery(<AddBookForm />)
    expect(screen.getByPlaceholderText(/Władca/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Tolkien/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Dodaj książkę/ })).toBeInTheDocument()
  })

  it('shows validation errors when submitting empty form', async () => {
    renderWithQuery(<AddBookForm />)
    await userEvent.click(screen.getByRole('button', { name: /Dodaj/ }))
    await waitFor(() => {
      expect(screen.getByText('Tytuł jest wymagany')).toBeInTheDocument()
      expect(screen.getByText('Autor jest wymagany')).toBeInTheDocument()
    })
  })

  it('shows ISBN validation error for invalid ISBN', async () => {
    renderWithQuery(<AddBookForm />)
    await userEvent.type(screen.getByPlaceholderText(/Władca/), 'Dune')
    await userEvent.type(screen.getByPlaceholderText(/Tolkien/), 'Frank Herbert')
    await userEvent.type(screen.getByPlaceholderText(/9780261103573/), '1234567890')
    await userEvent.click(screen.getByRole('button', { name: /Dodaj/ }))
    await waitFor(() => {
      expect(screen.getByText(/Nieprawidłowy ISBN/)).toBeInTheDocument()
    })
  })

  it('submits form with valid data and calls mutateAsync', async () => {
    renderWithQuery(<AddBookForm />)
    await userEvent.type(screen.getByPlaceholderText(/Władca/), 'Clean Code')
    await userEvent.type(screen.getByPlaceholderText(/Tolkien/), 'Robert Martin')
    await userEvent.selectOptions(screen.getAllByRole('combobox')[0], 'Nauka')
    await userEvent.click(screen.getByRole('button', { name: /Dodaj/ }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Clean Code', author: 'Robert Martin', genre: 'Nauka' })
      )
    })
  })
})
