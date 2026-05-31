<?php

use App\Models\Book;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('PUT /api/books/{book}/rating', function () {
    it('returns 401 without auth token', function () {
        $book = Book::factory()->create();
        $this->putJson("/api/books/{$book->id}/rating", ['value' => 4])
            ->assertStatus(401);
    });

    it('creates a rating and returns 201', function () {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/books/{$book->id}/rating", ['value' => 4])
            ->assertStatus(201)
            ->assertJsonFragment(['value' => 4]);

        $this->assertDatabaseHas('book_ratings', ['book_id' => $book->id, 'user_id' => $user->id, 'value' => 4]);
    });

    it('updates existing rating and returns 200', function () {
        $user = User::factory()->create();
        $book = Book::factory()->create();
        Rating::create(['book_id' => $book->id, 'user_id' => $user->id, 'value' => 3]);

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/books/{$book->id}/rating", ['value' => 5])
            ->assertStatus(200)
            ->assertJsonFragment(['value' => 5]);
    });

    it('returns 422 when value is missing', function () {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/books/{$book->id}/rating", [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['value']);
    });

    it('returns 422 when value is out of range', function () {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/books/{$book->id}/rating", ['value' => 6])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['value']);
    });

    it('two users can rate the same book independently', function () {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $book = Book::factory()->create();

        $this->actingAs($user1, 'sanctum')->putJson("/api/books/{$book->id}/rating", ['value' => 2])->assertStatus(201);
        $this->actingAs($user2, 'sanctum')->putJson("/api/books/{$book->id}/rating", ['value' => 5])->assertStatus(201);

        expect(Rating::where('book_id', $book->id)->count())->toBe(2);
    });
});

describe('DELETE /api/books/{book}/rating', function () {
    it('returns 401 without auth token', function () {
        $book = Book::factory()->create();
        $this->deleteJson("/api/books/{$book->id}/rating")->assertStatus(401);
    });

    it('removes the rating and returns 200', function () {
        $user = User::factory()->create();
        $book = Book::factory()->create();
        Rating::create(['book_id' => $book->id, 'user_id' => $user->id, 'value' => 3]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/books/{$book->id}/rating")
            ->assertStatus(200);

        $this->assertDatabaseMissing('book_ratings', ['book_id' => $book->id, 'user_id' => $user->id]);
    });

    it('returns 200 even when no rating exists', function () {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/books/{$book->id}/rating")
            ->assertStatus(200);
    });
});
