import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteStatus, upsertStatus } from '../api/books'
import type { ReadingStatus } from '../types/book'

export function useUpsertStatus(bookId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (status: ReadingStatus) => upsertStatus(bookId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })
}

export function useDeleteStatus(bookId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteStatus(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })
}
