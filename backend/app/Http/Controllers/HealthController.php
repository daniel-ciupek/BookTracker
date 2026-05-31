<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function index(): JsonResponse
    {
        $dbOk = false;
        $cacheOk = false;

        try {
            DB::connection()->getPdo();
            $dbOk = true;
        } catch (\Exception) {
        }

        try {
            Cache::store('redis')->put('health:ping', 'pong', 5);
            $cacheOk = Cache::store('redis')->get('health:ping') === 'pong';
        } catch (\Exception) {
        }

        $status = $dbOk && $cacheOk ? 'ok' : 'degraded';

        return response()->json([
            'status' => $status,
            'db' => $dbOk,
            'cache' => $cacheOk,
        ], $status === 'ok' ? 200 : 503);
    }
}
