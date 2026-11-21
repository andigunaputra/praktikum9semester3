<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Barang extends Model
{
    protected $table = 'barang';

    const UPDATED_AT = null;

    protected $fillable = [
        'user_id', 'kategori_id', 'nama_barang', 'kondisi_barang',
        'deskripsi', 'status', 'lokasi', 'foto_barang',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function kategori(): BelongsTo
    {
        return $this->belongsTo(Kategori::class, 'kategori_id');
    }

    public function pengajuan(): HasMany
    {
        return $this->hasMany(Pengajuan::class);
    }

    /**
     * URL publik foto barang, atau null jika belum ada foto.
     * Foto baru disimpan di storage/app/public (diawali "donasi/"),
     * sedangkan foto lama berada di public/reshare/uploads/barang.
     */
    public function getFotoUrlAttribute(): ?string
    {
        if (! $this->foto_barang) {
            return null;
        }

        return Str::startsWith($this->foto_barang, 'donasi/')
            ? asset('storage/'.$this->foto_barang)
            : asset('reshare/uploads/barang/'.$this->foto_barang);
    }

    /**
     * Hapus berkas foto dari disk (storage maupun folder lama), dipanggil saat foto diganti atau data dihapus.
     */
    public function hapusFoto(): void
    {
        if (! $this->foto_barang) {
            return;
        }

        if (Storage::disk('public')->exists($this->foto_barang)) {
            Storage::disk('public')->delete($this->foto_barang);
        } elseif (file_exists(public_path('reshare/uploads/barang/'.$this->foto_barang))) {
            @unlink(public_path('reshare/uploads/barang/'.$this->foto_barang));
        }
    }
}
