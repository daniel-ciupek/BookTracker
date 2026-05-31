import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { StarRating } from '../components/StarRating'

describe('StarRating — tryb readonly', () => {
  it('wyświetla wartość avg i liczbę ocen', () => {
    render(<StarRating value={4.2} count={12} readonly />)
    expect(screen.getByText(/4\.2/)).toBeInTheDocument()
    expect(screen.getByText(/12/)).toBeInTheDocument()
  })

  it('wyświetla komunikat gdy brak ocen', () => {
    render(<StarRating value={null} readonly />)
    expect(screen.getByText(/Brak ocen/)).toBeInTheDocument()
  })

  it('nie wywołuje onRate po kliknięciu (brak interakcji)', () => {
    const onRate = vi.fn()
    render(<StarRating value={3} count={5} readonly onRate={onRate} />)
    // W trybie readonly nie ma przycisków gwiazdek
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(onRate).not.toHaveBeenCalled()
  })
})

describe('StarRating — tryb edytowalny', () => {
  it('renderuje 5 przycisków gwiazdek', () => {
    render(<StarRating value={null} onRate={vi.fn()} />)
    expect(screen.getAllByRole('button')).toHaveLength(5)
  })

  it('wywołuje onRate z wartością po kliknięciu', async () => {
    const onRate = vi.fn()
    render(<StarRating value={null} onRate={onRate} />)
    await userEvent.click(screen.getByLabelText('Ocena 3'))
    expect(onRate).toHaveBeenCalledWith(3)
  })

  it('wywołuje onRate(null) gdy klikniemy własną wartość (toggle)', async () => {
    const onRate = vi.fn()
    render(<StarRating value={4} onRate={onRate} />)
    await userEvent.click(screen.getByLabelText('Ocena 4'))
    expect(onRate).toHaveBeenCalledWith(null)
  })

  it('wywołuje onRate z nową wartością gdy klikniemy inną gwiazdkę', async () => {
    const onRate = vi.fn()
    render(<StarRating value={2} onRate={onRate} />)
    await userEvent.click(screen.getByLabelText('Ocena 5'))
    expect(onRate).toHaveBeenCalledWith(5)
  })
})
