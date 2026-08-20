<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\BusinessType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
                // Ancien compte démo + typo email (soft-deleted: forceDelete pour libérer phone unique)
        User::withTrashed()
            ->whereIn('email', ['paul@example.com', 'romaric757@gmail.com'])
            ->forceDelete();

        $users = [
            [
                'first_name'        => 'Wangny Eymard',
                'last_name'         => 'OUANGNI',
                'phone'             => '0612345678',
                'email'             => 'ouangni.tech@gmail.com',
                'password'          => Hash::make('password123'),
                'type'              => 'SUPER_ADMIN',
                'email_verified_at' => now(),
                'business_types'    => [],
            ],
            [
                'first_name'        => 'Romaric',
                'last_name'         => 'OUANGNI',
                'phone'             => '0698765432',
                'email'             => 'wangny.ouangni@gmail.com',
                'password'          => Hash::make('Bonjour@2022'),
                'type'              => 'CUSTOMER',
                'email_verified_at' => now(),
                'business_types'    => [],
            ],
            [
                'first_name'        => 'Romaric',
                'last_name'         => 'OUANGNI',
                'phone'             => '0757757001',
                'email'             => 'romaric747@gmail.com',
                'password'          => Hash::make('password123'),
                'type'              => 'OWNER',
                'email_verified_at' => now(),
                'business_types'    => [],
            ],
        ];

        foreach ($users as $userData) {
            $businessTypeNames = $userData['business_types'] ?? [];
            unset($userData['business_types']);

            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );

            if (!empty($businessTypeNames)) {
                $ids = BusinessType::whereIn('name', $businessTypeNames)->pluck('id')->toArray();
                if (!empty($ids)) {
                    $user->businessTypes()->sync($ids);
                }
            }
        }
    }
}
