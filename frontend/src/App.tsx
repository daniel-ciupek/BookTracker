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
import { Sun, Moon, Settings, LogOut, Library } from 'lucide-react'

export default function App() {
  const { user, isLoading, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
      </div>
    )
  }

  if (!user) return <LoginPage />

  return (
    <div className="min-h-screen transition-colors duration-500">
      <header className="glass-panel sticky top-0 z-40 mx-4 mt-4 rounded-2xl px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <Library size={28} strokeWidth={2.5} className="drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            <h1 className="text-xl font-extrabold tracking-tight">BookTracker</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-slate-500 dark:text-slate-400 sm:inline">
              {user.name}
            </span>
            
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="glass-icon-btn"
              aria-label="Przełącz motyw"
            >
              {theme === 'dark' ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
            </button>

            <button onClick={() => setShowSettings(true)} className="glass-button-secondary">
              <Settings size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Ustawienia</span>
            </button>
            <button onClick={() => void logout()} className="glass-button-secondary text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300">
              <LogOut size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Wyloguj</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl gap-8 p-6 md:grid md:grid-cols-[380px_1fr]">
        <aside className="glass-panel h-fit rounded-3xl p-6">
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
              className="glass-input w-48 appearance-none"
            >
              <option value="">Wszystkie gatunki</option>
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
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
