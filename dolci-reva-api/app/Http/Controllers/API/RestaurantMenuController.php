<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\RestaurantMenuCategoryRequest;
use App\Http\Requests\RestaurantMenuItemRequest;
use App\Http\Resources\RestaurantMenuCategoryResource;
use App\Http\Resources\RestaurantMenuItemResource;
use App\Models\Restaurant;
use App\Models\RestaurantMenuCategory;
use App\Models\RestaurantMenuItem;
use App\Traits\AuthorizesEstablishmentOwnership;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\UploadedFile;
use Symfony\Component\HttpFoundation\Response;

class RestaurantMenuController extends Controller
{
    use AuthorizesEstablishmentOwnership;

    public function categories(int|string|Restaurant $restaurant): AnonymousResourceCollection
    {
        $restaurantId = $restaurant instanceof Restaurant ? $restaurant->id : (int) $restaurant;

        $categories = RestaurantMenuCategory::query()
            ->where('restaurant_id', $restaurantId)
            ->withCount('menuItems')
            ->orderBy('order')
            ->latest()
            ->get();

        return RestaurantMenuCategoryResource::collection($categories);
    }

    public function storeCategory(
        RestaurantMenuCategoryRequest $request,
        int|string|Restaurant $restaurant
    ): JsonResponse {
        $restaurant = $this->resolveRestaurant($restaurant);
        $this->authorizeEstablishmentOwner($restaurant);
        $restaurantId = $restaurant->id;
        $data = $request->validated();

        $category = RestaurantMenuCategory::create([
            ...$data,
            'restaurant_id' => $restaurantId,
            'order' => $data['order'] ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Catégorie créée avec succès',
            'data' => new RestaurantMenuCategoryResource($category->loadCount('menuItems')),
        ], Response::HTTP_CREATED);
    }

    public function showCategory(
        int|string|Restaurant $restaurant,
        int $categoryId
    ): RestaurantMenuCategoryResource|JsonResponse {
        $restaurantId = $restaurant instanceof Restaurant ? $restaurant->id : (int) $restaurant;

        $category = RestaurantMenuCategory::query()
            ->where('restaurant_id', $restaurantId)
            ->withCount('menuItems')
            ->find($categoryId);

        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Catégorie introuvable'], Response::HTTP_NOT_FOUND);
        }

        return new RestaurantMenuCategoryResource($category);
    }

    public function updateCategory(
        RestaurantMenuCategoryRequest $request,
        int|string|Restaurant $restaurant,
        int $categoryId
    ): JsonResponse {
        $restaurant = $this->resolveRestaurant($restaurant);
        $this->authorizeEstablishmentOwner($restaurant);
        $restaurantId = $restaurant->id;

        $category = RestaurantMenuCategory::query()
            ->where('restaurant_id', $restaurantId)
            ->find($categoryId);

        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Catégorie introuvable'], Response::HTTP_NOT_FOUND);
        }

        $category->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Catégorie mise à jour',
            'data' => new RestaurantMenuCategoryResource($category->fresh()->loadCount('menuItems')),
        ]);
    }

    public function destroyCategory(
        int|string|Restaurant $restaurant,
        int $categoryId
    ): JsonResponse {
        $restaurant = $this->resolveRestaurant($restaurant);
        $this->authorizeEstablishmentOwner($restaurant);
        $restaurantId = $restaurant->id;

        $category = RestaurantMenuCategory::query()
            ->where('restaurant_id', $restaurantId)
            ->find($categoryId);

        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Catégorie introuvable'], Response::HTTP_NOT_FOUND);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Catégorie supprimée',
        ]);
    }

    public function items(Request $request, int|string|Restaurant $restaurant): AnonymousResourceCollection
    {
        $restaurantId = $restaurant instanceof Restaurant ? $restaurant->id : (int) $restaurant;

        $query = RestaurantMenuItem::query()
            ->where('restaurant_id', $restaurantId)
            ->with(['category', 'media'])
            ->latest();

        if ($request->filled('category_id')) {
            $query->where('category_id', (int) $request->input('category_id'));
        }

        return RestaurantMenuItemResource::collection($query->get());
    }

    public function storeItem(
        RestaurantMenuItemRequest $request,
        int|string|Restaurant $restaurant
    ): JsonResponse {
        $restaurant = $this->resolveRestaurant($restaurant);
        $this->authorizeEstablishmentOwner($restaurant);
        $restaurantId = $restaurant->id;
        $data = $request->validated();
        unset($data['images']);

        $category = RestaurantMenuCategory::where('restaurant_id', $restaurantId)
            ->where('id', $data['category_id'])
            ->first();

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'La catégorie n\'appartient pas à ce restaurant',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $item = RestaurantMenuItem::create([
            ...$data,
            'restaurant_id' => $restaurantId,
            'currency' => $data['currency'] ?? 'XOF',
            'is_available' => $data['is_available'] ?? true,
            'is_active' => $data['is_active'] ?? true,
        ]);

        $this->attachImages($item, $request->file('images', []));

        return response()->json([
            'success' => true,
            'message' => 'Plat créé avec succès',
            'data' => new RestaurantMenuItemResource($item->load(['category', 'media'])),
        ], Response::HTTP_CREATED);
    }

    public function showItem(
        int|string|Restaurant $restaurant,
        int $itemId
    ): RestaurantMenuItemResource|JsonResponse {
        $restaurantId = $restaurant instanceof Restaurant ? $restaurant->id : (int) $restaurant;

        $item = RestaurantMenuItem::query()
            ->where('restaurant_id', $restaurantId)
            ->with(['category', 'media', 'restaurant'])
            ->find($itemId);

        if (!$item) {
            return response()->json(['success' => false, 'message' => 'Plat introuvable'], Response::HTTP_NOT_FOUND);
        }

        return new RestaurantMenuItemResource($item);
    }

    public function updateItem(
        RestaurantMenuItemRequest $request,
        int|string|Restaurant $restaurant,
        int $itemId
    ): JsonResponse {
        $restaurant = $this->resolveRestaurant($restaurant);
        $this->authorizeEstablishmentOwner($restaurant);
        $restaurantId = $restaurant->id;

        $item = RestaurantMenuItem::query()
            ->where('restaurant_id', $restaurantId)
            ->find($itemId);

        if (!$item) {
            return response()->json(['success' => false, 'message' => 'Plat introuvable'], Response::HTTP_NOT_FOUND);
        }

        $data = $request->validated();
        unset($data['images']);

        if (isset($data['category_id'])) {
            $category = RestaurantMenuCategory::where('restaurant_id', $restaurantId)
                ->where('id', $data['category_id'])
                ->first();
            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'La catégorie n\'appartient pas à ce restaurant',
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $item->update($data);
        $this->attachImages($item, $request->file('images', []));

        return response()->json([
            'success' => true,
            'message' => 'Plat mis à jour',
            'data' => new RestaurantMenuItemResource($item->fresh()->load(['category', 'media'])),
        ]);
    }

    public function destroyItem(
        int|string|Restaurant $restaurant,
        int $itemId
    ): JsonResponse {
        $restaurant = $this->resolveRestaurant($restaurant);
        $this->authorizeEstablishmentOwner($restaurant);
        $restaurantId = $restaurant->id;

        $item = RestaurantMenuItem::query()
            ->where('restaurant_id', $restaurantId)
            ->find($itemId);

        if (!$item) {
            return response()->json(['success' => false, 'message' => 'Plat introuvable'], Response::HTTP_NOT_FOUND);
        }

        $item->clearMediaCollection('images');
        $item->clearMediaCollection('gallery');
        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Plat supprimé',
        ]);
    }

    /**
     * @param  array<int, UploadedFile|null>|UploadedFile|null  $images
     */
    private function attachImages(RestaurantMenuItem $item, mixed $images): void
    {
        if (!$images) {
            return;
        }

        $files = is_array($images) ? $images : [$images];
        foreach (array_values($files) as $index => $image) {
            if (!$image instanceof UploadedFile) {
                continue;
            }
            $collection = $index === 0 ? 'images' : 'gallery';
            $item->addMedia($image)->toMediaCollection($collection);
        }
    }

    private function resolveRestaurant(int|string|Restaurant $restaurant): Restaurant
    {
        return $restaurant instanceof Restaurant
            ? $restaurant
            : Restaurant::findOrFail((int) $restaurant);
    }
}
