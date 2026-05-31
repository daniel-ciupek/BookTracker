<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->renameColumn('user_id', 'added_by_user_id');
        });

        Schema::table('books', function (Blueprint $table) {
            $table->unsignedBigInteger('added_by_user_id')->nullable()->change();
            $table->dropColumn('rating');
            $table->string('genre', 50)->nullable()->after('pages');
        });
    }

    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn('genre');
            $table->unsignedTinyInteger('rating')->default(0)->after('pages');
            $table->renameColumn('added_by_user_id', 'user_id');
        });
    }
};
