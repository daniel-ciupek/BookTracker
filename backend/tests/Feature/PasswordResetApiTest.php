<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Password;

uses(RefreshDatabase::class);

describe('POST /api/forgot-password', function () {
    it('returns 200 for existing email', function () {
        User::factory()->create(['email' => 'user@example.com']);

        $this->postJson('/api/forgot-password', ['email' => 'user@example.com'])
            ->assertStatus(200)
            ->assertJsonFragment(['message' => 'Reset link sent if email exists']);
    });

    it('returns 200 for non-existing email (does not reveal existence)', function () {
        $this->postJson('/api/forgot-password', ['email' => 'nobody@example.com'])
            ->assertStatus(200);
    });

    it('returns 422 when email is missing', function () {
        $this->postJson('/api/forgot-password', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    });

    it('returns 422 when email is invalid format', function () {
        $this->postJson('/api/forgot-password', ['email' => 'not-an-email'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    });
});

describe('POST /api/reset-password', function () {
    it('returns 422 when token is missing', function () {
        $this->postJson('/api/reset-password', [
            'email' => 'user@example.com',
            'password' => 'newpassword',
            'password_confirmation' => 'newpassword',
        ])->assertStatus(422);
    });

    it('returns 422 with invalid token', function () {
        $user = User::factory()->create(['email' => 'user@example.com']);

        $this->postJson('/api/reset-password', [
            'token' => 'invalid-token',
            'email' => $user->email,
            'password' => 'newpassword',
            'password_confirmation' => 'newpassword',
        ])->assertStatus(422);
    });

    it('resets password successfully with valid token', function () {
        $user = User::factory()->create(['email' => 'user@example.com']);
        $token = Password::createToken($user);

        $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ])->assertStatus(200);
    });
});
