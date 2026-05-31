<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

describe('PATCH /api/user', function () {
    it('returns 401 without auth token', function () {
        $this->patchJson('/api/user', ['name' => 'New Name'])->assertStatus(401);
    });

    it('updates name and returns 200', function () {
        $user = User::factory()->create(['name' => 'Old Name']);

        $this->actingAs($user, 'sanctum')
            ->patchJson('/api/user', ['name' => 'New Name'])
            ->assertStatus(200)
            ->assertJsonFragment(['name' => 'New Name']);

        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'New Name']);
    });

    it('updates email and returns 200', function () {
        $user = User::factory()->create(['email' => 'old@example.com']);

        $this->actingAs($user, 'sanctum')
            ->patchJson('/api/user', ['email' => 'new@example.com'])
            ->assertStatus(200)
            ->assertJsonFragment(['email' => 'new@example.com']);
    });

    it('returns 422 when email is already taken by another user', function () {
        User::factory()->create(['email' => 'taken@example.com']);
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->patchJson('/api/user', ['email' => 'taken@example.com'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    });

    it('allows keeping own email', function () {
        $user = User::factory()->create(['email' => 'mine@example.com']);

        $this->actingAs($user, 'sanctum')
            ->patchJson('/api/user', ['email' => 'mine@example.com'])
            ->assertStatus(200);
    });
});

describe('PUT /api/user/password', function () {
    it('returns 401 without auth token', function () {
        $this->putJson('/api/user/password', [
            'current_password' => 'old',
            'password' => 'newpass123',
            'password_confirmation' => 'newpass123',
        ])->assertStatus(401);
    });

    it('changes password successfully', function () {
        $user = User::factory()->create(['password' => Hash::make('oldpassword')]);

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/user/password', [
                'current_password' => 'oldpassword',
                'password' => 'newpassword',
                'password_confirmation' => 'newpassword',
            ])
            ->assertStatus(200);

        $user->refresh();
        expect(Hash::check('newpassword', $user->password))->toBeTrue();
    });

    it('returns 422 when current password is wrong', function () {
        $user = User::factory()->create(['password' => Hash::make('correctpassword')]);

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/user/password', [
                'current_password' => 'wrongpassword',
                'password' => 'newpassword',
                'password_confirmation' => 'newpassword',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['current_password']);
    });

    it('returns 422 when password confirmation does not match', function () {
        $user = User::factory()->create(['password' => Hash::make('correctpassword')]);

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/user/password', [
                'current_password' => 'correctpassword',
                'password' => 'newpassword',
                'password_confirmation' => 'different',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    });

    it('returns 422 when new password is too short', function () {
        $user = User::factory()->create(['password' => Hash::make('correctpassword')]);

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/user/password', [
                'current_password' => 'correctpassword',
                'password' => 'short',
                'password_confirmation' => 'short',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    });
});
