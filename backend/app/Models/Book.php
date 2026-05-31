<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $fillable = [
        'title',
        'author',
        'isbn',
        'pages',
        'rating',
    ];

    protected $casts = [
        'rating' => 'integer',
        'pages' => 'integer',
    ];
}
