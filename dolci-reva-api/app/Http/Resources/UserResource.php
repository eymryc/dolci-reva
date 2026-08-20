<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use App\Http\Resources\BusinessTypeResource;
use App\Http\Resources\WalletResource;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $identityVerification = null;
        if ($this->relationLoaded('ownerVerifications')) {
            $identityVerification = $this->ownerVerifications
                ->where('document_type', 'IDENTITY')
                ->sortByDesc('created_at')
                ->first();
        }

        return [
            'id'                  => $this->id,
            'first_name'          => $this->first_name,
            'last_name'           => $this->last_name,
            'phone'               => $this->phone,
            'email'               => $this->email,
            'type'                => $this->type,
            'email_verified_at'   => $this->email_verified_at,
            'email_verified'      => $this->hasVerifiedEmail(),
            'is_verified'         => $this->hasVerifiedEmail()
                && $identityVerification
                && $identityVerification->status === 'APPROVED',
            'verification_status' => $identityVerification?->status,
            'businessTypes'       => BusinessTypeResource::collection($this->whenLoaded('businessTypes')),
            'wallet'              => $this->when(
                $this->relationLoaded('wallet'),
                fn () => $this->wallet ? new WalletResource($this->wallet) : null
            ),
            'verifications'       => $this->whenLoaded('ownerVerifications', function () {
                return $this->ownerVerifications->map(function ($verification) {
                    $media = $verification->getFirstMedia('document');

                    return [
                        'id'                     => $verification->id,
                        'user_id'                => $verification->user_id,
                        'document_type'          => $verification->document_type,
                        'identity_document_type' => $verification->identity_document_type,
                        'document_number'        => $verification->document_number,
                        'document_issue_date'    => $verification->document_issue_date,
                        'document_expiry_date'   => $verification->document_expiry_date,
                        'issuing_authority'      => $verification->issuing_authority,
                        'status'                 => $verification->status,
                        'rejection_reason'       => $verification->rejection_reason,
                        'reviewed_by'            => $verification->reviewed_by,
                        'reviewed_at'            => $verification->reviewed_at,
                        'notes'                  => $verification->notes,
                        'created_at'             => $verification->created_at,
                        'updated_at'             => $verification->updated_at,
                        'document_file'          => $media ? [
                            'id'              => $media->id,
                            'name'            => $media->name,
                            'file_name'       => $media->file_name,
                            'mime_type'       => $media->mime_type,
                            'size'            => $media->size,
                            'collection_name' => $media->collection_name,
                            'url'             => $media->getUrl(),
                            'created_at'      => $media->created_at,
                        ] : null,
                    ];
                })->values();
            }),
            'created_at'          => $this->created_at,
            'updated_at'          => $this->updated_at,
            'deleted_at'          => $this->deleted_at,
        ];
    }
}
