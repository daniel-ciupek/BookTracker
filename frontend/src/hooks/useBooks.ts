import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { addBook, fetchBooks } from '../api/books'
import type { AddBookPayload, BooksResponse } from '../types/book'

const BOOKS_KEY = 'books'

export function useBooks(search: string, genre?: string, onlyMine?: boolean) {
  return useInfiniteQuery<BooksResponse>({
    queryKey: [BOOKS_KEY, search, genre, onlyMine],
    queryFn: ({ pageParam }) =>
      fetchBooks({ cursor: pageParam as number | null, limit: 50, search, genre, onlyMine }),
    initialPageParam: null,
    getNextPageParam: (last) => last.next_cursor ?? undefined,
  })
}

export function useAddBook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AddBookPayload) => addBook(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKS_KEY] })
    },
  })
}
