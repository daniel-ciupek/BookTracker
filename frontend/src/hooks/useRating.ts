import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteRating, upsertRating } from '../api/books'

export function useUpsertRating(bookId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (value: number) => upsertRating(bookId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })
}

export function useDeleteRating(bookId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteRating(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })
}
