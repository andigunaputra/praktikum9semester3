<?php

namespace Modules\Peminjaman\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Peminjaman\Models\Peminjaman;

class PeminjamanDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $loans = [
            [
                'nama_peminjam' => 'Budi Santoso',
                'judul_buku' => 'Clean Code: A Handbook of Agile Software Craftsmanship',
                'tanggal_pinjam' => '2026-11-01',
                'tanggal_kembali' => '2026-11-08',
                'status' => 'Dikembalikan',
            ],
            [
                'nama_peminjam' => 'Siti Nurhaliza',
                'judul_buku' => 'Laravel Up & Running: A Framework for Building Modern PHP Apps',
                'tanggal_pinjam' => '2026-11-10',
                'tanggal_kembali' => null,
                'status' => 'Dipinjam',
            ],
        ];

        foreach ($loans as $l) {
            Peminjaman::firstOrCreate([
                'nama_peminjam' => $l['nama_peminjam'],
                'judul_buku' => $l['judul_buku']
            ], $l);
        }
    }
}
