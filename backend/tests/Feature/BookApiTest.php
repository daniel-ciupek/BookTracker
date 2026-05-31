<?php

use App\Models\Book;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('POST /api/books', function () {
    it('returns 401 without auth token', function () {
        $this->postJson('/api/books', ['title' => 'Test', 'author' => 'Author', 'rating' => 3])
            ->assertStatus(401);
    });

    it('creates a book and returns 201', function () {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/books', [
                'title' => 'Clean Code',
                'author' => 'Robert Martin',
                'rating' => 5,
                'pages' => 464,
            ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['title' => 'Clean Code', 'rating' => 5]);

        $this->assertDatabaseHas('books', ['title' => 'Clean Code', 'user_id' => $user->id]);
    });

    it('returns 422 when title is missing', function () {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/books', ['author' => 'Robert Martin', 'rating' => 5])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    });

    it('returns 422 when author is missing', function () {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/books', ['title' => 'Clean Code', 'rating' => 5])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['author']);
    });

    it('returns 422 when rating is out of range', function () {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/books', ['title' => 'Clean Code', 'author' => 'Robert Martin', 'rating' => 6])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['rating']);
    });

    it('returns 422 when rating is below minimum', function () {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/books', ['title' => 'Clean Code', 'author' => 'Robert Martin', 'rating' => 0])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['rating']);
    });

    it('returns 422 when isbn is invalid', function () {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/books', ['title' => 'Clean Code', 'author' => 'Robert Martin', 'rating' => 5, 'isbn' => '1234567890'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['isbn']);
    });

    it('accepts a book without optional fields', function () {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/books', ['title' => 'Minimal Book', 'author' => 'Some Author', 'rating' => 3])
            ->assertStatus(201);
    });

    it('accepts a valid ISBN-13', function () {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/books', ['title' => 'ISBN Book', 'author' => 'Author', 'rating' => 4, 'isbn' => '9780306406157'])
            ->assertStatus(201)
            ->assertJsonFragment(['isbn' => '9780306406157']);
    });
});

describe('GET /api/books', function () {
    it('returns 401 without auth token', function () {
        $this->getJson('/api/books')->assertStatus(401);
    });

    it('returns 200 with data and next_cursor keys', function () {
        $user = User::factory()->create();
        Book::factory()->count(3)->create(['user_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/books')
            ->assertStatus(200)
            ->assertJsonStructure(['data', 'next_cursor']);
    });

    it('returns only books of the authenticated user', function () {
        $user = User::factory()->create();
        $other = User::factory()->create();
        Book::factory()->count(3)->create(['user_id' => $user->id]);
        Book::factory()->count(5)->create(['user_id' => $other->id]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/books');

        $response->assertStatus(200);
        expect(count($response->json('data')))->toBe(3);
    });

    it('returns next_cursor null when results fit in one page', function () {
        $user = User::factory()->create();
        Book::factory()->count(3)->create(['user_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/books?limit=50')
            ->assertStatus(200)
            ->assertJson(['next_cursor' => null]);
    });

    it('returns next_cursor when there are more results', function () {
        $user = User::factory()->create();
        Book::factory()->count(5)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/books?limit=3');

        $response->assertStatus(200);
        expect($response->json('next_cursor'))->not->toBeNull();
    });

    it('paginates correctly using cursor', function () {
        $user = User::factory()->create();
        $books = Book::factory()->count(5)->create(['user_id' => $user->id])->sortBy('id');
        $thirdBookId = $books->values()->get(2)->id;

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/books?cursor={$thirdBookId}&limit=10");

        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id')->toArray();
        expect($ids)->each->toBeGreaterThan($thirdBookId);
    });

    it('filters by search term in title', function () {
        $user = User::factory()->create();
        Book::factory()->create(['user_id' => $user->id, 'title' => 'Laravel Best Practices', 'author' => 'Someone']);
        Book::factory()->create(['user_id' => $user->id, 'title' => 'Vue Guide', 'author' => 'Other']);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/books?search=Laravel');

        $response->assertStatus(200);
        expect(count($response->json('data')))->toBe(1);
        expect($response->json('data.0.title'))->toBe('Laravel Best Practices');
    });

    it('filters by search term in author', function () {
        $user = User::factory()->create();
        Book::factory()->create(['user_id' => $user->id, 'title' => 'Some Book', 'author' => 'Martin Fowler']);
        Book::factory()->create(['user_id' => $user->id, 'title' => 'Other Book', 'author' => 'Kent Beck']);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/books?search=Fowler');

        $response->assertStatus(200);
        expect(count($response->json('data')))->toBe(1);
    });
});

describe('GET /api/health', function () {
    it('returns status ok with db and cache true', function () {
        $this->getJson('/api/health')
            ->assertStatus(200)
            ->assertJson(['status' => 'ok', 'db' => true, 'cache' => true]);
    });
});
