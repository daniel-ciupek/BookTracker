import { useState } from 'react'
import { AddBookForm } from './components/AddBookForm'
import { BookList } from './components/BookList'
import { LoginPage } from './components/LoginPage'
import { SearchBar } from './components/SearchBar'
import { useAuth } from './hooks/useAuth'

export default function App() {
  const { user, isLoading, logout } = useAuth()
  const [search, setSearch] = useState('')

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  if (!user) return <LoginPage />

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-700">📚 BookTracker</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user.email}</span>
            <button
              onClick={() => void logout()}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Wyloguj
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl gap-8 p-6 md:grid md:grid-cols-[380px_1fr]">
        <aside className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <AddBookForm />
        </aside>

        <section>
          <div className="mb-4">
            <SearchBar onSearch={setSearch} />
          </div>
          <BookList search={search} />
        </section>
      </main>
    </div>
  )
}
