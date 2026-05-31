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
import { Sun, Moon, Settings, LogOut, BookOpen, ChevronDown, LayoutGrid } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'


export default function App() {
  const { user, isLoading, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [onlyMine, setOnlyMine] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?'

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="relative">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-transparent border-t-aurora-pink border-l-aurora-indigo" />
          <div className="absolute inset-0 h-10 w-10 animate-ping rounded-full border border-aurora-pink opacity-20" />
        </div>
      </div>
    )
  }

  if (!user) return <LoginPage />

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pb-12"
    >
      <div className="aurora-grid" />
      <div className="aurora-orb-center" />

      <motion.header
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="glass-panel sticky top-0 z-40 mx-3 mt-3"
        style={{ borderRadius: '16px' }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(99,102,241,0.3))',
                border: '1px solid rgba(168,85,247,0.3)',
                boxShadow: '0 0 16px rgba(168,85,247,0.2)',
              }}
            >
              <BookOpen size={18} className="text-aurora-pink" strokeWidth={2.5} />
            </motion.div>
            <span className="text-lg font-extrabold tracking-tight gradient-text">BookTracker</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm font-medium text-slate-500 dark:text-white/40 lg:inline">{user.name}</span>

            <div
              className="hidden lg:flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #A855F7, #6366F1)',
                boxShadow: '0 0 12px rgba(168,85,247,0.4)',
              }}
            >
              {initials}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="glass-icon-btn h-8 w-8"
              aria-label="Przełącz motyw"
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.span key="sun" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.2 }}>
                    <Sun size={16} strokeWidth={2.5} />
                  </motion.span>
                ) : (
                  <motion.span key="moon" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.2 }}>
                    <Moon size={16} strokeWidth={2.5} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOnlyMine(!onlyMine)}
              className="glass-button-secondary px-2 sm:px-3 h-8"
              style={
                onlyMine
                  ? {
                      background: 'rgba(168,85,247,0.15)',
                      borderColor: 'rgba(168,85,247,0.4)',
                      color: '#E879F9',
                    }
                  : {}
              }
            >
              <LayoutGrid size={15} strokeWidth={2.5} />
              <span className="hidden md:inline text-xs">{onlyMine ? 'Wszystkie' : 'Moje'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(true)}
              className="glass-button-secondary px-2 sm:px-3 h-8"
            >
              <Settings size={15} strokeWidth={2.5} />
              <span className="hidden md:inline text-xs">Ustawienia</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => void logout()}
              className="glass-button-secondary px-2 sm:px-3 h-8"
              style={{ color: 'rgba(248,113,113,0.85)' }}
            >
              <LogOut size={15} strokeWidth={2.5} />
              <span className="hidden md:inline text-xs">Wyloguj</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.12 }}
        className="mx-auto max-w-7xl gap-6 p-4 sm:p-6 md:grid md:grid-cols-[360px_1fr] lg:grid-cols-[380px_1fr]"
      >
        <aside
          className="glass-card h-fit p-6 mb-6 md:mb-0 md:sticky md:top-[88px]"
        >
          <AddBookForm />
        </aside>

        <section className="min-w-0">
          <div className="mb-5 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <SearchBar onSearch={setSearch} />
            </div>
            <div className="relative">
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="aurora-input sm:w-48 appearance-none pr-9 cursor-pointer"
              >
                <option value="">Wszystkie gatunki</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 dark:text-white/40">
                <ChevronDown size={14} strokeWidth={2.5} />
              </div>
            </div>
          </div>
          <BookList search={search} genre={genre || undefined} onlyMine={onlyMine} onOpenBook={setSelectedBook} />
        </section>
      </motion.main>

      <AnimatePresence>
        {selectedBook && (
          <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}
