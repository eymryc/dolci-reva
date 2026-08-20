<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoungeProductCategoryRequest;
use App\Http\Requests\LoungeProductRequest;
use App\Http\Resources\LoungeProductCategoryResource;
use App\Http\Resources\LoungeProductResource;
use App\Models\Lounge;
use App\Models\LoungeProduct;
use App\Models\LoungeProductCategory;
use App\Traits\AuthorizesEstablishmentOwnership;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\UploadedFile;
use Symfony\Component\HttpFoundation\Response;

class LoungeProductController extends Controller
{
    use AuthorizesEstablishmentOwnership;

    public function categories(int|string|Lounge $lounge): AnonymousResourceCollection
    {
        $loungeId = $lounge instanceof Lounge ? $lounge->id : (int) $lounge;

        $categories = LoungeProductCategory::query()
            ->where('lounge_id', $loungeId)
            ->withCount('products')
            ->latest()
            ->get();

        return LoungeProductCategoryResource::collection($categories);
    }

    public function storeCategory(
        LoungeProductCategoryRequest $request,
        int|string|Lounge $lounge
    ): JsonResponse {
        $lounge = $this->resolveLounge($lounge);
        $this->authorizeEstablishmentOwner($lounge);
        $loungeId = $lounge->id;

        $category = LoungeProductCategory::create([
            ...$request->validated(),
            'lounge_id' => $loungeId,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Catégorie créée avec succès',
            'data' => new LoungeProductCategoryResource($category->loadCount('products')),
        ], Response::HTTP_CREATED);
    }

    public function showCategory(int $categoryId): LoungeProductCategoryResource|JsonResponse
    {
        $category = LoungeProductCategory::withCount('products')->find($categoryId);
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Catégorie introuvable'], Response::HTTP_NOT_FOUND);
        }

        return new LoungeProductCategoryResource($category);
    }

    public function updateCategory(
        LoungeProductCategoryRequest $request,
        int $categoryId
    ): JsonResponse {
        $category = LoungeProductCategory::find($categoryId);
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Catégorie introuvable'], Response::HTTP_NOT_FOUND);
        }

        $this->authorizeEstablishmentOwner($category->lounge);
        $category->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Catégorie mise à jour',
            'data' => new LoungeProductCategoryResource($category->fresh()->loadCount('products')),
        ]);
    }

    public function destroyCategory(int $categoryId): JsonResponse
    {
        $category = LoungeProductCategory::find($categoryId);
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Catégorie introuvable'], Response::HTTP_NOT_FOUND);
        }

        $this->authorizeEstablishmentOwner($category->lounge);
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Catégorie supprimée',
        ]);
    }

    public function products(Request $request, int|string|Lounge $lounge): AnonymousResourceCollection
    {
        $loungeId = $lounge instanceof Lounge ? $lounge->id : (int) $lounge;

        $query = LoungeProduct::query()
            ->where('lounge_id', $loungeId)
            ->with(['category', 'media'])
            ->latest();

        if ($request->filled('category_id')) {
            $query->where('category_id', (int) $request->input('category_id'));
        }

        return LoungeProductResource::collection($query->get());
    }

    public function storeProduct(
        LoungeProductRequest $request,
        int|string|Lounge $lounge
    ): JsonResponse {
        $lounge = $this->resolveLounge($lounge);
        $this->authorizeEstablishmentOwner($lounge);
        $loungeId = $lounge->id;
        $data = $request->validated();
        unset($data['images']);

        $category = LoungeProductCategory::where('lounge_id', $loungeId)
            ->where('id', $data['category_id'])
            ->first();

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'La catégorie n\'appartient pas à ce lounge',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $product = LoungeProduct::create([
            ...$data,
            'lounge_id' => $loungeId,
            'currency' => $data['currency'] ?? 'XOF',
            'is_available' => $data['is_available'] ?? true,
            'is_active' => $data['is_active'] ?? true,
        ]);

        $this->attachImages($product, $request->file('images', []));

        return response()->json([
            'success' => true,
            'message' => 'Produit créé avec succès',
            'data' => new LoungeProductResource($product->load(['category', 'media'])),
        ], Response::HTTP_CREATED);
    }

    public function showProduct(int $productId): LoungeProductResource|JsonResponse
    {
        $product = LoungeProduct::with(['category', 'media', 'lounge'])->find($productId);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Produit introuvable'], Response::HTTP_NOT_FOUND);
        }

        return new LoungeProductResource($product);
    }

    public function updateProduct(LoungeProductRequest $request, int $productId): JsonResponse
    {
        $product = LoungeProduct::find($productId);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Produit introuvable'], Response::HTTP_NOT_FOUND);
        }

        $this->authorizeEstablishmentOwner($product->lounge);
        $data = $request->validated();
        unset($data['images']);

        if (isset($data['category_id'])) {
            $category = LoungeProductCategory::where('lounge_id', $product->lounge_id)
                ->where('id', $data['category_id'])
                ->first();
            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'La catégorie n\'appartient pas à ce lounge',
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $product->update($data);
        $this->attachImages($product, $request->file('images', []));

        return response()->json([
            'success' => true,
            'message' => 'Produit mis à jour',
            'data' => new LoungeProductResource($product->fresh()->load(['category', 'media'])),
        ]);
    }

    public function destroyProduct(int $productId): JsonResponse
    {
        $product = LoungeProduct::find($productId);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Produit introuvable'], Response::HTTP_NOT_FOUND);
        }

        $this->authorizeEstablishmentOwner($product->lounge);
        $product->clearMediaCollection('images');
        $product->clearMediaCollection('gallery');
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produit supprimé',
        ]);
    }

    /**
     * @param  array<int, UploadedFile|null>|UploadedFile|null  $images
     */
    private function attachImages(LoungeProduct $product, mixed $images): void
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
            $product->addMedia($image)->toMediaCollection($collection);
        }
    }

    private function resolveLounge(int|string|Lounge $lounge): Lounge
    {
        return $lounge instanceof Lounge
            ? $lounge
            : Lounge::findOrFail((int) $lounge);
    }
}
