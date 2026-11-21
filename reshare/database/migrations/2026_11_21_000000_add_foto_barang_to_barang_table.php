<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Kolom foto_barang menyimpan path berkas di storage/app/public (misalnya donasi/1790000000_foto.jpg).
     * Pengecekan hasColumn membuat migration aman dijalankan pada database yang kolomnya sudah ada.
     */
    public function up(): void
    {
        Schema::table('barang', function (Blueprint $table) {
            if (! Schema::hasColumn('barang', 'foto_barang')) {
                $table->string('foto_barang')->nullable()->after('lokasi');
            }
        });
    }

    public function down(): void
    {
        Schema::table('barang', function (Blueprint $table) {
            if (Schema::hasColumn('barang', 'foto_barang')) {
                $table->dropColumn('foto_barang');
            }
        });
    }
};
