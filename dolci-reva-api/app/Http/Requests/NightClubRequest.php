<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NightClubRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Normalize multipart / JSON payloads before validation.
     */
    protected function prepareForValidation(): void
    {
        $openingHours = $this->input('opening_hours');

        if (is_string($openingHours)) {
            $decoded = json_decode($openingHours, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                if (array_is_list($decoded)) {
                    $mapped = [];
                    foreach ($decoded as $row) {
                        if (!is_array($row) || empty($row['day'])) {
                            continue;
                        }
                        $mapped[$row['day']] = [
                            'open' => $row['open'] ?? null,
                            'close' => $row['close'] ?? null,
                        ];
                    }
                    $decoded = $mapped;
                }
                $openingHours = $decoded;
                $this->merge(['opening_hours' => $decoded]);
            }
        }

        if (is_array($openingHours)) {
            $normalized = [];
            foreach ($openingHours as $day => $hours) {
                if (!is_array($hours)) {
                    $normalized[$day] = $hours;
                    continue;
                }
                $normalized[$day] = [
                    'open' => $this->normalizeTime($hours['open'] ?? null),
                    'close' => $this->normalizeTime($hours['close'] ?? null),
                ];
            }
            $this->merge(['opening_hours' => $normalized]);
        }

        $age = $this->input('age_restriction');
        if ($age === '' || $age === null || $age === 'null' || $age === 'NaN') {
            // Night clubs require an age — default to 18 when omitted
            $this->merge(['age_restriction' => 18]);
        } else {
            $this->merge(['age_restriction' => (int) $age]);
        }

        $featureIds = $this->input('feature_option_ids');
        if ($featureIds === '' || $featureIds === null) {
            $this->merge(['feature_option_ids' => []]);
        } elseif (is_string($featureIds)) {
            $parts = array_values(array_filter(array_map('intval', explode(',', $featureIds))));
            $this->merge(['feature_option_ids' => $parts]);
        }

        foreach (['is_active', 'parking'] as $boolKey) {
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

        $areaFeatureOptions = $this->input('area_feature_options');
        if (is_string($areaFeatureOptions)) {
            $decoded = json_decode($areaFeatureOptions, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $this->merge(['area_feature_options' => $decoded]);
            }
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'required|string|min:10',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'opening_hours' => 'required|array',
            'opening_hours.monday' => 'nullable|array',
            'opening_hours.monday.open' => 'nullable|date_format:H:i',
            'opening_hours.monday.close' => 'nullable|date_format:H:i',
            'opening_hours.tuesday' => 'nullable|array',
            'opening_hours.tuesday.open' => 'nullable|date_format:H:i',
            'opening_hours.tuesday.close' => 'nullable|date_format:H:i',
            'opening_hours.wednesday' => 'nullable|array',
            'opening_hours.wednesday.open' => 'nullable|date_format:H:i',
            'opening_hours.wednesday.close' => 'nullable|date_format:H:i',
            'opening_hours.thursday' => 'nullable|array',
            'opening_hours.thursday.open' => 'nullable|date_format:H:i',
            'opening_hours.thursday.close' => 'nullable|date_format:H:i',
            'opening_hours.friday' => 'nullable|array',
            'opening_hours.friday.open' => 'nullable|date_format:H:i',
            'opening_hours.friday.close' => 'nullable|date_format:H:i',
            'opening_hours.saturday' => 'nullable|array',
            'opening_hours.saturday.open' => 'nullable|date_format:H:i',
            'opening_hours.saturday.close' => 'nullable|date_format:H:i',
            'opening_hours.sunday' => 'nullable|array',
            'opening_hours.sunday.open' => 'nullable|date_format:H:i',
            'opening_hours.sunday.close' => 'nullable|date_format:H:i',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'is_active' => 'boolean',

            // Champs spécifiques aux night clubs
            'age_restriction' => 'required|integer|in:18,21',
            'parking' => 'boolean',

            'images' => 'nullable|array',
            'images.*' => \App\Support\ImageUploadRules::file(5120),
            'feature_option_ids' => 'nullable|array',
            'feature_option_ids.*' => 'integer|exists:feature_options,id',
            'area_feature_options' => 'nullable|array',
            'area_feature_options.*.area_id' => 'required_with:area_feature_options|integer|exists:night_club_areas,id',
            'area_feature_options.*.feature_option_ids' => 'required_with:area_feature_options|array',
            'area_feature_options.*.feature_option_ids.*' => 'integer|exists:feature_options,id'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Le nom du night club est obligatoire.',
            'description.required' => 'La description du night club est obligatoire.',
            'description.min' => 'La description doit contenir au moins 10 caractères.',
            'address.required' => 'L\'adresse du night club est obligatoire.',
            'city.required' => 'La ville est obligatoire.',
            'country.required' => 'Le pays est obligatoire.',
            'opening_hours.required' => 'Les heures d\'ouverture sont obligatoires.',
            'opening_hours.array' => 'Les heures d\'ouverture doivent être un tableau.',
            'age_restriction.required' => 'La restriction d\'âge est obligatoire.',
            'age_restriction.integer' => 'La restriction d\'âge doit être un nombre entier.',
            'age_restriction.in' => 'La restriction d\'âge doit être 18 ou 21.',
            'latitude.numeric' => 'La latitude doit être un nombre.',
            'latitude.between' => 'La latitude doit être entre -90 et 90.',
            'longitude.numeric' => 'La longitude doit être un nombre.',
            'longitude.between' => 'La longitude doit être entre -180 et 180.',
            'images.array' => 'Les images doivent être un tableau.',
            ...\App\Support\ImageUploadRules::messages('images.*', 5),
            'feature_option_ids.array' => 'Les équipements doivent être un tableau.',
            'feature_option_ids.*.integer' => 'Chaque équipement doit être un identifiant valide.',
            'feature_option_ids.*.exists' => 'L\'équipement sélectionné n\'existe pas.'
        ];
    }

    private function normalizeTime(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (!is_string($value)) {
            return null;
        }

        if (preg_match('/^(\d{2}:\d{2})(?::\d{2})?$/', $value, $matches)) {
            return $matches[1];
        }

        return $value;
    }
}
