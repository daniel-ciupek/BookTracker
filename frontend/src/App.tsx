import { useState } from 'react'
import { AddBookForm } from './components/AddBookForm'
import { BookList } from './components/BookList'
import { SearchBar } from './components/SearchBar'

export default function App() {
  const [search, setSearch] = useState('')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-indigo-700">📚 BookTracker</h1>
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
