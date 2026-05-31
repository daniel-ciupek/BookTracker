import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteReview, fetchReviews, upsertReview } from '../api/books'
import type { ReviewsResponse } from '../types/review'

export function useReviews(bookId: number) {
  return useInfiniteQuery<ReviewsResponse>({
    queryKey: ['reviews', bookId],
    queryFn: ({ pageParam }) => fetchReviews(bookId, pageParam as number | null),
    initialPageParam: null,
    getNextPageParam: (last) => last.next_cursor ?? undefined,
  })
}

export function useUpsertReview(bookId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: string) => upsertReview(bookId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', bookId] })
      queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })
}

export function useDeleteReview(bookId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteReview(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', bookId] })
      queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })
}
