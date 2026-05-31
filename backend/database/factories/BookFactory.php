<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BookFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => $this->faker->sentence(rand(2, 5), false),
            'author' => $this->faker->name(),
            'isbn' => null,
            'pages' => $this->faker->optional()->numberBetween(50, 1200),
            'rating' => $this->faker->numberBetween(1, 5),
        ];
    }
}
