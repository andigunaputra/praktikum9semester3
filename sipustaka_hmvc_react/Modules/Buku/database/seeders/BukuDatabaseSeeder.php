<?php

namespace Modules\Buku\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Buku\Models\Buku;

class BukuDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $books = [
            [
                'judul' => 'Clean Code: A Handbook of Agile Software Craftsmanship',
                'penulis' => 'Robert C. Martin',
                'penerbit' => 'Prentice Hall',
                'tahun_terbit' => 2008,
                'stok' => 5,
            ],
            [
                'judul' => 'Laravel Up & Running: A Framework for Building Modern PHP Apps',
                'penulis' => 'Matt Stauffer',
                'penerbit' => "O'Reilly Media",
                'tahun_terbit' => 2019,
                'stok' => 7,
            ],
            [
                'judul' => 'Refactoring: Improving the Design of Existing Code',
                'penulis' => 'Martin Fowler',
                'penerbit' => 'Addison-Wesley',
                'tahun_terbit' => 2018,
                'stok' => 3,
            ],
            [
                'judul' => 'Designing Data-Intensive Applications',
                'penulis' => 'Martin Kleppmann',
                'penerbit' => "O'Reilly Media",
                'tahun_terbit' => 2017,
                'stok' => 4,
            ],
            [
                'judul' => 'Full-Stack React, TypeScript, and Node',
                'penulis' => 'David Choi',
                'penerbit' => 'Packt Publishing',
                'tahun_terbit' => 2022,
                'stok' => 6,
            ],
        ];

        foreach ($books as $b) {
            Buku::firstOrCreate(['judul' => $b['judul']], $b);
        }
    }
}
