export interface Book {
  id: number
  title: string
  author: string
  isbn: string | null
  pages: number | null
  rating: number
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
  rating: number
}
