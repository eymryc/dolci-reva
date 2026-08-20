<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DwellingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'description' => 'nullable|string|max:5000',
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'country' => 'nullable|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'phone' => 'required|string|max:30',
            'whatsapp' => 'nullable|string|max:30',
            'type' => 'required|in:STUDIO,APPARTEMENT,VILLA,MAISON,DUPLEX,TRIPLEX',
            'structure_type' => 'required|in:MAISON_BASSE,IMMEUBLE',
            'construction_type' => 'required|in:NOUVELLE_CONSTRUCTION,ANCIENNE',
            'rent' => 'required|numeric|min:0',
            'rent_advance_amount_number' => 'nullable|integer|min:0|max:12',
            'visite_price' => 'nullable|numeric|min:0',
            'security_deposit_month_number' => 'nullable|integer|min:0|max:12',
            'agency_fees_month_number' => 'nullable|integer|min:0|max:12',
            'piece_number' => 'nullable|integer|min:1',
            'rooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'living_room' => 'nullable|integer|min:0',
            'is_available' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'owner_id' => 'nullable|exists:users,id',
            'images' => 'nullable|array',
            'images.*' => \App\Support\ImageUploadRules::file(5120),
        ];

        return $rules;
    }

    public function messages(): array
    {
        return [
            'address.required' => 'L\'adresse est obligatoire.',
            'city.required' => 'La ville est obligatoire.',
            'phone.required' => 'Le téléphone est obligatoire.',
            'type.required' => 'Le type de bien est obligatoire.',
            'type.in' => 'Le type de bien sélectionné n\'est pas valide.',
            'structure_type.required' => 'Le type de structure est obligatoire.',
            'structure_type.in' => 'Le type de structure sélectionné n\'est pas valide.',
            'construction_type.required' => 'Le type de construction est obligatoire.',
            'construction_type.in' => 'Le type de construction sélectionné n\'est pas valide.',
            'rent.required' => 'Le loyer est obligatoire.',
            'rent.numeric' => 'Le loyer doit être un nombre.',
        ];
    }
}
