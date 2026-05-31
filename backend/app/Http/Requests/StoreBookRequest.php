<?php

namespace App\Http\Requests;

use App\Rules\ValidIsbn;
use Illuminate\Foundation\Http\FormRequest;

class StoreBookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'author' => ['required', 'string', 'max:255'],
            'isbn' => ['nullable', 'string', 'unique:books,isbn', new ValidIsbn],
            'pages' => ['nullable', 'integer', 'min:1', 'max:99999'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
        ];
    }
}
