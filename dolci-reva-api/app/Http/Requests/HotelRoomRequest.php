<?php

namespace App\Http\Requests;

use Illuminate\Http\Response;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class HotelRoomRequest extends FormRequest
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
            'hotel_id' => 'required|integer|exists:hotels,id',
            'name' => 'nullable|string|max:255|min:2',
            'description' => 'nullable|string|max:2000',
            'room_number' => 'nullable|string|max:50',
            'type' => 'required|in:SINGLE,DOUBLE,TWIN,TRIPLE,QUAD,FAMILY',
            'max_guests' => 'required|integer|min:1|max:20',
            'price' => 'required|numeric|min:0.01|max:99999.99',
            'standing' => 'required|in:STANDARD,SUPERIEUR,DELUXE,EXECUTIVE,SUITE,SUITE_JUNIOR,SUITE_EXECUTIVE,SUITE_PRESIDENTIELLE',
            'images' => 'sometimes|array|max:10',
            'images.*' => \App\Support\ImageUploadRules::file(5120),
            'feature_option_ids' => 'nullable|array|max:20',
            'feature_option_ids.*' => 'integer|exists:feature_options,id',
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
            'hotel_id.required' => 'L\'ID de l\'hôtel est obligatoire.',
            'hotel_id.exists' => 'L\'hôtel sélectionné n\'existe pas.',
            'name.min' => 'Le nom de la chambre doit contenir au moins 2 caractères.',
            'name.max' => 'Le nom de la chambre ne peut pas dépasser 255 caractères.',
            'description.max' => 'La description ne peut pas dépasser 2000 caractères.',
            'room_number.max' => 'Le numéro de chambre ne peut pas dépasser 50 caractères.',
            'type.required' => 'Le type de chambre est obligatoire.',
            'type.in' => 'Le type doit être : SINGLE, DOUBLE, TWIN, TRIPLE, QUAD ou FAMILY.',
            'max_guests.required' => 'Le nombre maximum d\'invités est obligatoire.',
            'max_guests.min' => 'Le nombre maximum d\'invités doit être d\'au moins 1.',
            'max_guests.max' => 'Le nombre maximum d\'invités ne peut pas dépasser 20.',
            'price.required' => 'Le prix est obligatoire.',
            'price.min' => 'Le prix doit être d\'au moins 0,01 €.',
            'price.max' => 'Le prix ne peut pas dépasser 99999,99 €.',
            'standing.required' => 'Le standing de la chambre est obligatoire.',
            'standing.in' => 'Le standing doit être : STANDARD, SUPERIEUR, DELUXE, EXECUTIVE, SUITE, SUITE_JUNIOR, SUITE_EXECUTIVE ou SUITE_PRESIDENTIELLE.',
            'images.max' => 'Vous ne pouvez pas télécharger plus de 10 images.',
            ...\App\Support\ImageUploadRules::messages('images.*', 5),
            'feature_option_ids.max' => 'Vous ne pouvez pas sélectionner plus de 20 équipements.',
            'feature_option_ids.*.exists' => 'L\'équipement sélectionné n\'existe pas.',
            'is_active.boolean' => 'Le statut actif doit être true ou false.',
        ];
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
