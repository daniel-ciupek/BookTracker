<?php

use App\Http\Controllers\BookController;
use App\Http\Controllers\HealthController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:100,1')->group(function () {
    Route::post('/books', [BookController::class, 'store']);
    Route::get('/books', [BookController::class, 'index']);
    Route::get('/health', [HealthController::class, 'index']);
});
