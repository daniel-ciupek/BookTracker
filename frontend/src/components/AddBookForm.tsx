import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ValidationError } from '../api/books'
import { useAddBook } from '../hooks/useBooks'
import { GENRES } from '../lib/constants'
import { isValidIsbn } from '../lib/isbn'
import { IconPlus } from '@tabler/icons-react'

const schema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany').max(255),
  author: z.string().min(1, 'Autor jest wymagany').max(255),
  isbn: z
    .string()
    .optional()
    .refine((v) => !v || isValidIsbn(v), { message: 'Nieprawidłowy ISBN-10 lub ISBN-13' }),
  pages: z
    .union([z.coerce.number().int().min(1).max(99999), z.literal('')])
    .optional()
    .transform((v) => (v === '' || v === undefined ? undefined : Number(v))),
  genre: z.string().optional(),
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export function AddBookForm() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema) })

  const mutation = useAddBook()

  async function onSubmit(data: FormOutput) {
    try {
      await mutation.mutateAsync({
        title: data.title,
        author: data.author,
        isbn: data.isbn || undefined,
        pages: data.pages,
        genre: data.genre || undefined,
      })
      reset()
    } catch (err) {
      if (err instanceof ValidationError) {
        Object.entries(err.errors).forEach(([field, messages]) => {
          setError(field as keyof FormInput, { message: messages[0] })
        })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <h2 className="mb-2 text-lg font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Dodaj książkę</h2>

      <Field label="Tytuł *" error={errors.title?.message}>
        <input
          {...register('title')}
          className={input(!!errors.title)}
          placeholder="np. Władca Pierścieni"
        />
      </Field>

      <Field label="Autor *" error={errors.author?.message}>
        <input
          {...register('author')}
          className={input(!!errors.author)}
          placeholder="np. J.R.R. Tolkien"
        />
      </Field>

      <Field label="ISBN" error={errors.isbn?.message}>
        <input
          {...register('isbn')}
          className={input(!!errors.isbn)}
          placeholder="np. 9780261103573"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Liczba stron" error={errors.pages?.message}>
          <input
            {...register('pages')}
            type="number"
            min={1}
            max={99999}
            className={input(!!errors.pages)}
            placeholder="np. 400"
          />
        </Field>

        <Field label="Gatunek" error={errors.genre?.message}>
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
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-slate-850"
      >
        {isSubmitting ? (
          'Dodawanie…'
        ) : (
          <>
            <IconPlus size={18} stroke={2.5} />
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
    <div>
      <label className="mb-1.5 block text-[13px] font-bold tracking-wide text-slate-600 uppercase dark:text-slate-400">{label}</label>
      {children}
      {error && <p className="mt-1.5 pl-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  )
}

function input(hasError: boolean) {
  return [
    'w-full rounded-xl border bg-slate-50/50 px-4 py-2.5 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 dark:bg-slate-900/50 dark:text-slate-200 dark:placeholder-slate-500',
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700',
  ].join(' ')
}
