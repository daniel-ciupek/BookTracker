<?php

namespace Database\Seeders;

use App\Models\Rating;
use App\Models\Review;
use App\Models\User;
use Faker\Factory as FakerFactory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BookSeeder extends Seeder
{
    /** @var array<int, string> */
    private array $genres = [
        'Fantastyka', 'Kryminał', 'Romans', 'Thriller',
        'Historia', 'Biografia', 'Nauka', 'Inne',
    ];

    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'demo@example.com'],
            ['name' => 'Demo User', 'password' => 'password']
        );

        $count = (int) env('SEED_COUNT', 10000);
        $faker = FakerFactory::create();
        $chunkSize = 1000;
        $batch = [];
        $insertedIds = [];

        for ($i = 0; $i < $count; $i++) {
            $batch[] = [
                'added_by_user_id' => $user->id,
                'title' => $faker->sentence(rand(2, 6), false),
                'author' => $faker->name(),
                'isbn' => rand(0, 3) > 0 ? $faker->isbn13() : null,
                'pages' => rand(0, 3) > 0 ? rand(50, 1200) : null,
                'genre' => $this->genres[array_rand($this->genres)],
                'created_at' => now(),
                'updated_at' => now(),
            ];

            if (count($batch) === $chunkSize) {
                DB::table('books')->insert($batch);
                $batch = [];
            }
        }

        if ($batch !== []) {
            DB::table('books')->insert($batch);
        }

        // Sample ratings and reviews for demo user (first 20 books)
        $bookIds = DB::table('books')->limit(20)->pluck('id');

        foreach ($bookIds as $bookId) {
            Rating::create([
                'book_id' => $bookId,
                'user_id' => $user->id,
                'value' => rand(1, 5),
            ]);
        }

        foreach ($bookIds->take(5) as $bookId) {
            Review::create([
                'book_id' => $bookId,
                'user_id' => $user->id,
                'body' => $faker->paragraph(3),
            ]);
        }
    }
}
