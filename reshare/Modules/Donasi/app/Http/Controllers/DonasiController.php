<?php

namespace Modules\Donasi\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\Kategori;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Donasi\Http\Requests\StoreDonasiRequest;
use Modules\Donasi\Http\Requests\UpdateDonasiRequest;

class DonasiController extends Controller
{
    /**
     * Tampilkan halaman React. Data donasi dimuat melalui AJAX (getData).
     */
    public function index(): Response
    {
        return Inertia::render('Donasi::index', [
            'kategoris' => Kategori::orderBy('nama_kategori')->get(['id', 'nama_kategori']),
            'isAdmin' => auth()->user()->role === 'admin',
        ]);
    }

    /**
     * Kembalikan data donasi sebagai JSON.
     * Admin melihat semua data, user biasa hanya melihat donasi miliknya sendiri.
     */
    public function getData(Request $request): JsonResponse
    {
        $user = auth()->user();
        $isAdmin = $user->role === 'admin';

        $query = Barang::with(['kategori', 'user'])->latest();

        if (! $isAdmin) {
            $query->where('user_id', $user->id);
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->query('search'));
            $query->where(function ($q) use ($search) {
                $q->where('nama_barang', 'like', "%{$search}%")
                    ->orWhere('deskripsi', 'like', "%{$search}%")
                    ->orWhere('lokasi', 'like', "%{$search}%");
            });
        }

        if ($request->filled('kategori_id')) {
            $query->where('kategori_id', $request->query('kategori_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $items = $query->get()->map(fn (Barang $item) => $this->payload($item, $user->id, $isAdmin));

        return response()->json([
            'status' => 'success',
            'is_admin' => $isAdmin,
            'total' => $items->count(),
            'data' => $items,
        ]);
    }

    /**
     * Simpan donasi baru beserta foto (JSON).
     */
    public function store(StoreDonasiRequest $request): JsonResponse
    {
        $user = auth()->user();
        $validated = $request->validated();
        $validated['user_id'] = $user->id;

        // Hanya admin yang boleh menentukan status; donasi dari user selalu berstatus Tersedia
        $validated['status'] = $user->role === 'admin'
            ? ($validated['status'] ?? 'Tersedia')
            : 'Tersedia';

        if ($request->hasFile('foto_barang')) {
            $validated['foto_barang'] = $this->simpanFoto($request);
        } else {
            unset($validated['foto_barang']);
        }

        $barang = Barang::create($validated);
        $barang->load(['kategori', 'user']);

        return response()->json([
            'status' => 'success',
            'message' => 'Donasi barang berhasil ditambahkan.',
            'data' => $this->payload($barang, $user->id, $user->role === 'admin'),
        ], 201);
    }

    /**
     * Tampilkan detail satu donasi (JSON), juga dipakai untuk mengisi form edit.
     */
    public function show($id): JsonResponse
    {
        $barang = Barang::with(['kategori', 'user'])->findOrFail($id);
        $user = auth()->user();

        if ($user->role !== 'admin' && $barang->user_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak: Anda tidak memiliki izin untuk melihat donasi ini.',
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $this->payload($barang, $user->id, $user->role === 'admin'),
        ]);
    }

    /**
     * Perbarui donasi (JSON). Foto lama dihapus hanya jika foto baru diunggah.
     */
    public function update(UpdateDonasiRequest $request, $id): JsonResponse
    {
        $barang = Barang::findOrFail($id);
        $user = auth()->user();
        $isAdmin = $user->role === 'admin';

        if (! $isAdmin && $barang->user_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak: Anda tidak berhak mengubah donasi ini.',
            ], 403);
        }

        $validated = $request->validated();

        // User biasa tidak boleh mengubah status donasi
        if (! $isAdmin) {
            unset($validated['status']);
        }

        if ($request->hasFile('foto_barang')) {
            $barang->hapusFoto();
            $validated['foto_barang'] = $this->simpanFoto($request);
        } else {
            unset($validated['foto_barang']);
        }

        $barang->update($validated);
        $barang->load(['kategori', 'user']);

        return response()->json([
            'status' => 'success',
            'message' => 'Data donasi berhasil diperbarui.',
            'data' => $this->payload($barang, $user->id, $isAdmin),
        ]);
    }

    /**
     * Hapus donasi beserta fotonya dari storage (JSON).
     */
    public function destroy($id): JsonResponse
    {
        $barang = Barang::findOrFail($id);
        $user = auth()->user();

        if ($user->role !== 'admin' && $barang->user_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak: Anda tidak berhak menghapus donasi ini.',
            ], 403);
        }

        $barang->hapusFoto();
        $barang->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Data donasi berhasil dihapus.',
        ]);
    }

    /**
     * Simpan berkas foto ke storage/app/public/donasi lalu kembalikan path-nya.
     */
    private function simpanFoto(Request $request): string
    {
        $file = $request->file('foto_barang');
        $filename = time().'_'.preg_replace('/[^a-zA-Z0-9._-]/', '_', $file->getClientOriginalName());
        $file->storeAs('donasi', $filename, 'public');

        return 'donasi/'.$filename;
    }

    /**
     * Bentuk data donasi yang dikirim ke React.
     *
     * @return array<string, mixed>
     */
    private function payload(Barang $item, int $userId, bool $isAdmin): array
    {
        return [
            'id' => $item->id,
            'user_id' => $item->user_id,
            'nama_barang' => $item->nama_barang,
            'kategori_id' => $item->kategori_id,
            'kategori_nama' => $item->kategori->nama_kategori ?? '-',
            'kondisi_barang' => $item->kondisi_barang,
            'lokasi' => $item->lokasi,
            'deskripsi' => $item->deskripsi,
            'status' => $item->status,
            'foto_url' => $item->foto_url,
            'donatur_nama' => $item->user->nama ?? 'Anonim',
            'donatur_email' => $item->user->email ?? '-',
            'created_at' => $item->created_at?->format('d M Y, H:i') ?? '-',
            'can_manage' => $isAdmin || $item->user_id === $userId,
        ];
    }
}
