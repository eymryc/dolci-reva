<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Symfony\Component\HttpFoundation\Response;

class PayoutAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'channel' => 'required|string|in:wave,orange_money,mtn,moov,bank',
            'account_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:64',
            'bank_code' => 'nullable|string|max:32',
            'bank_name' => 'nullable|string|max:255',
            'currency' => 'nullable|string|size:3',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validation errors',
            'data' => $validator->errors(),
        ], Response::HTTP_UNPROCESSABLE_ENTITY));
    }
}
