<?php

namespace Modules\Peminjaman\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePeminjamanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'nama_peminjam' => ['required', 'string', 'max:255'],
            'judul_buku' => ['required', 'string', 'max:255'],
            'tanggal_pinjam' => ['required', 'date'],
            'tanggal_kembali' => ['nullable', 'date', 'after_or_equal:tanggal_pinjam'],
            'status' => ['required', 'string', 'in:Dipinjam,Dikembalikan'],
            'file_bukti' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama_peminjam.required' => 'Nama peminjam wajib diisi.',
            'judul_buku.required' => 'Judul buku wajib diisi.',
            'tanggal_pinjam.required' => 'Tanggal pinjam wajib diisi.',
            'tanggal_kembali.after_or_equal' => 'Tanggal kembali harus sama dengan atau setelah tanggal pinjam.',
            'status.required' => 'Status peminjaman wajib dipilih.',
            'status.in' => 'Status harus Dipinjam atau Dikembalikan.',
            'file_bukti.mimes' => 'File bukti harus berupa format JPG, PNG, atau PDF.',
            'file_bukti.max' => 'Ukuran file bukti maksimal 2 MB.',
        ];
    }
}
