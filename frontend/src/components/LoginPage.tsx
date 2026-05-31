import { useState } from 'react'
import * as authApi from '../api/auth'
import { useAuth } from '../hooks/useAuth'

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">📚 BookTracker</h1>

        {/* Forgot password view */}
        {view === 'forgot' && (
          <>
            <h2 className="mb-4 text-center text-lg font-semibold text-gray-800">
              Resetuj hasło
            </h2>
            <form onSubmit={handleForgot} className="space-y-4" noValidate>
              <Field label="E-mail" error={fieldErrors['email']}>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={inp(!!fieldErrors['email'])}
                  placeholder="jan@example.com"
                />
              </Field>
              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
              <button type="submit" disabled={isSubmitting} className={btn}>
                {isSubmitting ? '…' : 'Wyślij link resetujący'}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-500">
              <button
                type="button"
                onClick={() => { clearErrors(); setView('login') }}
                className="text-indigo-600 hover:underline"
              >
                Wróć do logowania
              </button>
            </p>
          </>
        )}

        {/* Reset password view */}
        {view === 'reset' && (
          <>
            <h2 className="mb-4 text-center text-lg font-semibold text-gray-800">
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
                  className={inp(!!fieldErrors['password'])}
                />
              </Field>
              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
              <button type="submit" disabled={isSubmitting} className={btn}>
                {isSubmitting ? '…' : 'Ustaw nowe hasło'}
              </button>
            </form>
          </>
        )}

        {/* Login / Register view */}
        {(view === 'login' || view === 'register') && (
          <>
            <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
              {(['login', 'register'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { clearErrors(); setView(t) }}
                  className={[
                    'flex-1 rounded-md py-1.5 text-sm font-medium transition-colors',
                    view === t
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700',
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
                    className={inp(!!fieldErrors['name'])}
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
                  className={inp(!!fieldErrors['email'])}
                  placeholder="jan@example.com"
                />
              </Field>
              <Field label="Hasło" error={fieldErrors['password']}>
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete={view === 'login' ? 'current-password' : 'new-password'}
                  className={inp(!!fieldErrors['password'])}
                  placeholder={view === 'register' ? 'min. 8 znaków' : ''}
                />
              </Field>
              {error && <p className="text-center text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={isSubmitting} className={btn}>
                {isSubmitting ? '…' : view === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
              </button>
            </form>

            {view === 'login' && (
              <p className="mt-4 text-center text-sm text-gray-500">
                <button
                  type="button"
                  onClick={() => { clearErrors(); setView('forgot') }}
                  className="text-indigo-600 hover:underline"
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
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
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

const btn =
  'w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50'
