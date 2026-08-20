<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Response;

class NightClubAreaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'night_club_id' => 'required|integer|exists:night_clubs,id',
            'area_name' => 'required|string|max:255|min:2',
            'location' => 'nullable|string|max:100',
            'area_type' => 'required|in:dance_floor,vip_booth,bar_area,terrace,private_room,bottle_service',
            'capacity' => 'nullable|integer|min:1|max:5000',
            'is_active' => 'nullable|boolean',
            'reservation_required' => 'nullable|boolean',
            'minimum_spend' => 'nullable|numeric|min:0',
            'table_fee' => 'nullable|numeric|min:0',
            'feature_option_ids' => 'nullable|array|max:20',
            'feature_option_ids.*' => 'integer|exists:feature_options,id',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validation errors',
            'data' => $validator->errors(),
        ], Response::HTTP_UNPROCESSABLE_ENTITY));
    }
}
