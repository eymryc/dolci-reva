<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Dwelling;
use App\Models\Hotel;
use App\Models\HotelRoom;
use App\Models\Lounge;
use App\Models\NightClub;
use App\Models\Residence;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

class MediaController extends Controller
{
    /**
     * Alias courts acceptés côté client → FQCN allowlist.
     *
     * @var array<string, class-string<Model>>
     */
    private const MORPH_MAP = [
        'hotel' => Hotel::class,
        'hotels' => Hotel::class,
        Hotel::class => Hotel::class,
        'residence' => Residence::class,
        'residences' => Residence::class,
        Residence::class => Residence::class,
        'restaurant' => Restaurant::class,
        'restaurants' => Restaurant::class,
        Restaurant::class => Restaurant::class,
        'lounge' => Lounge::class,
        'lounges' => Lounge::class,
        Lounge::class => Lounge::class,
        'night_club' => NightClub::class,
        'night-club' => NightClub::class,
        'nightclubs' => NightClub::class,
        NightClub::class => NightClub::class,
        'dwelling' => Dwelling::class,
        'dwellings' => Dwelling::class,
        Dwelling::class => Dwelling::class,
        'hotel_room' => HotelRoom::class,
        'hotel-rooms' => HotelRoom::class,
        HotelRoom::class => HotelRoom::class,
        'user' => User::class,
        User::class => User::class,
    ];

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'model_type' => 'required|string',
            'model_id' => 'required|integer',
            'collection' => 'required|string|max:100',
            'file' => 'required|'.\App\Support\ImageUploadRules::file(10240),
        ]);

        try {
            $model = $this->resolveAuthorizedModel($request->input('model_type'), (int) $request->input('model_id'));

            $media = $model->addMediaFromRequest('file')
                ->toMediaCollection($request->collection);

            return response()->json([
                'status' => Response::HTTP_CREATED,
                'success' => true,
                'message' => 'Media uploaded successfully',
                'data' => $this->formatMedia($media),
            ], Response::HTTP_CREATED);
        } catch (HttpException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        } catch (\Exception $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Error uploading media',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getMedia(Request $request): JsonResponse
    {
        $request->validate([
            'model_type' => 'required|string',
            'model_id' => 'required|integer',
            'collection' => 'nullable|string',
        ]);

        try {
            $model = $this->resolveAuthorizedModel($request->input('model_type'), (int) $request->input('model_id'), false);

            $query = $model->media();
            if ($request->collection) {
                $query->where('collection_name', $request->collection);
            }

            $mediaData = $query->get()->map(fn ($item) => $this->formatMedia($item));

            return response()->json([
                'status' => Response::HTTP_OK,
                'success' => true,
                'data' => $mediaData,
            ], Response::HTTP_OK);
        } catch (HttpException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        } catch (\Exception $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Error retrieving media',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function deleteMedia(Media $media): JsonResponse
    {
        try {
            $this->authorizeMedia($media);
            $media->delete();

            return response()->json([
                'status' => Response::HTTP_OK,
                'success' => true,
                'message' => 'Media deleted successfully',
            ], Response::HTTP_OK);
        } catch (HttpException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        } catch (\Exception $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Error deleting media',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function clearCollection(Request $request): JsonResponse
    {
        $request->validate([
            'model_type' => 'required|string',
            'model_id' => 'required|integer',
            'collection' => 'required|string',
        ]);

        try {
            $model = $this->resolveAuthorizedModel($request->input('model_type'), (int) $request->input('model_id'));
            $model->clearMediaCollection($request->collection);

            return response()->json([
                'status' => Response::HTTP_OK,
                'success' => true,
                'message' => 'Collection cleared successfully',
            ], Response::HTTP_OK);
        } catch (HttpException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        } catch (\Exception $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Error clearing collection',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @return Model&object{media(): mixed, addMediaFromRequest: mixed, clearMediaCollection: mixed}
     */
    private function resolveAuthorizedModel(string $type, int $id, bool $requireWrite = true): Model
    {
        $class = self::MORPH_MAP[$type] ?? self::MORPH_MAP[ltrim($type, '\\')] ?? null;
        if (! $class) {
            throw new HttpException(422, 'Type de modèle non autorisé.');
        }

        $model = $class::findOrFail($id);
        $this->authorizeModelOwner($model, $requireWrite);

        return $model;
    }

    private function authorizeMedia(Media $media): void
    {
        $model = $media->model;
        if (! $model instanceof Model) {
            throw new HttpException(404, 'Média introuvable.');
        }
        $this->authorizeModelOwner($model, true);
    }

    private function authorizeModelOwner(Model $model, bool $requireWrite): void
    {
        /** @var User $user */
        $user = Auth::user();
        if ($user->isAdmin()) {
            return;
        }

        // Lecture publique soft: même règle ownership pour éviter IDOR PII
        if ($model instanceof User) {
            if ((int) $model->id !== (int) $user->id) {
                throw new HttpException(403, 'Accès média non autorisé.');
            }

            return;
        }

        $ownerId = null;
        if (isset($model->owner_id)) {
            $ownerId = (int) $model->owner_id;
        } elseif ($model instanceof HotelRoom && $model->relationLoaded('hotel') === false) {
            $model->load('hotel');
            $ownerId = (int) ($model->hotel?->owner_id ?? 0);
        } elseif (method_exists($model, 'hotel') && $model->hotel) {
            $ownerId = (int) $model->hotel->owner_id;
        }

        if ($ownerId === null || $ownerId !== (int) $user->id) {
            // For nested rooms without relation: try hotel_id
            if ($model instanceof HotelRoom) {
                $hotel = Hotel::find($model->hotel_id);
                if ($hotel && (int) $hotel->owner_id === (int) $user->id) {
                    return;
                }
            }
            throw new HttpException(403, 'Accès média non autorisé.');
        }

        if (! $requireWrite) {
            return;
        }
    }

    private function formatMedia(Media $media): array
    {
        return [
            'id' => $media->id,
            'name' => $media->name,
            'file_name' => $media->file_name,
            'mime_type' => $media->mime_type,
            'size' => $media->size,
            'collection_name' => $media->collection_name,
            'url' => $media->getUrl(),
            'thumb_url' => $media->getUrl('thumb'),
            'medium_url' => $media->getUrl('medium'),
            'large_url' => $media->getUrl('large'),
            'created_at' => $media->created_at,
        ];
    }
}
