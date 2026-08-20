<?php

namespace App\Http\Requests;

use Illuminate\Http\Response;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class CancelBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cancellation_reason' => 'nullable|string|max:500',
            'settlement' => 'nullable|in:paystack,credit',
        ];
    }

    public function messages(): array
    {
        return [
            'cancellation_reason.max' => 'La raison d\'annulation ne peut pas dépasser 500 caractères.',
            'settlement.in' => 'Le mode de règlement doit être paystack ou credit.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if (!$this->filled('cancellation_reason')) {
            $this->merge([
                'cancellation_reason' => 'Annulation demandée par le client',
            ]);
        }
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
