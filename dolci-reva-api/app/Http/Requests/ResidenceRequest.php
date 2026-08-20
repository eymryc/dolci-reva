<?php

namespace App\Http\Requests;

use App\Support\ImageUploadRules;
use Illuminate\Http\Response;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class ResidenceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|min:2',
            'description' => 'nullable|string|max:2000',
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'type' => 'required|in:STUDIO,APPARTEMENT,VILLA,PENTHOUSE,DUPLEX,TRIPLEX',
            'max_guests' => 'required|integer|min:1|max:20',
            'bedrooms' => 'nullable|integer|min:0|max:20',
            'bathrooms' => 'nullable|integer|min:0|max:20',
            'piece_number' => 'nullable|integer|min:1',
            'price' => 'required|numeric|min:0.01|max:99999.99',
            'standing' => 'required|in:STANDARD,SUPERIEUR,DELUXE,EXECUTIVE,SUITE,SUITE_JUNIOR,SUITE_EXECUTIVE,SUITE_PRESIDENTIELLE',
            'images' => 'sometimes|array|max:10',
            'images.*' => ImageUploadRules::file(5120),
            'feature_option_ids' => 'required|array|max:20',
            'feature_option_ids.*' => 'integer|exists:feature_options,id',
            'is_available' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ];
    }

    /**
     * Get custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Le nom de la résidence est obligatoire.',
            'name.min' => 'Le nom de la résidence doit contenir au moins 2 caractères.',
            'name.max' => 'Le nom de la résidence ne peut pas dépasser 255 caractères.',
            'description.max' => 'La description ne peut pas dépasser 2000 caractères.',
            'address.required' => 'L\'adresse est obligatoire.',
            'address.max' => 'L\'adresse ne peut pas dépasser 500 caractères.',
            'city.required' => 'La ville est obligatoire.',
            'city.max' => 'La ville ne peut pas dépasser 100 caractères.',
            'country.required' => 'Le pays est obligatoire.',
            'country.max' => 'Le pays ne peut pas dépasser 100 caractères.',
            'latitude.numeric' => 'La latitude doit être un nombre.',
            'latitude.between' => 'La latitude doit être entre -90 et 90.',
            'longitude.numeric' => 'La longitude doit être un nombre.',
            'longitude.between' => 'La longitude doit être entre -180 et 180.',
            'type.required' => 'Le type de résidence est obligatoire.',
            'type.in' => 'Le type doit être : STUDIO, APPARTEMENT, VILLA, PENTHOUSE, DUPLEX ou TRIPLEX.',
            'max_guests.required' => 'Le nombre maximum d\'invités est obligatoire.',
            'max_guests.min' => 'Le nombre maximum d\'invités doit être d\'au moins 1.',
            'max_guests.max' => 'Le nombre maximum d\'invités ne peut pas dépasser 20.',
            'bedrooms.min' => 'Le nombre de chambres ne peut pas être négatif.',
            'bedrooms.max' => 'Le nombre de chambres ne peut pas dépasser 20.',
            'bathrooms.min' => 'Le nombre de salles de bain ne peut pas être négatif.',
            'bathrooms.max' => 'Le nombre de salles de bain ne peut pas dépasser 20.',
            'piece_number.min' => 'Le nombre de pièces doit être d\'au moins 1.',
            'price.required' => 'Le prix est obligatoire.',
            'price.min' => 'Le prix doit être d\'au moins 0,01 €.',
            'price.max' => 'Le prix ne peut pas dépasser 99999,99 €.',
            'standing.required' => 'Le standing de la résidence est obligatoire.',
            'standing.in' => 'Le standing doit être : STANDARD, SUPERIEUR, DELUXE, EXECUTIVE, SUITE, SUITE_JUNIOR, SUITE_EXECUTIVE ou SUITE_PRESIDENTIELLE.',
            'images.required' => 'Au moins une image est obligatoire.',
            'images.max' => 'Vous ne pouvez pas télécharger plus de 10 images.',
            ...ImageUploadRules::messages('images.*', 5),
            'feature_option_ids.required' => 'Au moins un équipement est obligatoire.',
            'feature_option_ids.max' => 'Vous ne pouvez pas sélectionner plus de 20 équipements.',
            'feature_option_ids.*.exists' => 'L\'équipement sélectionné n\'existe pas.',
            'is_available.boolean' => 'La disponibilité doit être true ou false.',
            'is_active.boolean' => 'Le statut actif doit être true ou false.',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param Validator $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->sometimes('images', 'required|array|max:10', function ($input) {
            return $this->isMethod('POST'); // Obligatoire seulement lors de la création
        });
    }

    /**
     * Handle a failed validation attempt.
     * @param Validator $validator
     * @throws HttpResponseException
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success'   => false,
            'message'   => 'Validation errors',
            'data'      => $validator->errors()
        ], Response::HTTP_UNPROCESSABLE_ENTITY));
    }
}
