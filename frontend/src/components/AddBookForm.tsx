import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ValidationError, upsertRating } from '../api/books'
import { useAddBook } from '../hooks/useBooks'
import type { AddBookPayload } from '../types/book'
import { GENRES } from '../lib/constants'
import { isValidIsbn } from '../lib/isbn'
import { BookPlus, Plus, Star } from 'lucide-react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'

const schema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany').max(255),
  author: z.string().min(1, 'Autor jest wymagany').max(255),
  isbn: z
    .string()
    .optional()
    .refine((v) => !v || isValidIsbn(v), { message: 'Nieprawidłowy ISBN-10 lub ISBN-13' }),
  pages: z
    .preprocess(
      (val) => (val === '' ? undefined : val),
      z.coerce
        .number({ invalid_type_error: 'Wprowadź poprawną liczbę' })
        .int('Liczba musi być całkowita')
        .min(1, 'Minimum 1 strona')
        .max(99999, 'Maksimum 99999 stron')
        .optional()
    ),
  genre: z.string().optional(),
})

type FormInput = z.input<typeof schema>

export function AddBookForm() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  const mutation = useAddBook()
  const cardControls = useAnimation()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)

  async function onSubmit(data: FormInput) {
    try {
      const book = await mutation.mutateAsync(data as AddBookPayload)
      if (rating > 0) {
        await upsertRating(book.id, rating)
      }
      reset()
      setRating(0)
      await cardControls.start({
        borderColor: ['rgba(255,255,255,0.08)', 'rgba(232,121,249,0.6)', 'rgba(255,255,255,0.08)'],
        transition: { duration: 0.6 },
      })
    } catch (err) {
      if (err instanceof ValidationError) {
        Object.entries(err.errors).forEach(([field, messages]) => {
          setError(field as keyof FormInput, { message: messages[0] })
        })
      }
    }
  }

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
      e.preventDefault()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-black/[0.06] dark:border-white/[0.06]">
        <motion.div
          animate={cardControls}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(147,51,234,0.2), rgba(79,70,229,0.2))',
            border: '1px solid rgba(147,51,234,0.3)',
          }}
        >
          <Plus size={18} className="text-purple-600 dark:text-purple-400" strokeWidth={2.5} />
        </motion.div>
        <h2 className="text-base font-bold text-slate-800 dark:text-white">Dodaj książkę</h2>
      </div>

      <Field label="Tytuł *" error={errors.title?.message as string}>
        <input {...register('title')} className={inputClass(!!errors.title)} placeholder="np. Władca Pierścieni" />
      </Field>

      <Field label="Autor *" error={errors.author?.message as string}>
        <input {...register('author')} className={inputClass(!!errors.author)} placeholder="np. J.R.R. Tolkien" />
      </Field>

      <Field label="ISBN" error={errors.isbn?.message as string}>
        <input {...register('isbn')} className={inputClass(!!errors.isbn)} placeholder="np. 9780261103573" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Strony" error={errors.pages?.message as string}>
          <input
            {...register('pages')}
            type="number"
            inputMode="numeric"
            onKeyDown={handleNumericKeyDown}
            className={inputClass(!!errors.pages)}
            placeholder="np. 400"
          />
        </Field>
        <Field label="Gatunek" error={errors.genre?.message as string}>
          <select {...register('genre')} className={inputClass(!!errors.genre)}>
            <option value="">— wybierz —</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </Field>
      </div>

      <div>
        <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-slate-400 dark:text-white/35 uppercase">
          Ocena (1–5)
        </label>
        <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
          {Array.from({ length: 5 }, (_, i) => {
            const star = i + 1
            const isActive = star <= (hoverRating || rating)
            return (
              <motion.button
                key={star}
                type="button"
                aria-label={`Ocena ${star}`}
                onMouseEnter={() => setHoverRating(star)}
                onClick={() => setRating(rating === star ? 0 : star)}
                whileTap={{ scale: 1.3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="p-0.5 focus:outline-none"
              >
                <Star
                  size={22}
                  strokeWidth={1.5}
                  className={isActive ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-slate-300 dark:text-white/20'}
                  style={isActive ? { filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.6))' } : {}}
                />
              </motion.button>
            )
          })}
          {rating > 0 && (
            <button
              type="button"
              onClick={() => setRating(0)}
              className="ml-1 font-mono text-[11px] text-slate-400 dark:text-white/25 hover:text-red-400 dark:hover:text-red-400 transition-colors"
            >
              usuń
            </button>
          )}
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={isSubmitting ? {} : { y: -1 }}
        whileTap={isSubmitting ? {} : { scale: 0.98 }}
        className="glow-button w-full rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 mt-2"
      >
        {isSubmitting ? (
          <>
            <motion.div
              className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            Dodawanie…
          </>
        ) : (
          <>
            <BookPlus size={16} strokeWidth={2.5} />
            Dodaj książkę
          </>
        )}
      </motion.button>
    </form>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      animate={error ? { x: [-2, 2, -2, 2, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-slate-400 dark:text-white/35 uppercase">{label}</label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1.5 pl-1 text-xs font-medium text-red-400 overflow-hidden"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function inputClass(hasError: boolean) {
  return [
    'aurora-input',
    hasError ? 'border-red-500/70 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.25)]' : '',
  ].join(' ')
}
