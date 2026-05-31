import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ValidationError } from '../api/books'
import { useAddBook } from '../hooks/useBooks'
import { GENRES } from '../lib/constants'
import { isValidIsbn } from '../lib/isbn'
import { Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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

  async function onSubmit(data: FormInput) {
    try {
      await mutation.mutateAsync(data)
      reset()
    } catch (err) {
      if (err instanceof ValidationError) {
        Object.entries(err.errors).forEach(([field, messages]) => {
          setError(field as keyof FormInput, { message: messages[0] })
        })
      }
    }
  }

  // Prevent typing non-numeric characters in number fields
  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
      e.preventDefault()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <h2 className="mb-2 text-lg font-extrabold tracking-tight text-slate-800 dark:text-slate-100 drop-shadow-sm">Dodaj książkę</h2>

      <Field label="Tytuł *" error={errors.title?.message as string}>
        <input
          {...register('title')}
          className={input(!!errors.title)}
          placeholder="np. Władca Pierścieni"
        />
      </Field>

      <Field label="Autor *" error={errors.author?.message as string}>
        <input
          {...register('author')}
          className={input(!!errors.author)}
          placeholder="np. J.R.R. Tolkien"
        />
      </Field>

      <Field label="ISBN" error={errors.isbn?.message as string}>
        <input
          {...register('isbn')}
          className={input(!!errors.isbn)}
          placeholder="np. 9780261103573"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Liczba stron" error={errors.pages?.message as string}>
          <input
            {...register('pages')}
            type="number"
            inputMode="numeric"
            onKeyDown={handleNumericKeyDown}
            className={input(!!errors.pages)}
            placeholder="np. 400"
          />
        </Field>

        <Field label="Gatunek" error={errors.genre?.message as string}>
          <select {...register('genre')} className={input(!!errors.genre)}>
            <option value="">— wybierz —</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="glass-button w-full mt-2"
      >
        {isSubmitting ? (
          'Dodawanie…'
        ) : (
          <>
            <Plus size={18} strokeWidth={2.5} />
            Dodaj książkę
          </>
        )}
      </button>
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
      <label className="mb-1.5 block text-[13px] font-bold tracking-wide text-slate-600 uppercase dark:text-slate-400 drop-shadow-sm">{label}</label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1.5 pl-1 text-xs font-medium text-red-500 overflow-hidden"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function input(hasError: boolean) {
  return [
    'glass-input',
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
      : '',
  ].join(' ')
}
