<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookRequest;
use App\Models\Book;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class BookController extends Controller
{
    public function store(StoreBookRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $data = array_merge($request->validated(), ['added_by_user_id' => $user->id]);
        $book = Book::create($data);

        Cache::flush();

        return response()->json($book, 201);
    }

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $limit = min((int) $request->query('limit', 50), 100);
        $cursor = $request->query('cursor');
        $search = $request->query('search', '');
        $genre = $request->query('genre', '');

        $cacheKey = 'books:'.$user->id.':'.md5(serialize([$cursor, $limit, $search, $genre]));

        $result = Cache::remember($cacheKey, 60, function () use ($cursor, $limit, $search, $genre) {
            $query = Book::query()->orderBy('books.id');

            if ($cursor) {
                $query->where('books.id', '>', (int) $cursor);
            }

            if ($search !== '') {
                $query->whereRaw(
                    '(title ILIKE ? OR author ILIKE ?)',
                    ["%{$search}%", "%{$search}%"]
                );
            }

            if ($genre !== '') {
                $query->where('genre', $genre);
            }

            $books = $query->limit($limit + 1)->get();

            $hasMore = $books->count() > $limit;
            $data = $hasMore ? $books->take($limit) : $books;
            $nextCursor = $hasMore ? $data->last()?->id : null;

            return [
                'data' => $data->values()->toArray(),
                'next_cursor' => $nextCursor,
            ];
        });

        return response()->json($result);
    }

    public function show(Book $book): JsonResponse
    {
        return response()->json($book);
    }
}
