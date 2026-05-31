import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

type Tab = 'login' | 'register'
type ApiError = { message?: string; errors?: Record<string, string[]> }

export function LoginPage() {
  const { login, register } = useAuth()
  const [tab, setTab] = useState<Tab>('login')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setIsSubmitting(true)

    const fd = new FormData(e.currentTarget)
    const email = fd.get('email') as string
    const password = fd.get('password') as string

    try {
      if (tab === 'login') {
        await login(email, password)
      } else {
        const name = fd.get('name') as string
        await register(name, email, password)
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError
      if (apiErr?.errors) {
        const flat: Record<string, string> = {}
        Object.entries(apiErr.errors).forEach(([field, msgs]) => {
          flat[field] = msgs[0]
        })
        setFieldErrors(flat)
      } else {
        setError(apiErr?.message ?? 'Coś poszło nie tak. Spróbuj ponownie.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">📚 BookTracker</h1>

        <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
          {(['login', 'register'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t)
                setError('')
                setFieldErrors({})
              }}
              className={[
                'flex-1 rounded-md py-1.5 text-sm font-medium transition-colors',
                tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              {t === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {tab === 'register' && (
            <Field label="Imię" error={fieldErrors['name']}>
              <input
                name="name"
                type="text"
                required
                autoComplete="name"
                className={input(!!fieldErrors['name'])}
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
              className={input(!!fieldErrors['email'])}
              placeholder="jan@example.com"
            />
          </Field>

          <Field label="Hasło" error={fieldErrors['password']}>
            <input
              name="password"
              type="password"
              required
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              className={input(!!fieldErrors['password'])}
              placeholder={tab === 'register' ? 'min. 8 znaków' : ''}
            />
          </Field>

          {error && <p className="text-center text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting
              ? '...'
              : tab === 'login'
                ? 'Zaloguj się'
                : 'Utwórz konto'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function input(hasError: boolean) {
  return [
    'w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1',
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
  ].join(' ')
}
