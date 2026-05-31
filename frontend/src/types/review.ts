export interface Review {
  id: number
  book_id: number
  user: { id: number; name: string }
  body: string
  created_at: string
  updated_at: string
}

export interface ReviewsResponse {
  data: Review[]
  next_cursor: number | null
}
