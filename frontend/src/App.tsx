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
import { Sun, Moon, Settings, LogOut, Library, Layout } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export default function App() {
  const { user, isLoading, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [onlyMine, setOnlyMine] = useState(false)
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
    <div className="min-h-screen transition-colors duration-500 pb-12">
      <header className="glass-panel sticky top-0 z-40 mx-2 mt-2 sm:mx-4 sm:mt-4 rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-2.5 text-indigo-600 dark:text-indigo-400">
            <Library size={24} strokeWidth={2.5} className="drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] sm:w-[28px] sm:h-[28px]" />
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">BookTracker</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden text-sm font-medium text-slate-500 dark:text-slate-400 lg:inline">
              {user.name}
            </span>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="glass-icon-btn h-8 w-8 sm:h-9 sm:w-9"
              aria-label="Przełącz motyw"
            >
              {theme === 'dark' ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOnlyMine(!onlyMine)} 
              className={[
                "glass-button-secondary px-2 sm:px-4 h-8 sm:h-auto",
                onlyMine ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-600 dark:text-indigo-400" : ""
              ].join(" ")}
            >
              <Layout size={16} strokeWidth={2.5} />
              <span className="hidden md:inline ml-1.5">{onlyMine ? 'Wszystkie' : 'Moje publikacje'}</span>
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(true)} 
              className="glass-button-secondary px-2 sm:px-4 h-8 sm:h-auto"
              title="Ustawienia"
            >
              <Settings size={16} strokeWidth={2.5} />
              <span className="hidden md:inline ml-1.5">Ustawienia</span>
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => void logout()} 
              className="glass-button-secondary px-2 sm:px-4 h-8 sm:h-auto text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
              title="Wyloguj"
            >
              <LogOut size={16} strokeWidth={2.5} />
              <span className="hidden md:inline ml-1.5">Wyloguj</span>
            </motion.button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl gap-6 sm:gap-8 p-4 sm:p-6 md:grid md:grid-cols-[340px_1fr] lg:grid-cols-[380px_1fr]">
        <aside className="glass-panel h-fit rounded-2xl sm:rounded-3xl p-5 sm:p-6 mb-6 md:mb-0">
          <AddBookForm />
        </aside>

        <section className="min-w-0">
          <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <SearchBar onSearch={setSearch} />
            </div>
            <div className="relative">
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="glass-input sm:w-48 appearance-none pr-10"
              >
                <option value="">Wszystkie gatunki</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 dark:text-slate-500">
                <Layout size={14} strokeWidth={2.5} />
              </div>
            </div>
          </div>
          <BookList search={search} genre={genre || undefined} onlyMine={onlyMine} onOpenBook={setSelectedBook} />
        </section>
      </main>

      <AnimatePresence>
        {selectedBook && (
          <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </div>
  )
}
