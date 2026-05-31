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
        $onlyMine = $request->boolean('only_mine');

        $cacheKey = 'books:'.$user->id.':'.md5(serialize([$cursor, $limit, $search, $genre, $onlyMine]));

        $result = Cache::remember($cacheKey, 60, function () use ($user, $cursor, $limit, $search, $genre, $onlyMine) {
            $uid = $user->id;

            $query = Book::query()
                ->select('books.*')
                ->selectRaw('ROUND(AVG(br.value)::numeric, 1) as avg_rating')
                ->selectRaw('COUNT(DISTINCT br.id)::integer as ratings_count')
                ->selectRaw('COUNT(DISTINCT brev.id)::integer as reviews_count')
                ->selectRaw('MAX(CASE WHEN br_own.user_id = ? THEN br_own.value END)::integer as user_rating', [$uid])
                ->selectRaw('MAX(CASE WHEN ubs.user_id = ? THEN ubs.status END) as user_status', [$uid])
                ->selectRaw('abu.id as added_by_id')
                ->selectRaw('abu.name as added_by_name')
                ->leftJoin('book_ratings as br', 'br.book_id', '=', 'books.id')
                ->leftJoin('book_reviews as brev', 'brev.book_id', '=', 'books.id')
                ->leftJoin('book_ratings as br_own', fn ($j) => $j->on('br_own.book_id', '=', 'books.id')->where('br_own.user_id', $uid))
                ->leftJoin('user_book_statuses as ubs', fn ($j) => $j->on('ubs.book_id', '=', 'books.id')->where('ubs.user_id', $uid))
                ->leftJoin('users as abu', 'abu.id', '=', 'books.added_by_user_id')
                ->groupBy('books.id', 'abu.id', 'abu.name')
                ->orderBy('books.id');

            if ($cursor) {
                $query->where('books.id', '>', (int) $cursor);
            }

            if (mb_strlen($search) >= 3) {
                $query->whereRaw(
                    '(books.title ILIKE ? OR books.author ILIKE ?)',
                    ["%{$search}%", "%{$search}%"]
                );
            }

            if ($genre !== '') {
                $query->where('books.genre', $genre);
            }

            if ($onlyMine) {
                $query->where('books.added_by_user_id', $uid);
            }

            $books = $query->limit($limit + 1)->get();

            $hasMore = $books->count() > $limit;
            $data = $hasMore ? $books->take($limit) : $books;

            $mapped = $data->values()->map(function ($book) {
                /** @var array<string, mixed> $arr */
                $arr = $book->toArray();
                $addedById = isset($arr['added_by_id']) ? (int) $arr['added_by_id'] : null;
                $addedByName = isset($arr['added_by_name']) ? (string) $arr['added_by_name'] : null;
                $arr['avg_rating'] = isset($arr['avg_rating']) ? (float) $arr['avg_rating'] : null;
                $arr['ratings_count'] = (int) ($arr['ratings_count'] ?? 0);
                $arr['reviews_count'] = (int) ($arr['reviews_count'] ?? 0);
                $arr['user_rating'] = isset($arr['user_rating']) ? (int) $arr['user_rating'] : null;
                $arr['user_status'] = $arr['user_status'] ?? null;
                $arr['added_by'] = ($addedById && $addedByName) ? ['id' => $addedById, 'name' => $addedByName] : null;
                unset($arr['added_by_id'], $arr['added_by_name']);

                return $arr;
            })->toArray();

            return [
                'data' => $mapped,
                'next_cursor' => $hasMore ? $data->last()?->id : null,
            ];
        });

        return response()->json($result);
    }

    public function show(Request $request, Book $book): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $uid = $user->id;

        /** @var array<string, mixed>|null $stats */
        $stats = Book::query()
            ->select('books.id')
            ->selectRaw('ROUND(AVG(br.value)::numeric, 1) as avg_rating')
            ->selectRaw('COUNT(DISTINCT br.id)::integer as ratings_count')
            ->selectRaw('COUNT(DISTINCT brev.id)::integer as reviews_count')
            ->selectRaw('MAX(CASE WHEN br_own.user_id = ? THEN br_own.value END)::integer as user_rating', [$uid])
            ->selectRaw('MAX(CASE WHEN ubs.user_id = ? THEN ubs.status END) as user_status', [$uid])
            ->leftJoin('book_ratings as br', 'br.book_id', '=', 'books.id')
            ->leftJoin('book_reviews as brev', 'brev.book_id', '=', 'books.id')
            ->leftJoin('book_ratings as br_own', fn ($j) => $j->on('br_own.book_id', '=', 'books.id')->where('br_own.user_id', $uid))
            ->leftJoin('user_book_statuses as ubs', fn ($j) => $j->on('ubs.book_id', '=', 'books.id')->where('ubs.user_id', $uid))
            ->where('books.id', $book->id)
            ->groupBy('books.id')
            ->first()
            ?->toArray();

        $addedBy = $book->addedBy;

        return response()->json(array_merge($book->toArray(), [
            'avg_rating' => isset($stats['avg_rating']) ? (float) $stats['avg_rating'] : null,
            'ratings_count' => (int) ($stats['ratings_count'] ?? 0),
            'reviews_count' => (int) ($stats['reviews_count'] ?? 0),
            'user_rating' => isset($stats['user_rating']) ? (int) $stats['user_rating'] : null,
            'user_status' => $stats['user_status'] ?? null,
            'added_by' => $addedBy ? ['id' => $addedBy->id, 'name' => $addedBy->name] : null,
        ]));
    }
}
