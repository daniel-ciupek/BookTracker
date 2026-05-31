<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:20,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [PasswordResetController::class, 'sendLink']);
    Route::post('/reset-password', [PasswordResetController::class, 'reset']);
});

Route::get('/health', [HealthController::class, 'index']);

Route::middleware(['auth:sanctum', 'throttle:100,1'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::patch('/user', [UserController::class, 'update']);
    Route::put('/user/password', [UserController::class, 'changePassword']);

    Route::get('/books', [BookController::class, 'index']);
    Route::post('/books', [BookController::class, 'store']);
    Route::get('/books/{book}', [BookController::class, 'show']);

    Route::put('/books/{book}/rating', [RatingController::class, 'upsert']);
    Route::delete('/books/{book}/rating', [RatingController::class, 'destroy']);

    Route::get('/books/{book}/reviews', [ReviewController::class, 'index']);
    Route::post('/books/{book}/reviews', [ReviewController::class, 'upsert']);
    Route::delete('/books/{book}/reviews/mine', [ReviewController::class, 'destroyMine']);

    Route::put('/books/{book}/status', [StatusController::class, 'upsert']);
    Route::delete('/books/{book}/status', [StatusController::class, 'destroy']);
});
