<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRatingRequest;
use App\Models\Book;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class RatingController extends Controller
{
    public function upsert(StoreRatingRequest $request, Book $book): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $rating = Rating::updateOrCreate(
            ['book_id' => $book->id, 'user_id' => $user->id],
            ['value' => $request->validated()['value']]
        );

        Cache::flush();

        return response()->json($rating, $rating->wasRecentlyCreated ? 201 : 200);
    }

    public function destroy(Request $request, Book $book): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        Rating::where('book_id', $book->id)->where('user_id', $user->id)->delete();

        Cache::flush();

        return response()->json(['message' => 'Rating removed']);
    }
}
