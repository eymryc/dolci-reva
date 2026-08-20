<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Response;

class LoungeTableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'lounge_id' => 'required|integer|exists:lounges,id',
            'table_number' => 'required|string|max:50',
            'capacity' => 'required|integer|min:1|max:100',
            'location' => 'nullable|string|max:100',
            'table_type' => 'required|in:sofa,high_table,low_table,bar_counter,private_booth,outdoor',
            'is_active' => 'nullable|boolean',
            'minimum_spend' => 'nullable|numeric|min:0',
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
