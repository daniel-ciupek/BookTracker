import type { AddBookPayload, Book, BooksResponse } from '../types/book'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export class ValidationError extends Error {
  constructor(public readonly errors: Record<string, string[]>) {
    super('Validation failed')
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...init?.headers },
  })

  if (res.status === 422) {
    const body = await res.json()
    throw new ValidationError(body.errors ?? {})
  }

  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  return res.json() as Promise<T>
}

export function fetchBooks(params: {
  cursor?: number | null
  limit?: number
  search?: string
}): Promise<BooksResponse> {
  const q = new URLSearchParams()
  if (params.cursor) q.set('cursor', String(params.cursor))
  if (params.limit) q.set('limit', String(params.limit))
  if (params.search) q.set('search', params.search)
  const qs = q.toString() ? `?${q}` : ''
  return request<BooksResponse>(`/api/books${qs}`)
}

export function addBook(payload: AddBookPayload): Promise<Book> {
  return request<Book>('/api/books', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
