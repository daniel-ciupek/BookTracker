import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { X, User, Lock } from 'lucide-react'
import { motion } from 'framer-motion'

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 16 }}
        transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
        className="glass-card relative w-full max-w-md overflow-y-auto rounded-2xl p-8 max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.button
          type="button"
          onClick={onClose}
          whileHover={{ rotate: 90, scale: 1.1 }}
          transition={{ duration: 0.2 }}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.6)',
          }}
          aria-label="Zamknij"
        >
          <X size={16} strokeWidth={2.5} />
        </motion.button>

        <h2 className="mb-7 text-xl font-extrabold tracking-tight text-white">Ustawienia</h2>

        <section className="mb-7">
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{
                background: 'rgba(168,85,247,0.12)',
                border: '1px solid rgba(168,85,247,0.2)',
              }}
            >
              <User size={13} className="text-aurora-indigo" strokeWidth={2} />
            </div>
            <h3 className="text-sm font-bold text-white/80">Twój profil</h3>
          </div>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-white/35 uppercase">Imię</label>
              <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="aurora-input" />
              {profileErrors['name'] && <p className="mt-1.5 pl-1 text-xs font-medium text-red-400">{profileErrors['name']}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-white/35 uppercase">E-mail</label>
              <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className="aurora-input" />
              {profileErrors['email'] && <p className="mt-1.5 pl-1 text-xs font-medium text-red-400">{profileErrors['email']}</p>}
            </div>
            {profileErrors['_'] && <p className="text-sm font-medium text-red-400">{profileErrors['_']}</p>}
            {profileSuccess && <p className="text-sm font-medium text-emerald-400">{profileSuccess}</p>}
            <motion.button
              type="submit"
              disabled={profileLoading}
              whileHover={profileLoading ? {} : { y: -1 }}
              whileTap={profileLoading ? {} : { scale: 0.98 }}
              className="glow-button w-full rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2"
            >
              {profileLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : 'Zapisz profil'}
            </motion.button>
          </form>
        </section>

        <div className="mb-7 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.07), transparent)' }} />

        <section>
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{
                background: 'rgba(168,85,247,0.12)',
                border: '1px solid rgba(168,85,247,0.2)',
              }}
            >
              <Lock size={13} className="text-aurora-indigo" strokeWidth={2} />
            </div>
            <h3 className="text-sm font-bold text-white/80">Zmień hasło</h3>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-white/35 uppercase">Obecne hasło</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="aurora-input" />
              {passwordErrors['current_password'] && <p className="mt-1.5 pl-1 text-xs font-medium text-red-400">{passwordErrors['current_password']}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-white/35 uppercase">Nowe hasło</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="min. 8 znaków" className="aurora-input" />
              {passwordErrors['password'] && <p className="mt-1.5 pl-1 text-xs font-medium text-red-400">{passwordErrors['password']}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-white/35 uppercase">Powtórz nowe hasło</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="aurora-input" />
              {passwordErrors['confirm'] && <p className="mt-1.5 pl-1 text-xs font-medium text-red-400">{passwordErrors['confirm']}</p>}
            </div>
            {passwordErrors['_'] && <p className="text-sm font-medium text-red-400">{passwordErrors['_']}</p>}
            {passwordSuccess && <p className="text-sm font-medium text-emerald-400">{passwordSuccess}</p>}
            <motion.button
              type="submit"
              disabled={passwordLoading}
              whileHover={passwordLoading ? {} : { y: -1 }}
              whileTap={passwordLoading ? {} : { scale: 0.98 }}
              className="glow-button w-full rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2"
            >
              {passwordLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : 'Zmień hasło'}
            </motion.button>
          </form>
        </section>
      </motion.div>
    </motion.div>
  )
}
