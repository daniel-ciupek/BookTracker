import { useState } from 'react'
import { AddBookForm } from './components/AddBookForm'
import { BookDetailModal } from './components/BookDetailModal'
import { BookList } from './components/BookList'
import { LoginPage } from './components/LoginPage'
import { SearchBar } from './components/SearchBar'
import { SettingsPage } from './components/SettingsPage'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './components/ThemeProvider'
import { GENRES } from './lib/constants'
import type { Book } from './types/book'
import { IconSun, IconMoon, IconSettings, IconLogout, IconBooks } from '@tabler/icons-react'

export default function App() {
  const { user, isLoading, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  if (!user) return <LoginPage />

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-850 transition-colors duration-300">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <IconBooks size={28} stroke={2} />
            <h1 className="text-xl font-extrabold tracking-tight">BookTracker</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-slate-500 dark:text-slate-400 sm:inline">
              {user.email}
            </span>
            
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              aria-label="Przełącz motyw"
            >
              {theme === 'dark' ? <IconSun size={20} stroke={2} /> : <IconMoon size={20} stroke={2} />}
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <IconSettings size={18} stroke={2} />
              <span className="hidden sm:inline">Ustawienia</span>
            </button>
            <button
              onClick={() => void logout()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <IconLogout size={18} stroke={2} />
              <span className="hidden sm:inline">Wyloguj</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl gap-8 p-6 md:grid md:grid-cols-[380px_1fr]">
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-850 transition-colors duration-300">
          <AddBookForm />
        </aside>

        <section>
          <div className="mb-6 flex gap-4">
            <div className="flex-1">
              <SearchBar onSearch={setSearch} />
            </div>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-48 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-200"
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
