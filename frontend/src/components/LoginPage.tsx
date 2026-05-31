import { useState } from 'react'
import * as authApi from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import { BookOpen, BookMarked, Star, Users, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type View = 'login' | 'register' | 'forgot' | 'reset'
type ApiError = { message?: string; errors?: Record<string, string[]> }

function getResetParams() {
  const params = new URLSearchParams(window.location.search)
  return { token: params.get('token') ?? '', email: params.get('email') ?? '' }
}

const features = [
  { icon: BookMarked, text: 'Śledź swoją bibliotekę i historię czytania' },
  { icon: Star, text: 'Oceniaj książki i pisz recenzje' },
  { icon: Users, text: 'Odkrywaj co czytają inni' },
]

export function LoginPage() {
  const { login, register } = useAuth()
  const [resetToken] = useState(() => getResetParams().token)
  const [resetEmail] = useState(() => getResetParams().email)
  const [view, setView] = useState<View>(() => (resetToken && resetEmail ? 'reset' : 'login'))
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function clearErrors() {
    setError('')
    setSuccess('')
    setFieldErrors({})
  }

  function handleApiError(err: unknown) {
    const apiErr = err as ApiError
    if (apiErr?.errors) {
      const flat: Record<string, string> = {}
      Object.entries(apiErr.errors).forEach(([f, msgs]) => (flat[f] = msgs[0]))
      setFieldErrors(flat)
    } else {
      setError(apiErr?.message ?? 'Coś poszło nie tak. Spróbuj ponownie.')
    }
  }

  async function handleLoginRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    clearErrors()
    setIsSubmitting(true)
    const fd = new FormData(e.currentTarget)
    try {
      if (view === 'login') {
        await login(fd.get('email') as string, fd.get('password') as string)
      } else {
        await register(fd.get('name') as string, fd.get('email') as string, fd.get('password') as string)
      }
    } catch (err) {
      handleApiError(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleForgot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    clearErrors()
    setIsSubmitting(true)
    const fd = new FormData(e.currentTarget)
    try {
      await authApi.forgotPassword(fd.get('email') as string)
      setSuccess('Jeśli konto istnieje, link resetujący został wysłany na podany adres e-mail.')
    } catch (err) {
      handleApiError(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    clearErrors()
    setIsSubmitting(true)
    const fd = new FormData(e.currentTarget)
    try {
      await authApi.resetPassword(resetToken, resetEmail, fd.get('password') as string)
      setSuccess('Hasło zostało zmienione. Możesz się teraz zalogować.')
      window.history.replaceState({}, '', window.location.pathname)
      setTimeout(() => setView('login'), 1500)
    } catch (err) {
      handleApiError(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen overflow-hidden">
      <div className="aurora-grid" />
      <div className="aurora-orb-center" />

      {/* ── Hero (left) ── */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 py-12"
      >
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl
              bg-purple-100 dark:bg-purple-950/40
              border border-purple-200 dark:border-purple-800/40">
              <BookOpen size={24} className="text-purple-600 dark:text-purple-400" strokeWidth={2} />
            </div>
            <span className="text-2xl font-extrabold gradient-text">BookTracker</span>
          </div>

          <h1 className="text-5xl font-extrabold leading-tight mb-6 text-slate-800 dark:text-white">
            Twoja osobista<br />
            <span className="gradient-text">biblioteka</span><br />
            w chmurze.
          </h1>

          <p className="text-lg text-slate-500 dark:text-white/50 mb-10 leading-relaxed">
            Śledź co czytasz, odkrywaj co warto przeczytać i dziel się opiniami z innymi.
          </p>

          <div className="space-y-4">
            {features.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl
                  bg-purple-100 dark:bg-purple-950/40
                  border border-purple-200 dark:border-purple-800/40">
                  <Icon size={16} className="text-purple-600 dark:text-indigo-400" strokeWidth={2} />
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-white/70">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Form (right) ── */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12"
      >
        <div className="w-full max-w-sm glass-card p-8 rounded-2xl">

          {/* mobile logo */}
          <div className="flex items-center gap-2.5 justify-center mb-8 lg:hidden">
            <BookOpen size={26} className="text-purple-600 dark:text-purple-400" strokeWidth={2} />
            <span className="text-2xl font-extrabold gradient-text">BookTracker</span>
          </div>

          {/* ─ forgot password ─ */}
          {view === 'forgot' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="mb-6 text-xl font-bold text-slate-800 dark:text-white">Resetuj hasło</h2>
              <form onSubmit={handleForgot} className="space-y-4" noValidate>
                <Field label="E-mail" error={fieldErrors['email']}>
                  <input name="email" type="email" required autoComplete="email" className="aurora-input" placeholder="jan@example.com" />
                </Field>
                <StatusMessages error={error} success={success} />
                <button type="submit" disabled={isSubmitting} className="glow-button w-full rounded-xl py-2.5 text-sm font-bold">
                  {isSubmitting ? 'Wysyłanie…' : 'Wyślij link resetujący'}
                </button>
              </form>
              <p className="mt-6 text-center text-sm">
                <button
                  type="button"
                  onClick={() => { clearErrors(); setView('login') }}
                  className="font-bold text-purple-600 dark:text-indigo-400 hover:text-purple-800 dark:hover:text-indigo-300 transition-colors"
                >
                  Wróć do logowania
                </button>
              </p>
            </motion.div>
          )}

          {/* ─ reset password ─ */}
          {view === 'reset' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="mb-6 text-xl font-bold text-slate-800 dark:text-white">Nowe hasło</h2>
              <form onSubmit={handleReset} className="space-y-4" noValidate>
                <Field label="Nowe hasło" error={fieldErrors['password']}>
                  <input name="password" type="password" required autoComplete="new-password" placeholder="min. 8 znaków" className="aurora-input" />
                </Field>
                <StatusMessages error={error} success={success} />
                <button type="submit" disabled={isSubmitting} className="glow-button w-full rounded-xl py-2.5 text-sm font-bold">
                  {isSubmitting ? 'Zapisywanie…' : 'Ustaw nowe hasło'}
                </button>
              </form>
            </motion.div>
          )}

          {/* ─ login / register ─ */}
          {(view === 'login' || view === 'register') && (
            <>
              {/* tab switcher */}
              <div className="relative mb-7 flex rounded-xl p-1 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07]">
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute top-1 bottom-1 rounded-lg bg-white dark:bg-purple-950/60 border border-slate-200 dark:border-purple-800/40 shadow-sm"
                  style={{
                    left: view === 'login' ? '4px' : 'calc(50% + 2px)',
                    right: view === 'login' ? 'calc(50% + 2px)' : '4px',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
                {(['login', 'register'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { clearErrors(); setView(t) }}
                    className={[
                      'relative z-10 flex-1 rounded-lg py-2 text-sm font-bold transition-colors',
                      view === t
                        ? 'text-slate-800 dark:text-white'
                        : 'text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/60',
                    ].join(' ')}
                  >
                    {t === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.form
                  key={view}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  onSubmit={handleLoginRegister}
                  className="space-y-4"
                  noValidate
                >
                  {view === 'register' && (
                    <Field label="Imię" error={fieldErrors['name']}>
                      <input name="name" type="text" required autoComplete="name" className="aurora-input" placeholder="Jan Kowalski" />
                    </Field>
                  )}
                  <Field label="E-mail" error={fieldErrors['email']}>
                    <input name="email" type="email" required autoComplete="email" className="aurora-input" placeholder="jan@example.com" />
                  </Field>
                  <Field label="Hasło" error={fieldErrors['password']}>
                    <input
                      name="password"
                      type="password"
                      required
                      autoComplete={view === 'login' ? 'current-password' : 'new-password'}
                      className="aurora-input"
                      placeholder={view === 'register' ? 'min. 8 znaków' : '••••••••'}
                    />
                  </Field>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-center text-sm font-medium text-red-500 dark:text-red-400"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="glow-button w-full rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        {view === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
                        <ChevronRight size={16} strokeWidth={2.5} />
                      </>
                    )}
                  </button>
                </motion.form>
              </AnimatePresence>

              {view === 'login' && (
                <p className="mt-5 text-center">
                  <button
                    type="button"
                    onClick={() => { clearErrors(); setView('forgot') }}
                    className="text-xs font-semibold text-slate-400 dark:text-white/35 hover:text-purple-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Nie pamiętasz hasła?
                  </button>
                </p>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold tracking-widest uppercase text-slate-400 dark:text-white/40">
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1.5 pl-1 text-xs font-medium text-red-500 dark:text-red-400 overflow-hidden"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatusMessages({ error, success }: { error: string; success: string }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="text-sm font-medium text-red-500 dark:text-red-400"
        >
          {error}
        </motion.p>
      )}
      {success && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="text-sm font-medium text-emerald-600 dark:text-emerald-400"
        >
          {success}
        </motion.p>
      )}
    </AnimatePresence>
  )
}
