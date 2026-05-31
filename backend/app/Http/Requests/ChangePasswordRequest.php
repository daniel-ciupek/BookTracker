<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Validator;

class ChangePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            /** @var User $user */
            $user = $this->user();
            if (! Hash::check($this->input('current_password'), $user->password)) {
                $v->errors()->add('current_password', 'The current password is incorrect.');
            }
        });
    }
}
