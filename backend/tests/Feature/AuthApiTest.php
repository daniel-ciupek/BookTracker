<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('POST /api/register', function () {
    it('creates a user and returns token', function () {
        $response = $this->postJson('/api/register', [
            'name' => 'Jan Kowalski',
            'email' => 'jan@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);

        $this->assertDatabaseHas('users', ['email' => 'jan@example.com']);
    });

    it('returns 422 when email is already taken', function () {
        User::factory()->create(['email' => 'jan@example.com']);

        $this->postJson('/api/register', [
            'name' => 'Jan Kowalski',
            'email' => 'jan@example.com',
            'password' => 'password123',
        ])->assertStatus(422)->assertJsonValidationErrors(['email']);
    });

    it('returns 422 when password is too short', function () {
        $this->postJson('/api/register', [
            'name' => 'Jan Kowalski',
            'email' => 'jan@example.com',
            'password' => 'short',
        ])->assertStatus(422)->assertJsonValidationErrors(['password']);
    });

    it('returns 422 when required fields are missing', function () {
        $this->postJson('/api/register', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    });
});

describe('POST /api/login', function () {
    it('returns token on valid credentials', function () {
        User::factory()->create(['email' => 'jan@example.com', 'password' => 'password123']);

        $response = $this->postJson('/api/login', [
            'email' => 'jan@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'user' => ['id', 'email']]);
    });

    it('returns 401 on wrong password', function () {
        User::factory()->create(['email' => 'jan@example.com', 'password' => 'password123']);

        $this->postJson('/api/login', [
            'email' => 'jan@example.com',
            'password' => 'wrongpassword',
        ])->assertStatus(401);
    });

    it('returns 401 on unknown email', function () {
        $this->postJson('/api/login', [
            'email' => 'nobody@example.com',
            'password' => 'password123',
        ])->assertStatus(401);
    });
});

describe('POST /api/logout', function () {
    it('logs out and revokes token', function () {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/logout')
            ->assertStatus(200)
            ->assertJson(['message' => 'Logged out']);
    });

    it('returns 401 without token', function () {
        $this->postJson('/api/logout')->assertStatus(401);
    });
});

describe('GET /api/me', function () {
    it('returns authenticated user', function () {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/me')
            ->assertStatus(200)
            ->assertJsonFragment(['email' => $user->email]);
    });

    it('returns 401 without token', function () {
        $this->getJson('/api/me')->assertStatus(401);
    });
});
