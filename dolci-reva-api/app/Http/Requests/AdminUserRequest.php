<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AdminUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() === true;
    }

    public function rules(): array
    {
        $userId = $this->route('id');
        $required = $this->isMethod('post') ? 'required' : 'sometimes';

        return [
            'first_name' => [$required, 'string', 'max:255'],
            'last_name' => [$required, 'string', 'max:255'],
            'phone' => [$required, 'string', 'max:255', Rule::unique('users', 'phone')->whereNull('deleted_at')->ignore($userId)],
            'email' => [$required, 'email', 'max:255', Rule::unique('users', 'email')->whereNull('deleted_at')->ignore($userId)],
            'type' => [$required, Rule::in(['CUSTOMER', 'OWNER', 'ADMIN'])],
            'password' => [
                $this->isMethod('post') ? 'required' : 'sometimes',
                'string',
                'max:255',
                'confirmed',
                Password::defaults(),
            ],
            'services' => ['nullable', 'array'],
            'services.*' => ['integer', 'exists:business_types,id'],
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
