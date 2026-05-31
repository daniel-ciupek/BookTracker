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

    /** @var array<int, array{title: string, author: string, isbn: string}> */
    private array $realBooks = [
        ['title' => 'Władca Pierścieni: Drużyna Pierścienia', 'author' => 'J.R.R. Tolkien', 'isbn' => '9788328700314'],
        ['title' => 'Harry Potter i Kamień Filozoficzny', 'author' => 'J.K. Rowling', 'isbn' => '9788380082113'],
        ['title' => 'Wiedźmin: Ostatnie życzenie', 'author' => 'Andrzej Sapkowski', 'isbn' => '9788375965612'],
        ['title' => '1984', 'author' => 'George Orwell', 'isbn' => '9788324173365'],
        ['title' => 'Zabić drozda', 'author' => 'Harper Lee', 'isbn' => '9788375154382'],
        ['title' => 'Mały Książę', 'author' => 'Antoine de Saint-Exupéry', 'isbn' => '9788373271708'],
        ['title' => 'Alchemik', 'author' => 'Paulo Coelho', 'isbn' => '9788330005704'],
        ['title' => 'Mistrz i Małgorzata', 'author' => 'Michaił Bułhakow', 'isbn' => '9788374955720'],
        ['title' => 'Hobbit, czyli tam i z powrotem', 'author' => 'J.R.R. Tolkien', 'isbn' => '9788324403066'],
        ['title' => 'Zbrodnia i kara', 'author' => 'Fiodor Dostojewski', 'isbn' => '9788377794357'],
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

        for ($i = 0; $i < $count; $i++) {
            if ($i < count($this->realBooks)) {
                $bookData = $this->realBooks[$i];
                $title = $bookData['title'];
                $author = $bookData['author'];
                $isbn = $bookData['isbn'];
            } else {
                $title = $faker->sentence(rand(2, 6), false);
                $author = $faker->name();
                $isbn = rand(0, 3) > 0 ? $faker->isbn13() : null;
            }

            $batch[] = [
                'added_by_user_id' => $user->id,
                'title' => $title,
                'author' => $author,
                'isbn' => $isbn,
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
