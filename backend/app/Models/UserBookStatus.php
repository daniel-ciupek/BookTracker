<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserBookStatus extends Model
{
    protected $fillable = [
        'book_id',
        'user_id',
        'status',
    ];

    protected $casts = [
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
