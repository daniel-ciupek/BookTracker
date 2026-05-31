<?php

use App\Models\Book;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('GET /api/books/{book}/reviews', function () {
    it('returns 401 without auth token', function () {
        $book = Book::factory()->create();
        $this->getJson("/api/books/{$book->id}/reviews")->assertStatus(401);
    });

    it('returns paginated reviews with user data', function () {
        $user = User::factory()->create();
        $book = Book::factory()->create();
        Review::create(['book_id' => $book->id, 'user_id' => $user->id, 'body' => 'Great book!']);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/books/{$book->id}/reviews")
            ->assertStatus(200)
            ->assertJsonStructure(['data', 'next_cursor']);

        expect($response->json('data.0.body'))->toBe('Great book!');
        expect($response->json('data.0.user.name'))->toBe($user->name);
    });

    it('returns empty list when no reviews', function () {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->getJson("/api/books/{$book->id}/reviews")
            ->assertStatus(200)
            ->assertJson(['data' => [], 'next_cursor' => null]);
    });
});

describe('POST /api/books/{book}/reviews', function () {
    it('returns 401 without auth token', function () {
        $book = Book::factory()->create();
        $this->postJson("/api/books/{$book->id}/reviews", ['body' => 'Nice'])->assertStatus(401);
    });

    it('creates a review and returns 201', function () {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/books/{$book->id}/reviews", ['body' => 'Excellent read!'])
            ->assertStatus(201)
            ->assertJsonFragment(['body' => 'Excellent read!']);

        $this->assertDatabaseHas('book_reviews', ['book_id' => $book->id, 'user_id' => $user->id]);
    });

    it('updates existing review and returns 200', function () {
        $user = User::factory()->create();
        $book = Book::factory()->create();
        Review::create(['book_id' => $book->id, 'user_id' => $user->id, 'body' => 'Old text']);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/books/{$book->id}/reviews", ['body' => 'Updated text'])
            ->assertStatus(200)
            ->assertJsonFragment(['body' => 'Updated text']);

        expect(Review::where('book_id', $book->id)->where('user_id', $user->id)->count())->toBe(1);
    });

    it('returns 422 when body is missing', function () {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/books/{$book->id}/reviews", [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['body']);
    });
});

describe('DELETE /api/books/{book}/reviews/mine', function () {
    it('returns 401 without auth token', function () {
        $book = Book::factory()->create();
        $this->deleteJson("/api/books/{$book->id}/reviews/mine")->assertStatus(401);
    });

    it('deletes own review and returns 200', function () {
        $user = User::factory()->create();
        $book = Book::factory()->create();
        Review::create(['book_id' => $book->id, 'user_id' => $user->id, 'body' => 'My review']);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/books/{$book->id}/reviews/mine")
            ->assertStatus(200);

        $this->assertDatabaseMissing('book_reviews', ['book_id' => $book->id, 'user_id' => $user->id]);
    });

    it('returns 404 when no review exists', function () {
        $user = User::factory()->create();
        $book = Book::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/books/{$book->id}/reviews/mine")
            ->assertStatus(404);
    });

    it('only deletes own review, not others', function () {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $book = Book::factory()->create();
        Review::create(['book_id' => $book->id, 'user_id' => $user1->id, 'body' => 'User1 review']);
        Review::create(['book_id' => $book->id, 'user_id' => $user2->id, 'body' => 'User2 review']);

        $this->actingAs($user1, 'sanctum')
            ->deleteJson("/api/books/{$book->id}/reviews/mine")
            ->assertStatus(200);

        $this->assertDatabaseHas('book_reviews', ['book_id' => $book->id, 'user_id' => $user2->id]);
    });
});
