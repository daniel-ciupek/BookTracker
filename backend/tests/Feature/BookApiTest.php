<?php

use App\Models\Book;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('POST /api/books', function () {
    it('creates a book and returns 201', function () {
        $response = $this->postJson('/api/books', [
            'title' => 'Clean Code',
            'author' => 'Robert Martin',
            'rating' => 5,
            'pages' => 464,
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['title' => 'Clean Code', 'rating' => 5]);

        $this->assertDatabaseHas('books', ['title' => 'Clean Code']);
    });

    it('returns 422 when title is missing', function () {
        $response = $this->postJson('/api/books', [
            'author' => 'Robert Martin',
            'rating' => 5,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    });

    it('returns 422 when author is missing', function () {
        $response = $this->postJson('/api/books', [
            'title' => 'Clean Code',
            'rating' => 5,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['author']);
    });

    it('returns 422 when rating is out of range', function () {
        $response = $this->postJson('/api/books', [
            'title' => 'Clean Code',
            'author' => 'Robert Martin',
            'rating' => 6,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['rating']);
    });

    it('returns 422 when rating is below minimum', function () {
        $response = $this->postJson('/api/books', [
            'title' => 'Clean Code',
            'author' => 'Robert Martin',
            'rating' => 0,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['rating']);
    });

    it('returns 422 when isbn is invalid', function () {
        $response = $this->postJson('/api/books', [
            'title' => 'Clean Code',
            'author' => 'Robert Martin',
            'rating' => 5,
            'isbn' => '1234567890',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['isbn']);
    });

    it('accepts a book without optional fields', function () {
        $response = $this->postJson('/api/books', [
            'title' => 'Minimal Book',
            'author' => 'Some Author',
            'rating' => 3,
        ]);

        $response->assertStatus(201);
    });

    it('accepts a valid ISBN-13', function () {
        $response = $this->postJson('/api/books', [
            'title' => 'ISBN Book',
            'author' => 'Author',
            'rating' => 4,
            'isbn' => '9780306406157',
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['isbn' => '9780306406157']);
    });
});

describe('GET /api/books', function () {
    it('returns 200 with data and next_cursor keys', function () {
        Book::factory()->count(3)->create();

        $response = $this->getJson('/api/books');

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'next_cursor']);
    });

    it('returns books in data array', function () {
        Book::factory()->count(5)->create();

        $response = $this->getJson('/api/books');

        $response->assertStatus(200);
        expect(count($response->json('data')))->toBe(5);
    });

    it('returns next_cursor null when results fit in one page', function () {
        Book::factory()->count(3)->create();

        $response = $this->getJson('/api/books?limit=50');

        $response->assertStatus(200)
            ->assertJson(['next_cursor' => null]);
    });

    it('returns next_cursor when there are more results', function () {
        Book::factory()->count(5)->create();

        $response = $this->getJson('/api/books?limit=3');

        $response->assertStatus(200);
        expect($response->json('next_cursor'))->not->toBeNull();
    });

    it('paginates correctly using cursor', function () {
        $books = Book::factory()->count(5)->create()->sortBy('id');
        $thirdBookId = $books->values()->get(2)->id;

        $response = $this->getJson("/api/books?cursor={$thirdBookId}&limit=10");

        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id')->toArray();
        expect($ids)->each->toBeGreaterThan($thirdBookId);
    });

    it('filters by search term in title', function () {
        Book::factory()->create(['title' => 'Laravel Best Practices', 'author' => 'Someone']);
        Book::factory()->create(['title' => 'Vue Guide', 'author' => 'Other']);

        $response = $this->getJson('/api/books?search=Laravel');

        $response->assertStatus(200);
        expect(count($response->json('data')))->toBe(1);
        expect($response->json('data.0.title'))->toBe('Laravel Best Practices');
    });

    it('filters by search term in author', function () {
        Book::factory()->create(['title' => 'Some Book', 'author' => 'Martin Fowler']);
        Book::factory()->create(['title' => 'Other Book', 'author' => 'Kent Beck']);

        $response = $this->getJson('/api/books?search=Fowler');

        $response->assertStatus(200);
        expect(count($response->json('data')))->toBe(1);
    });
});

describe('GET /api/health', function () {
    it('returns status ok with db and cache true', function () {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'ok',
                'db' => true,
                'cache' => true,
            ]);
    });
});
