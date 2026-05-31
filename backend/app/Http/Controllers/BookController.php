<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookRequest;
use App\Models\Book;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class BookController extends Controller
{
    public function store(StoreBookRequest $request): JsonResponse
    {
        $book = Book::create($request->validated());

        Cache::flush();

        return response()->json($book, 201);
    }

    public function index(Request $request): JsonResponse
    {
        $limit = min((int) $request->query('limit', 50), 100);
        $cursor = $request->query('cursor');
        $search = $request->query('search', '');

        $cacheKey = 'books:'.md5(serialize([$cursor, $limit, $search]));

        $result = Cache::remember($cacheKey, 60, function () use ($cursor, $limit, $search) {
            $query = Book::query()->orderBy('id');

            if ($cursor) {
                $query->where('id', '>', (int) $cursor);
            }

            if ($search !== '') {
                $query->whereRaw(
                    '(title ILIKE ? OR author ILIKE ?)',
                    ["%{$search}%", "%{$search}%"]
                );
            }

            $books = $query->limit($limit + 1)->get();

            $hasMore = $books->count() > $limit;
            $data = $hasMore ? $books->take($limit) : $books;
            $nextCursor = $hasMore ? $data->last()?->id : null;

            return [
                'data' => $data->values(),
                'next_cursor' => $nextCursor,
            ];
        });

        return response()->json($result);
    }
}
