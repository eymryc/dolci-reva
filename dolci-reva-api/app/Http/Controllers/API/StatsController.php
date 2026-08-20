<?php

namespace App\Http\Controllers\API;

use App\Enums\UserEnum;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Dwelling;
use App\Models\Residence;
use App\Models\Visit;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class StatsController extends Controller
{
    /**
     * Stats dashboard (admin = global, owner = scoped à son compte).
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Non authentifié',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $isAdmin = in_array($user->type, [
            UserEnum::ADMIN->value,
            UserEnum::SUPER_ADMIN->value,
        ], true);

        if ($isAdmin) {
            $stats = [
                'residences' => Residence::query()->count(),
                'hebergements' => Dwelling::query()->count(),
                'visites' => Visit::query()->count(),
                'reservations' => Booking::query()->count(),
            ];
        } else {
            $ownerId = $user->id;
            $stats = [
                'residences' => Residence::query()->where('owner_id', $ownerId)->count(),
                'hebergements' => Dwelling::query()->where('owner_id', $ownerId)->count(),
                'visites' => Visit::query()->where('owner_id', $ownerId)->count(),
                'reservations' => Booking::query()->where('owner_id', $ownerId)->count(),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
