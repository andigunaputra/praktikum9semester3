<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Modules\Buku\Database\Seeders\BukuSeeder;
use Modules\Peminjaman\Database\Seeders\PeminjamanSeeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->admin()->create([
            'name' => 'Petugas Perpustakaan',
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        User::factory()->create([
            'name' => 'Anggota Perpustakaan',
            'email' => 'user@example.com',
            'password' => 'password',
        ]);

        $this->call([
            BukuSeeder::class,
            PeminjamanSeeder::class,
        ]);
    }
}
