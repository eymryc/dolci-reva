<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RestaurantMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        foreach (['variants', 'options', 'nutritional_info', 'allergens', 'ingredients'] as $key) {
            $value = $this->input($key);
            if (is_string($value)) {
                $decoded = json_decode($value, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $this->merge([$key => $decoded]);
                }
            }
        }

        foreach (['is_available', 'is_active', 'is_vegetarian', 'is_vegan', 'is_gluten_free', 'is_halal'] as $boolKey) {
            if ($this->has($boolKey)) {
                $this->merge([
                    $boolKey => filter_var(
                        $this->input($boolKey),
                        FILTER_VALIDATE_BOOLEAN,
                        FILTER_NULL_ON_FAILURE
                    ) ?? (bool) $this->input($boolKey),
                ]);
            }
        }
    }

    public function rules(): array
    {
        return [
            'category_id' => 'required|integer|exists:restaurant_menu_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'price' => 'required|numeric|min:0.01',
            'currency' => 'nullable|string|max:8',
            'preparation_time' => 'nullable|integer|min:0',
            'spice_level' => 'nullable|integer|min:0|max:5',
            'is_available' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
            'is_vegetarian' => 'sometimes|boolean',
            'is_vegan' => 'sometimes|boolean',
            'is_gluten_free' => 'sometimes|boolean',
            'is_halal' => 'sometimes|boolean',
            'allergens' => 'nullable|array',
            'allergens.*' => 'string|max:100',
            'ingredients' => 'nullable|array',
            'ingredients.*' => 'string|max:255',
            'nutritional_info' => 'nullable|array',
            'variants' => 'nullable|array',
            'options' => 'nullable|array',
            'images' => 'nullable|array',
            'images.*' => \App\Support\ImageUploadRules::file(5120),
        ];
    }
}
