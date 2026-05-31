import { useState } from 'react'
import * as authApi from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import { Library } from 'lucide-react'

type View = 'login' | 'register' | 'forgot' | 'reset'
type ApiError = { message?: string; errors?: Record<string, string[]> }

function getResetParams() {
  const params = new URLSearchParams(window.location.search)
  return { token: params.get('token') ?? '', email: params.get('email') ?? '' }
}

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
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="glass-panel w-full max-w-sm rounded-[2rem] p-8">
        <div className="mb-8 flex items-center justify-center gap-2.5 text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">
          <Library size={36} strokeWidth={2.5} />
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">BookTracker</h1>
        </div>

        {/* Forgot password view */}
        {view === 'forgot' && (
          <>
            <h2 className="mb-5 text-center text-lg font-bold text-slate-800 dark:text-slate-200">
              Resetuj hasło
            </h2>
            <form onSubmit={handleForgot} className="space-y-4" noValidate>
              <Field label="E-mail" error={fieldErrors['email']}>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="glass-input"
                  placeholder="jan@example.com"
                />
              </Field>
              {error && <p className="text-sm font-medium text-red-500">{error}</p>}
              {success && <p className="text-sm font-medium text-emerald-500">{success}</p>}
              <button type="submit" disabled={isSubmitting} className="glass-button w-full mt-2">
                {isSubmitting ? 'Wysyłanie…' : 'Wyślij link resetujący'}
              </button>
            </form>
            <p className="mt-6 text-center text-sm">
              <button
                type="button"
                onClick={() => { clearErrors(); setView('login') }}
                className="font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Wróć do logowania
              </button>
            </p>
          </>
        )}

        {/* Reset password view */}
        {view === 'reset' && (
          <>
            <h2 className="mb-5 text-center text-lg font-bold text-slate-800 dark:text-slate-200">
              Nowe hasło
            </h2>
            <form onSubmit={handleReset} className="space-y-4" noValidate>
              <Field label="Nowe hasło" error={fieldErrors['password']}>
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="min. 8 znaków"
                  className="glass-input"
                />
              </Field>
              {error && <p className="text-sm font-medium text-red-500">{error}</p>}
              {success && <p className="text-sm font-medium text-emerald-500">{success}</p>}
              <button type="submit" disabled={isSubmitting} className="glass-button w-full mt-2">
                {isSubmitting ? 'Zapisywanie…' : 'Ustaw nowe hasło'}
              </button>
            </form>
          </>
        )}

        {/* Login / Register view */}
        {(view === 'login' || view === 'register') && (
          <>
            <div className="mb-8 flex rounded-xl bg-slate-200/50 p-1 dark:bg-slate-950/50 backdrop-blur-sm">
              {(['login', 'register'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { clearErrors(); setView(t) }}
                  className={[
                    'flex-1 rounded-lg py-2 text-sm font-bold transition-all',
                    view === t
                      ? 'bg-white shadow-sm text-slate-900 dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[0_0_10px_rgba(0,0,0,0.5)]'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
                  ].join(' ')}
                >
                  {t === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
                </button>
              ))}
            </div>

            <form onSubmit={handleLoginRegister} className="space-y-4" noValidate>
              {view === 'register' && (
                <Field label="Imię" error={fieldErrors['name']}>
                  <input
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    className="glass-input"
                    placeholder="Jan Kowalski"
                  />
                </Field>
              )}
              <Field label="E-mail" error={fieldErrors['email']}>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="glass-input"
                  placeholder="jan@example.com"
                />
              </Field>
              <Field label="Hasło" error={fieldErrors['password']}>
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete={view === 'login' ? 'current-password' : 'new-password'}
                  className="glass-input"
                  placeholder={view === 'register' ? 'min. 8 znaków' : ''}
                />
              </Field>
              {error && <p className="text-center text-sm font-medium text-red-500">{error}</p>}
              <button type="submit" disabled={isSubmitting} className="glass-button w-full mt-4">
                {isSubmitting ? 'Ładowanie…' : view === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
              </button>
            </form>

            {view === 'login' && (
              <p className="mt-6 text-center text-sm">
                <button
                  type="button"
                  onClick={() => { clearErrors(); setView('forgot') }}
                  className="font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 drop-shadow-sm"
                >
                  Nie pamiętasz hasła?
                </button>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-bold tracking-wide text-slate-600 uppercase dark:text-slate-400 drop-shadow-sm">{label}</label>
      {children}
      {error && <p className="mt-1.5 pl-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  )
}
