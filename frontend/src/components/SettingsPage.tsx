import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { X } from 'lucide-react'

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-md transition-all"
      onClick={onClose}
    >
      <div
        className="glass-panel relative w-full max-w-md overflow-y-auto rounded-3xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="glass-icon-btn absolute right-5 top-5"
          aria-label="Zamknij"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        <h2 className="mb-8 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 drop-shadow-sm">Ustawienia</h2>

        {/* Profile section */}
        <section className="mb-8">
          <h3 className="mb-4 text-base font-bold text-slate-800 dark:text-slate-200">Twój profil</h3>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-bold tracking-wide text-slate-600 uppercase dark:text-slate-400 drop-shadow-sm">Imię</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="glass-input"
              />
              {profileErrors['name'] && (
                <p className="mt-1.5 pl-1 text-xs font-medium text-red-500">{profileErrors['name']}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-bold tracking-wide text-slate-600 uppercase dark:text-slate-400 drop-shadow-sm">E-mail</label>
              <input
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="glass-input"
              />
              {profileErrors['email'] && (
                <p className="mt-1.5 pl-1 text-xs font-medium text-red-500">{profileErrors['email']}</p>
              )}
            </div>
            {profileErrors['_'] && (
              <p className="text-sm font-medium text-red-500">{profileErrors['_']}</p>
            )}
            {profileSuccess && <p className="text-sm font-medium text-emerald-500">{profileSuccess}</p>}
            <button
              type="submit"
              disabled={profileLoading}
              className="glass-button w-full mt-2"
            >
              {profileLoading ? 'Zapisywanie…' : 'Zapisz profil'}
            </button>
          </form>
        </section>

        <hr className="mb-8 border-slate-200/50 dark:border-slate-700/50" />

        {/* Password section */}
        <section>
          <h3 className="mb-4 text-base font-bold text-slate-800 dark:text-slate-200">Zmień hasło</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-bold tracking-wide text-slate-600 uppercase dark:text-slate-400 drop-shadow-sm">
                Obecne hasło
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="glass-input"
              />
              {passwordErrors['current_password'] && (
                <p className="mt-1.5 pl-1 text-xs font-medium text-red-500">{passwordErrors['current_password']}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-bold tracking-wide text-slate-600 uppercase dark:text-slate-400 drop-shadow-sm">Nowe hasło</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="min. 8 znaków"
                className="glass-input"
              />
              {passwordErrors['password'] && (
                <p className="mt-1.5 pl-1 text-xs font-medium text-red-500">{passwordErrors['password']}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-bold tracking-wide text-slate-600 uppercase dark:text-slate-400 drop-shadow-sm">
                Powtórz nowe hasło
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="glass-input"
              />
              {passwordErrors['confirm'] && (
                <p className="mt-1.5 pl-1 text-xs font-medium text-red-500">{passwordErrors['confirm']}</p>
              )}
            </div>
            {passwordErrors['_'] && (
              <p className="text-sm font-medium text-red-500">{passwordErrors['_']}</p>
            )}
            {passwordSuccess && <p className="text-sm font-medium text-emerald-500">{passwordSuccess}</p>}
            <button
              type="submit"
              disabled={passwordLoading}
              className="glass-button w-full mt-2"
            >
              {passwordLoading ? 'Zmienianie…' : 'Zmień hasło'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
