<?php

namespace App\Http\Requests;

use Illuminate\Http\Response;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name'        => 'required|string|max:255',
            'last_name'         => 'required|string|max:255',
            'phone'             => [
                'required',
                'string',
                'max:255',
                Rule::unique('users', 'phone')->whereNull('deleted_at'),
            ],
            'email'             => [
                'required',
                'string',
                'max:255',
                Rule::unique('users', 'email')->whereNull('deleted_at'),
            ],
            'type'              => 'required|in:CUSTOMER,OWNER',
            'password'          => ['required', 'string', 'max:255', 'confirmed', Password::defaults()],
            'services'          => 'nullable|array',
            'services.*'        => 'integer|exists:business_types,id',
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'Le prénom est obligatoire.',
            'first_name.max' => 'Le prénom ne peut pas dépasser 255 caractères.',
            'last_name.required' => 'Le nom est obligatoire.',
            'last_name.max' => 'Le nom ne peut pas dépasser 255 caractères.',
            'phone.required' => 'Le numéro de téléphone est obligatoire.',
            'phone.unique' => 'Ce numéro de téléphone est déjà utilisé.',
            'phone.max' => 'Le numéro de téléphone ne peut pas dépasser 255 caractères.',
            'email.required' => 'L\'adresse email est obligatoire.',
            'email.unique' => 'Cette adresse email est déjà utilisée.',
            'email.max' => 'L\'adresse email ne peut pas dépasser 255 caractères.',
            'type.required' => 'Le type d\'utilisateur est obligatoire.',
            'type.in' => 'Le type d\'utilisateur doit être CUSTOMER ou OWNER.',
            'password.required' => 'Le mot de passe est obligatoire.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
            'password.max' => 'Le mot de passe ne peut pas dépasser 255 caractères.',
            'services.array' => 'Les services doivent être fournis sous forme de tableau.',
            'services.*.integer' => 'Chaque service doit être un identifiant valide.',
            'services.*.exists' => 'Un ou plusieurs services sélectionnés n\'existent pas.',
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
