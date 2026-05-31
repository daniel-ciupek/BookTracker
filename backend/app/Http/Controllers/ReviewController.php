<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReviewRequest;
use App\Models\Book;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request, Book $book): JsonResponse
    {
        $limit = min((int) $request->query('limit', 20), 50);
        $cursor = $request->query('cursor');

        $query = Review::with('user:id,name')
            ->where('book_id', $book->id)
            ->orderBy('id');

        if ($cursor) {
            $query->where('id', '>', (int) $cursor);
        }

        $reviews = $query->limit($limit + 1)->get();

        $hasMore = $reviews->count() > $limit;
        $data = $hasMore ? $reviews->take($limit) : $reviews;

        return response()->json([
            'data' => $data->values(),
            'next_cursor' => $hasMore ? $data->last()?->id : null,
        ]);
    }

    public function upsert(StoreReviewRequest $request, Book $book): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $review = Review::updateOrCreate(
            ['book_id' => $book->id, 'user_id' => $user->id],
            ['body' => $request->validated()['body']]
        );

        $review->load('user:id,name');

        return response()->json($review, $review->wasRecentlyCreated ? 201 : 200);
    }

    public function destroyMine(Request $request, Book $book): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $deleted = Review::where('book_id', $book->id)->where('user_id', $user->id)->delete();

        if (! $deleted) {
            return response()->json(['message' => 'Review not found'], 404);
        }

        return response()->json(['message' => 'Review removed']);
    }
}
