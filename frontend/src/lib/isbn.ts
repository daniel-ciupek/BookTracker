export function isValidIsbn(raw: string): boolean {
  const isbn = raw.replace(/[\s-]/g, '')

  if (isbn.length === 10) return validateIsbn10(isbn)
  if (isbn.length === 13) return validateIsbn13(isbn)
  return false
}

function validateIsbn10(isbn: string): boolean {
  if (!/^\d{9}[\dX]$/.test(isbn)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(isbn[i]) * (10 - i)
  const last = isbn[9] === 'X' ? 10 : parseInt(isbn[9])
  return (sum + last) % 11 === 0
}

function validateIsbn13(isbn: string): boolean {
  if (!/^\d{13}$/.test(isbn)) return false
  let sum = 0
  for (let i = 0; i < 12; i++) sum += parseInt(isbn[i]) * (i % 2 === 0 ? 1 : 3)
  return (10 - (sum % 10)) % 10 === parseInt(isbn[12])
}
