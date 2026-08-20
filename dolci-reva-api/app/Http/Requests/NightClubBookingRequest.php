<?php

namespace App\Http\Requests;

use App\Models\NightClub;
use App\Models\NightClubArea;
use App\Support\HospitalitySlot;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class NightClubBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('start_date')) {
            $normalized = HospitalitySlot::apply($this->all(), 'night_club');
            $this->merge(['end_date' => $normalized['end_date']]);
        }
    }

    public function rules(): array
    {
        return [
            'start_date' => 'required|date|after:now',
            'end_date' => 'required|date|after:start_date',
            'guests' => 'required|integer|min:1|max:25',
            'notes' => 'nullable|string|max:500',
            'night_club_area_ids' => 'nullable|array',
            'night_club_area_ids.*' => 'integer|exists:night_club_areas,id',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $nightClub = $this->route('nightClub');
            $nightClubId = $nightClub instanceof NightClub
                ? $nightClub->id
                : (int) $nightClub;

            if (!$nightClubId) {
                return;
            }

            $requiresReservation = NightClubArea::query()
                ->where('night_club_id', $nightClubId)
                ->where('is_active', true)
                ->where('reservation_required', true)
                ->exists();

            if (!$requiresReservation) {
                return;
            }

            $ids = $this->input('night_club_area_ids', []);
            if (!is_array($ids) || count($ids) < 1) {
                $validator->errors()->add(
                    'night_club_area_ids',
                    'Veuillez sélectionner au moins un salon / zone (réservation obligatoire).'
                );
            }
        });
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
            'guests.max' => 'Le nombre d\'invités ne peut pas dépasser 25.',
            'night_club_area_ids.array' => 'Les zones doivent être un tableau.',
            'night_club_area_ids.*.exists' => 'Une ou plusieurs zones sélectionnées n\'existent pas.',
        ];
    }
}
