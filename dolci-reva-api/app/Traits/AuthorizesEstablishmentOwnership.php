<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpKernel\Exception\HttpException;

trait AuthorizesEstablishmentOwnership
{
    /**
     * Seuls propriétaire et admin peuvent créer/gérer des établissements.
     */
    protected function authorizeCanManageEstablishments(): void
    {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();

        if (!$user) {
            throw new HttpException(401, 'Non authentifié.');
        }

        if (!$user->canManageEstablishments()) {
            throw new HttpException(403, 'Seuls les propriétaires et administrateurs peuvent gérer des établissements.');
        }
    }

    protected function authorizeEstablishmentOwner(Model $model, string $ownerColumn = 'owner_id'): void
    {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();

        if (!$user) {
            throw new HttpException(401, 'Non authentifié.');
        }

        if ($user->isAdmin()) {
            return;
        }

        if (!$user->isOwner()) {
            throw new HttpException(403, 'Vous n\'êtes pas autorisé à modifier cet établissement.');
        }

        $ownerId = (int) ($model->{$ownerColumn} ?? 0);

        if ($ownerId !== (int) $user->id) {
            throw new HttpException(403, 'Vous n\'êtes pas autorisé à modifier cet établissement.');
        }
    }

    /**
     * Force owner_id for non-admins on create/update payloads.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function forceOwnerId(array $data): array
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user->isAdmin()) {
            $data['owner_id'] = $user->id;
        }

        return $data;
    }

    /**
     * Scope les listes privées : admin = tout (filtre owner_id optionnel), owner = soi, sinon 403.
     */
    protected function resolvePrivateListOwnerId(?Request $request = null): ?int
    {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();

        if (!$user) {
            throw new HttpException(401, 'Non authentifié.');
        }

        if ($user->isAdmin()) {
            $ownerId = $request?->input('owner_id');

            return $ownerId !== null && $ownerId !== '' ? (int) $ownerId : null;
        }

        if ($user->isOwner()) {
            return (int) $user->id;
        }

        throw new HttpException(403, 'Accès réservé aux propriétaires et administrateurs.');
    }
}
