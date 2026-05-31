import { useState } from 'react'
import { AddBookForm } from './components/AddBookForm'
import { BookDetailModal } from './components/BookDetailModal'
import { BookList } from './components/BookList'
import { LoginPage } from './components/LoginPage'
import { SearchBar } from './components/SearchBar'
import { SettingsPage } from './components/SettingsPage'
import { useAuth } from './hooks/useAuth'
import { GENRES } from './lib/constants'
import type { Book } from './types/book'

export default function App() {
  const { user, isLoading, logout } = useAuth()
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [showSettings, setShowSettings] = useState(false)

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
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{user.email}</span>
            <button
              onClick={() => setShowSettings(true)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Ustawienia
            </button>
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
          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <SearchBar onSearch={setSearch} />
            </div>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-48 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Wszystkie gatunki</option>
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <BookList search={search} genre={genre || undefined} onOpenBook={setSelectedBook} />
        </section>
      </main>

      {selectedBook && (
        <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}

      {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
    </div>
  )
}
