<?php

namespace Database\Seeders;

use App\Models\BusinessType;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class BusinessTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'HÔTEL'],
            ['name' => 'RÉSIDENCE'],
            ['name' => 'HÉBERGEMENT'],
            ['name' => 'BAR'],
            ['name' => 'LOUNGE'],
            ['name' => 'NIGHT CLUB'],
            ['name' => 'RESTAURANT'],
            ['name' => 'ESPACE ÉVÈNEMENTIEL'],
            ['name' => 'ESPACE DE JEU'],
        ];

        foreach ($categories as $category) {
            BusinessType::updateOrCreate(['name' => $category['name']], $category);
        }
    }
}
