<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rating extends Model
{
    protected $table = 'book_ratings';

    protected $fillable = [
        'book_id',
        'user_id',
        'value',
    ];

    protected $casts = [
        'value' => 'integer',
        'book_id' => 'integer',
        'user_id' => 'integer',
    ];

    /** @return BelongsTo<Book, $this> */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
