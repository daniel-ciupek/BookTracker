import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SettingsPage } from '../components/SettingsPage'

const mockUpdateProfile = vi.fn()
const mockChangePassword = vi.fn()

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Jan Kowalski', email: 'jan@example.com' },
    updateProfile: mockUpdateProfile,
    changePassword: mockChangePassword,
  }),
}))

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdateProfile.mockResolvedValue({})
    mockChangePassword.mockResolvedValue({})
  })

  it('renderuje formularz profilu z bieżącymi danymi', () => {
    render(<SettingsPage onClose={vi.fn()} />)
    expect(screen.getByDisplayValue('Jan Kowalski')).toBeInTheDocument()
    expect(screen.getByDisplayValue('jan@example.com')).toBeInTheDocument()
  })

  it('renderuje formularz zmiany hasła', () => {
    render(<SettingsPage onClose={vi.fn()} />)
    expect(screen.getAllByText('Zmień hasło')[0]).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/min\. 8 znaków/)).toBeInTheDocument()
  })

  it('wywołuje updateProfile po zapisaniu profilu', async () => {
    render(<SettingsPage onClose={vi.fn()} />)
    const nameInput = screen.getByDisplayValue('Jan Kowalski')
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Anna Nowak')
    await userEvent.click(screen.getByRole('button', { name: /Zapisz profil/ }))
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Anna Nowak' }),
      )
    })
  })

  it('wyświetla komunikat sukcesu po zapisaniu profilu', async () => {
    render(<SettingsPage onClose={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /Zapisz profil/ }))
    await waitFor(() => {
      expect(screen.getByText('Profil zaktualizowany.')).toBeInTheDocument()
    })
  })

  it('wywołuje changePassword po submicie formularza hasła', async () => {
    render(<SettingsPage onClose={vi.fn()} />)
    const inputs = screen.getAllByDisplayValue('')
    // current_password, new password, confirm
    await userEvent.type(inputs[0], 'starehaslo')
    await userEvent.type(screen.getByPlaceholderText(/min\. 8 znaków/), 'nowehaslo1')
    await userEvent.type(inputs[2], 'nowehaslo1')
    await userEvent.click(screen.getByRole('button', { name: /Zmień hasło/ }))
    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith('starehaslo', 'nowehaslo1')
    })
  })

  it('pokazuje błąd gdy hasła się nie zgadzają', async () => {
    render(<SettingsPage onClose={vi.fn()} />)
    const inputs = screen.getAllByDisplayValue('')
    await userEvent.type(inputs[0], 'starehaslo')
    await userEvent.type(screen.getByPlaceholderText(/min\. 8 znaków/), 'nowehaslo1')
    await userEvent.type(inputs[2], 'innehaslo2')
    await userEvent.click(screen.getByRole('button', { name: /Zmień hasło/ }))
    await waitFor(() => {
      expect(screen.getByText('Hasła nie są zgodne.')).toBeInTheDocument()
    })
    expect(mockChangePassword).not.toHaveBeenCalled()
  })

  it('zamyka modal po kliknięciu przycisku ✕', async () => {
    const onClose = vi.fn()
    render(<SettingsPage onClose={onClose} />)
    await userEvent.click(screen.getByLabelText('Zamknij'))
    expect(onClose).toHaveBeenCalled()
  })
})
