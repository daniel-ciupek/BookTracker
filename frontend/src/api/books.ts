import type { AddBookPayload, Book, BooksResponse, ReadingStatus } from '../types/book'
import type { Review, ReviewsResponse } from '../types/review'
import { clearToken, getToken } from './auth'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export class ValidationError extends Error {
  readonly errors: Record<string, string[]>
  constructor(errors: Record<string, string[]>) {
    super('Validation failed')
    this.errors = errors
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  if (res.status === 401) {
    clearToken()
    window.location.reload()
    throw new Error('Unauthorized')
  }

  if (res.status === 422) {
    const body = await res.json()
    throw new ValidationError(body.errors ?? {})
  }

  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export function fetchBooks(params: {
  cursor?: number | null
  limit?: number
  search?: string
  genre?: string
  onlyMine?: boolean
}): Promise<BooksResponse> {
  const q = new URLSearchParams()
  if (params.cursor) q.set('cursor', String(params.cursor))
  if (params.limit) q.set('limit', String(params.limit))
  if (params.search) q.set('search', params.search)
  if (params.genre) q.set('genre', params.genre)
  if (params.onlyMine) q.set('only_mine', '1')
  const qs = q.toString() ? `?${q}` : ''
  return request<BooksResponse>(`/api/books${qs}`)
}

export function fetchBook(id: number): Promise<Book> {
  return request<Book>(`/api/books/${id}`)
}

export function addBook(payload: AddBookPayload): Promise<Book> {
  return request<Book>('/api/books', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function upsertRating(bookId: number, value: number): Promise<{ value: number }> {
  return request(`/api/books/${bookId}/rating`, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  })
}

export function deleteRating(bookId: number): Promise<void> {
  return request(`/api/books/${bookId}/rating`, { method: 'DELETE' })
}

export function fetchReviews(bookId: number, cursor?: number | null): Promise<ReviewsResponse> {
  const q = new URLSearchParams()
  if (cursor) q.set('cursor', String(cursor))
  const qs = q.toString() ? `?${q}` : ''
  return request<ReviewsResponse>(`/api/books/${bookId}/reviews${qs}`)
}

export function upsertReview(bookId: number, body: string): Promise<Review> {
  return request<Review>(`/api/books/${bookId}/reviews`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  })
}

export function deleteReview(bookId: number): Promise<void> {
  return request(`/api/books/${bookId}/reviews/mine`, { method: 'DELETE' })
}

export function upsertStatus(bookId: number, status: ReadingStatus): Promise<{ status: ReadingStatus }> {
  return request(`/api/books/${bookId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

export function deleteStatus(bookId: number): Promise<void> {
  return request(`/api/books/${bookId}/status`, { method: 'DELETE' })
}
