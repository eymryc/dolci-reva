<?php

namespace App\Http\Requests;

use App\Support\HospitalitySlot;
use Illuminate\Foundation\Http\FormRequest;

class RestaurantBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('start_date')) {
            $normalized = HospitalitySlot::apply($this->all(), 'restaurant');
            $this->merge(['end_date' => $normalized['end_date']]);
        }
    }

    public function rules(): array
    {
        return [
            'start_date' => 'required|date|after:now',
            'end_date' => 'required|date|after:start_date',
            'guests' => 'required|integer|min:1|max:20',
            'notes' => 'nullable|string|max:500',
            'restaurant_table_ids' => 'required|array|min:1',
            'restaurant_table_ids.*' => 'integer|exists:restaurant_tables,id',
        ];
    }

    public function messages(): array
    {
        return [
            'start_date.required' => 'La date de début est requise.',
            'start_date.after' => 'La date de début doit être dans le futur.',
            'end_date.required' => 'La date de fin est requise.',
            'end_date.after' => 'La date de fin doit être après la date de début.',
            'guests.required' => 'Le nombre d\'invités est requis.',
            'guests.min' => 'Le nombre d\'invités doit être d\'au moins 1.',
            'guests.max' => 'Le nombre d\'invités ne peut pas dépasser 20.',
            'restaurant_table_ids.required' => 'Veuillez sélectionner au moins une table.',
            'restaurant_table_ids.min' => 'Veuillez sélectionner au moins une table.',
            'restaurant_table_ids.array' => 'Les tables doivent être un tableau.',
            'restaurant_table_ids.*.exists' => 'Une ou plusieurs tables sélectionnées n\'existent pas.',
        ];
    }
}
