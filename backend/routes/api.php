<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\HealthController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:20,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::get('/health', [HealthController::class, 'index']);

Route::middleware(['auth:sanctum', 'throttle:100,1'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/books', [BookController::class, 'store']);
    Route::get('/books', [BookController::class, 'index']);
});
