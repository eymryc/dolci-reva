<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoungeProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        foreach (['variants', 'options'] as $key) {
            $value = $this->input($key);
            if (is_string($value)) {
                $decoded = json_decode($value, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $this->merge([$key => $decoded]);
                }
            }
        }

        if ($this->has('is_available')) {
            $this->merge([
                'is_available' => filter_var($this->input('is_available'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? (bool) $this->input('is_available'),
            ]);
        }

        if ($this->has('is_active')) {
            $this->merge([
                'is_active' => filter_var($this->input('is_active'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? (bool) $this->input('is_active'),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'category_id' => 'required|integer|exists:lounge_product_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'price' => 'required|numeric|min:0',
            'currency' => 'nullable|string|max:8',
            'is_available' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
            'variants' => 'nullable|array',
            'options' => 'nullable|array',
            'images' => 'nullable|array',
            'images.*' => \App\Support\ImageUploadRules::file(5120),
        ];
    }
}
