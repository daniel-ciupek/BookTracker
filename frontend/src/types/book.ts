export type ReadingStatus = 'want_to_read' | 'reading' | 'read'

export interface Book {
  id: number
  title: string
  author: string
  isbn: string | null
  pages: number | null
  genre: string | null
  avg_rating: number | null
  ratings_count: number
  reviews_count: number
  user_rating: number | null
  user_status: ReadingStatus | null
  added_by: { id: number; name: string } | null
  created_at: string
  updated_at: string
}

export interface BooksResponse {
  data: Book[]
  next_cursor: number | null
}

export interface AddBookPayload {
  title: string
  author: string
  isbn?: string
  pages?: number
  genre?: string
}
