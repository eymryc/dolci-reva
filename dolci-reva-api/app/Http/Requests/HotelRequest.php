<?php

namespace App\Http\Requests;

use Illuminate\Http\Response;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class HotelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'star_rating' => 'nullable|integer|between:1,5',
            'images' => 'sometimes|array|max:10',
            'images.*' => \App\Support\ImageUploadRules::file(5120),
            'feature_option_ids' => 'required|array|max:20',
            'feature_option_ids.*' => 'integer|exists:feature_options,id',
        ];

        return $rules;
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le nom de l\'hôtel est obligatoire.',
            'name.string' => 'Le nom de l\'hôtel doit être une chaîne de caractères.',
            'name.max' => 'Le nom de l\'hôtel ne peut pas dépasser 255 caractères.',
            'description.string' => 'La description de l\'hôtel doit être une chaîne de caractères.',
            'description.max' => 'La description de l\'hôtel ne peut pas dépasser 2000 caractères.',
            'address.string' => 'L\'adresse de l\'hôtel doit être une chaîne de caractères.',
            'address.max' => 'L\'adresse de l\'hôtel ne peut pas dépasser 500 caractères.',
            'city.string' => 'La ville doit être une chaîne de caractères.',
            'city.max' => 'La ville ne peut pas dépasser 100 caractères.',
            'country.string' => 'Le pays doit être une chaîne de caractères.',
            'country.max' => 'Le pays ne peut pas dépasser 100 caractères.',
            'latitude.numeric' => 'La latitude doit être un nombre.',
            'latitude.between' => 'La latitude doit être entre -90 et 90.',
            'longitude.numeric' => 'La longitude doit être un nombre.',
            'longitude.between' => 'La longitude doit être entre -180 et 180.',
            'star_rating.integer' => 'Le nombre d\'étoiles doit être un entier.',
            'star_rating.between' => 'Le nombre d\'étoiles doit être entre 1 et 5.',
            'images.array' => 'Les images doivent être un tableau.',
            'images.max' => 'Vous ne pouvez pas télécharger plus de 10 images.',
            ...\App\Support\ImageUploadRules::messages('images.*', 5),
            'feature_option_ids.required' => 'Au moins un équipement est obligatoire.',
            'feature_option_ids.array' => 'Les équipements doivent être un tableau.',
            'feature_option_ids.max' => 'Vous ne pouvez pas sélectionner plus de 20 équipements.',
            'feature_option_ids.*.integer' => 'L\'équipement doit être un entier.',
            'feature_option_ids.*.exists' => 'L\'équipement sélectionné n\'existe pas.',
        ];
    }

    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success'   => false,
            'message'   => 'Validation errors',
            'data'      => $validator->errors()
        ], Response::HTTP_UNPROCESSABLE_ENTITY));
    }
}
