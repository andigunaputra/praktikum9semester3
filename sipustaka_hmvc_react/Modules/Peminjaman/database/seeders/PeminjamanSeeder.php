<?php

namespace Modules\Peminjaman\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Peminjaman\Models\Peminjaman;

class PeminjamanSeeder extends Seeder
{
    /**
     * Data awal peminjaman (tanpa berkas; berkas diunggah lewat aplikasi).
     */
    public function run(): void
    {
        $daftar = [
            ['Ahmad Fauzi', 'Laskar Pelangi', '2026-11-03', '2026-11-10', 'Dikembalikan'],
            ['Siti Nurhaliza', 'Bumi Manusia', '2026-11-05', '2026-11-12', 'Dikembalikan'],
            ['Budi Santoso', 'Pemrograman Web dengan Laravel', '2026-11-10', '2026-11-17', 'Dipinjam'],
            ['Rina Marlina', 'Belajar React dari Nol', '2026-11-12', '2026-11-19', 'Dipinjam'],
            ['Dewi Anggraini', 'Atomic Habits', '2026-11-15', '2026-11-22', 'Dipinjam'],
        ];

        foreach ($daftar as [$nama, $judul, $pinjam, $kembali, $status]) {
            Peminjaman::create([
                'nama_peminjam' => $nama,
                'judul_buku' => $judul,
                'tanggal_pinjam' => $pinjam,
                'tanggal_kembali' => $kembali,
                'status' => $status,
            ]);
        }
    }
}
