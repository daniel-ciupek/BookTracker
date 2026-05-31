<?php

use App\Models\Book;
use App\Models\User;
use App\Models\UserBookStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('PUT /api/books/{book}/status', function () {
    it('returns 401 without auth token', function () {
        $book = Book::factory()->create();
        $this->putJson("/api/books/{$book->id}/status", ['status' => 'reading'])->assertStatus(401);
    });

    it('creates a status and returns 200', function () {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/books/{$book->id}/status", ['status' => 'reading'])
            ->assertStatus(200)
            ->assertJsonFragment(['status' => 'reading']);

        $this->assertDatabaseHas('user_book_statuses', [
            'book_id' => $book->id,
            'user_id' => $user->id,
            'status' => 'reading',
        ]);
    });

    it('updates existing status', function () {
        $user = User::factory()->create();
        $book = Book::factory()->create();
        UserBookStatus::create(['book_id' => $book->id, 'user_id' => $user->id, 'status' => 'want_to_read']);

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/books/{$book->id}/status", ['status' => 'read'])
            ->assertStatus(200)
            ->assertJsonFragment(['status' => 'read']);

        expect(UserBookStatus::where('book_id', $book->id)->where('user_id', $user->id)->count())->toBe(1);
    });

    it('returns 422 for invalid status value', function () {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/books/{$book->id}/status", ['status' => 'finished'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    });

    it('accepts all valid enum values', function () {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        foreach (['want_to_read', 'reading', 'read'] as $status) {
            $this->actingAs($user, 'sanctum')
                ->putJson("/api/books/{$book->id}/status", ['status' => $status])
                ->assertStatus(200);
        }
    });
});

describe('DELETE /api/books/{book}/status', function () {
    it('returns 401 without auth token', function () {
        $book = Book::factory()->create();
        $this->deleteJson("/api/books/{$book->id}/status")->assertStatus(401);
    });

    it('removes the status and returns 200', function () {
        $user = User::factory()->create();
        $book = Book::factory()->create();
        UserBookStatus::create(['book_id' => $book->id, 'user_id' => $user->id, 'status' => 'reading']);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/books/{$book->id}/status")
            ->assertStatus(200);

        $this->assertDatabaseMissing('user_book_statuses', ['book_id' => $book->id, 'user_id' => $user->id]);
    });

    it('returns 200 even when no status exists', function () {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/books/{$book->id}/status")
            ->assertStatus(200);
    });
});
