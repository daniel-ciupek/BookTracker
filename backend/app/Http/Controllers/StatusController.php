<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStatusRequest;
use App\Models\Book;
use App\Models\User;
use App\Models\UserBookStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class StatusController extends Controller
{
    public function upsert(StoreStatusRequest $request, Book $book): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $status = UserBookStatus::updateOrCreate(
            ['book_id' => $book->id, 'user_id' => $user->id],
            ['status' => $request->validated()['status']]
        );

        Cache::flush();

        return response()->json($status);
    }

    public function destroy(Request $request, Book $book): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        UserBookStatus::where('book_id', $book->id)->where('user_id', $user->id)->delete();

        Cache::flush();

        return response()->json(['message' => 'Status removed']);
    }
}
