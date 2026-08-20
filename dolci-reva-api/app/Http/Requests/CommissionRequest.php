<?php

namespace App\Http\Requests;

use App\Models\Commission;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class CommissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [];

        // Règles pour la création (store)
        if ($this->isMethod('post')) {
            $rules = [
                'commission' => 'required|numeric|min:0|max:100',
                'bookable_type' => ['nullable', Rule::in(Commission::BOOKABLE_TYPES)],
                'is_active' => 'required|boolean',
            ];
        }
        // Règles pour la mise à jour (update)
        else {
            $rules = [
                'commission' => 'sometimes|required|numeric|min:0|max:100',
                'bookable_type' => ['sometimes', 'nullable', Rule::in(Commission::BOOKABLE_TYPES)],
                'is_active' => 'sometimes|required|boolean',
            ];
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'commission.required' => 'Le pourcentage de commission est obligatoire.',
            'commission.numeric' => 'Le pourcentage de commission doit être un nombre.',
            'commission.min' => 'Le pourcentage de commission ne peut pas être négatif.',
            'commission.max' => 'Le pourcentage de commission ne peut pas dépasser 100%.',
            'bookable_type.in' => 'La verticale sélectionnée est invalide.',
            'is_active.boolean' => 'Le statut actif doit être vrai ou faux.',
        ];
    }


    /**
     * Handle a failed validation attempt.
     * @param \Illuminate\Contracts\Validation\Validator $validator
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
