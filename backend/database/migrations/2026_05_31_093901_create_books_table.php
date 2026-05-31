<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('author');
            $table->string('isbn', 17)->unique()->nullable();
            $table->unsignedSmallInteger('pages')->nullable();
            $table->unsignedTinyInteger('rating');
            $table->timestamps();
        });

        DB::statement('CREATE EXTENSION IF NOT EXISTS pg_trgm');
        DB::statement('CREATE INDEX books_title_trgm_idx ON books USING GIN (title gin_trgm_ops)');
        DB::statement('CREATE INDEX books_author_trgm_idx ON books USING GIN (author gin_trgm_ops)');
    }

    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
