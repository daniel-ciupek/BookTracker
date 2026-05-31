import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

type ApiError = { message?: string; errors?: Record<string, string[]> }

interface Props {
  onClose: () => void
}

export function SettingsPage({ onClose }: Props) {
  const { user, updateProfile, changePassword } = useAuth()

  const [profileName, setProfileName] = useState(user?.name ?? '')
  const [profileEmail, setProfileEmail] = useState(user?.email ?? '')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({})
  const [profileLoading, setProfileLoading] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [passwordLoading, setPasswordLoading] = useState(false)

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    setProfileErrors({})
    setProfileSuccess('')
    setProfileLoading(true)
    try {
      await updateProfile({ name: profileName, email: profileEmail })
      setProfileSuccess('Profil zaktualizowany.')
    } catch (err: unknown) {
      const apiErr = err as ApiError
      if (apiErr?.errors) {
        const flat: Record<string, string> = {}
        Object.entries(apiErr.errors).forEach(([f, msgs]) => (flat[f] = msgs[0]))
        setProfileErrors(flat)
      } else {
        setProfileErrors({ _: apiErr?.message ?? 'Błąd aktualizacji.' })
      }
    } finally {
      setProfileLoading(false)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPasswordErrors({})
    setPasswordSuccess('')
    if (newPassword !== confirmPassword) {
      setPasswordErrors({ confirm: 'Hasła nie są zgodne.' })
      return
    }
    setPasswordLoading(true)
    try {
      await changePassword(currentPassword, newPassword)
      setPasswordSuccess('Hasło zmienione.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const apiErr = err as ApiError
      if (apiErr?.errors) {
        const flat: Record<string, string> = {}
        Object.entries(apiErr.errors).forEach(([f, msgs]) => (flat[f] = msgs[0]))
        setPasswordErrors(flat)
      } else {
        setPasswordErrors({ _: apiErr?.message ?? 'Błąd zmiany hasła.' })
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-gray-100 p-1.5 text-gray-500 hover:bg-gray-200"
          aria-label="Zamknij"
        >
          ✕
        </button>

        <h2 className="mb-6 text-xl font-bold text-gray-900">Ustawienia</h2>

        {/* Profile section */}
        <section className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Profil</h3>
          <form onSubmit={handleProfileSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Imię</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className={inp(!!profileErrors['name'])}
              />
              {profileErrors['name'] && (
                <p className="mt-1 text-xs text-red-600">{profileErrors['name']}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">E-mail</label>
              <input
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className={inp(!!profileErrors['email'])}
              />
              {profileErrors['email'] && (
                <p className="mt-1 text-xs text-red-600">{profileErrors['email']}</p>
              )}
            </div>
            {profileErrors['_'] && (
              <p className="text-sm text-red-600">{profileErrors['_']}</p>
            )}
            {profileSuccess && <p className="text-sm text-green-600">{profileSuccess}</p>}
            <button
              type="submit"
              disabled={profileLoading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {profileLoading ? 'Zapisywanie…' : 'Zapisz profil'}
            </button>
          </form>
        </section>

        <hr className="mb-6 border-gray-200" />

        {/* Password section */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Zmiana hasła</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Obecne hasło
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inp(!!passwordErrors['current_password'])}
              />
              {passwordErrors['current_password'] && (
                <p className="mt-1 text-xs text-red-600">{passwordErrors['current_password']}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Nowe hasło</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="min. 8 znaków"
                className={inp(!!passwordErrors['password'])}
              />
              {passwordErrors['password'] && (
                <p className="mt-1 text-xs text-red-600">{passwordErrors['password']}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Powtórz nowe hasło
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inp(!!passwordErrors['confirm'])}
              />
              {passwordErrors['confirm'] && (
                <p className="mt-1 text-xs text-red-600">{passwordErrors['confirm']}</p>
              )}
            </div>
            {passwordErrors['_'] && (
              <p className="text-sm text-red-600">{passwordErrors['_']}</p>
            )}
            {passwordSuccess && <p className="text-sm text-green-600">{passwordSuccess}</p>}
            <button
              type="submit"
              disabled={passwordLoading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {passwordLoading ? 'Zmienianie…' : 'Zmień hasło'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

function inp(hasError: boolean) {
  return [
    'w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1',
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
  ].join(' ')
}
