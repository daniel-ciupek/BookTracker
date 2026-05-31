<?php

namespace Database\Seeders;

use Faker\Factory as FakerFactory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BookSeeder extends Seeder
{
    public function run(): void
    {
        $count = (int) env('SEED_COUNT', 50);
        $faker = FakerFactory::create();
        $chunkSize = 1000;
        $batch = [];

        for ($i = 0; $i < $count; $i++) {
            $batch[] = [
                'title' => $faker->sentence(rand(2, 6), false),
                'author' => $faker->name(),
                'isbn' => rand(0, 3) > 0 ? $faker->isbn13() : null,
                'pages' => rand(0, 3) > 0 ? rand(50, 1200) : null,
                'rating' => rand(1, 5),
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
    }
}
