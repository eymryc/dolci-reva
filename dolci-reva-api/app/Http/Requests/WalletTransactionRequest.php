<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WalletTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'wallet_id' => 'integer',
            'type' => 'in:CREDIT,DEBIT',
            'amount' => 'numeric',
            'reason' => 'string|max:255',
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
