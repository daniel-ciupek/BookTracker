<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidIsbn implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $isbn = preg_replace('/[\s\-]/', '', (string) $value);

        if (strlen($isbn) === 10) {
            if (! $this->validateIsbn10($isbn)) {
                $fail('The :attribute must be a valid ISBN-10 or ISBN-13.');
            }

            return;
        }

        if (strlen($isbn) === 13) {
            if (! $this->validateIsbn13($isbn)) {
                $fail('The :attribute must be a valid ISBN-10 or ISBN-13.');
            }

            return;
        }

        $fail('The :attribute must be a valid ISBN-10 or ISBN-13.');
    }

    private function validateIsbn10(string $isbn): bool
    {
        if (! preg_match('/^\d{9}[\dX]$/', $isbn)) {
            return false;
        }

        $sum = 0;
        for ($i = 0; $i < 9; $i++) {
            $sum += (int) $isbn[$i] * (10 - $i);
        }

        $last = $isbn[9] === 'X' ? 10 : (int) $isbn[9];
        $sum += $last;

        return $sum % 11 === 0;
    }

    private function validateIsbn13(string $isbn): bool
    {
        if (! preg_match('/^\d{13}$/', $isbn)) {
            return false;
        }

        $sum = 0;
        for ($i = 0; $i < 12; $i++) {
            $weight = $i % 2 === 0 ? 1 : 3;
            $sum += (int) $isbn[$i] * $weight;
        }

        $checkDigit = (10 - ($sum % 10)) % 10;

        return $checkDigit === (int) $isbn[12];
    }
}
