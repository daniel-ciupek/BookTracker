import { describe, expect, it } from 'vitest'
import { isValidIsbn } from '../lib/isbn'

describe('isValidIsbn', () => {
  describe('ISBN-10', () => {
    it('accepts a valid ISBN-10', () => {
      expect(isValidIsbn('0306406152')).toBe(true)
    })

    it('accepts a valid ISBN-10 with X check digit', () => {
      expect(isValidIsbn('097522980X')).toBe(true)
    })

    it('accepts ISBN-10 with hyphens', () => {
      expect(isValidIsbn('0-306-40615-2')).toBe(true)
    })

    it('rejects an ISBN-10 with wrong check digit', () => {
      expect(isValidIsbn('0306406151')).toBe(false)
    })

    it('rejects an ISBN-10 with invalid characters', () => {
      expect(isValidIsbn('030640615A')).toBe(false)
    })
  })

  describe('ISBN-13', () => {
    it('accepts a valid ISBN-13', () => {
      expect(isValidIsbn('9780306406157')).toBe(true)
    })

    it('accepts a valid ISBN-13 with hyphens', () => {
      expect(isValidIsbn('978-0-306-40615-7')).toBe(true)
    })

    it('rejects an ISBN-13 with wrong check digit', () => {
      expect(isValidIsbn('9780306406158')).toBe(false)
    })

    it('rejects an ISBN-13 with non-numeric characters', () => {
      expect(isValidIsbn('978030640615X')).toBe(false)
    })
  })

  describe('invalid formats', () => {
    it('rejects a too-short string', () => {
      expect(isValidIsbn('12345')).toBe(false)
    })

    it('rejects a too-long string', () => {
      expect(isValidIsbn('97803064061570')).toBe(false)
    })

    it('rejects an empty string', () => {
      expect(isValidIsbn('')).toBe(false)
    })
  })
})
