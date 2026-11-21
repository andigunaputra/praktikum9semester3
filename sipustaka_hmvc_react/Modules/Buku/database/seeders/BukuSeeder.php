<?php

namespace Modules\Buku\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Buku\Models\Buku;

class BukuSeeder extends Seeder
{
    /**
     * Isi data awal buku agar daftar, pencarian, dan pagination dapat langsung diuji.
     */
    public function run(): void
    {
        $daftar = [
            ['Laskar Pelangi', 'Andrea Hirata', 'Bentang Pustaka', 2005, 8],
            ['Bumi Manusia', 'Pramoedya Ananta Toer', 'Hasta Mitra', 1980, 5],
            ['Negeri 5 Menara', 'Ahmad Fuadi', 'Gramedia Pustaka Utama', 2009, 6],
            ['Pemrograman Web dengan Laravel', 'Budi Raharjo', 'Informatika', 2023, 10],
            ['Belajar React dari Nol', 'Rina Marlina', 'Andi Offset', 2024, 7],
            ['Basis Data: Konsep dan Perancangan', 'Fathansyah', 'Informatika', 2018, 4],
            ['Algoritma dan Pemrograman', 'Rinaldi Munir', 'Informatika', 2016, 9],
            ['Pengantar Teknologi Informasi', 'Abdul Kadir', 'Andi Offset', 2014, 3],
            ['Sistem Operasi Modern', 'Andrew S. Tanenbaum', 'Pearson', 2015, 2],
            ['Clean Code', 'Robert C. Martin', 'Prentice Hall', 2008, 5],
            ['Filosofi Teras', 'Henry Manampiring', 'Kompas', 2018, 6],
            ['Atomic Habits', 'James Clear', 'Gramedia Pustaka Utama', 2019, 12],
            ['Sapiens: Riwayat Singkat Umat Manusia', 'Yuval Noah Harari', 'Kepustakaan Populer Gramedia', 2017, 4],
            ['Cantik Itu Luka', 'Eka Kurniawan', 'Gramedia Pustaka Utama', 2002, 3],
            ['Dilan 1990', 'Pidi Baiq', 'Pastel Books', 2014, 7],
        ];

        foreach ($daftar as [$judul, $penulis, $penerbit, $tahun, $stok]) {
            Buku::create([
                'judul' => $judul,
                'penulis' => $penulis,
                'penerbit' => $penerbit,
                'tahun_terbit' => $tahun,
                'stok' => $stok,
            ]);
        }
    }
}
