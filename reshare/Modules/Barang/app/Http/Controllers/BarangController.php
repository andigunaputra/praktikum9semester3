<?php

namespace Modules\Barang\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\Kategori;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Barang\Http\Requests\StoreBarangRequest;
use Modules\Barang\Http\Requests\UpdateBarangRequest;

class BarangController extends Controller
{
    /**
     * Tampilkan daftar barang (halaman React) dengan pencarian, filter, dan pagination.
     */
    public function index(Request $request): Response
    {
        $query = Barang::with(['kategori', 'user'])->latest();

        // Fitur pencarian
        if ($request->filled('search')) {
            $search = trim((string) $request->query('search'));
            $query->where(function ($q) use ($search) {
                $q->where('nama_barang', 'like', "%{$search}%")
                    ->orWhere('deskripsi', 'like', "%{$search}%")
                    ->orWhere('lokasi', 'like', "%{$search}%");
            });
        }

        // Filter kategori dan status
        if ($request->filled('kategori_id')) {
            $query->where('kategori_id', $request->query('kategori_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        // through() mengubah setiap barang menjadi array berisi kolom yang dibutuhkan halaman saja
        $barangs = $query->paginate(8)
            ->withQueryString()
            ->through(fn (Barang $barang) => $this->payload($barang));

        return Inertia::render('Barang::index', [
            'barangs' => $barangs,
            'kategoris' => $this->kategoriOptions(),
            'filters' => [
                'search' => (string) $request->query('search', ''),
                'kategori_id' => (string) $request->query('kategori_id', ''),
                'status' => (string) $request->query('status', ''),
            ],
        ]);
    }

    /**
     * Tampilkan form tambah barang baru.
     */
    public function create(): Response
    {
        return Inertia::render('Barang::create', [
            'kategoris' => $this->kategoriOptions(),
        ]);
    }

    /**
     * Simpan data barang baru beserta fotonya.
     */
    public function store(StoreBarangRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['user_id'] = auth()->id();

        if ($request->hasFile('foto_barang')) {
            $validated['foto_barang'] = $this->simpanFoto($request);
        }

        Barang::create($validated);

        return redirect()->route('admin.barang.index')
            ->with('success', 'Data barang donasi berhasil ditambahkan!');
    }

    /**
     * Tampilkan detail barang donasi.
     */
    public function show($id): Response
    {
        $barang = Barang::with(['kategori', 'user'])->findOrFail($id);

        return Inertia::render('Barang::show', [
            'barang' => $this->payload($barang),
        ]);
    }

    /**
     * Tampilkan form edit barang.
     */
    public function edit($id): Response
    {
        $barang = Barang::with(['kategori', 'user'])->findOrFail($id);

        return Inertia::render('Barang::edit', [
            'barang' => $this->payload($barang),
            'kategoris' => $this->kategoriOptions(),
        ]);
    }

    /**
     * Perbarui data barang. Foto lama dihapus hanya jika foto baru diunggah.
     */
    public function update(UpdateBarangRequest $request, $id): RedirectResponse
    {
        $barang = Barang::findOrFail($id);
        $validated = $request->validated();

        if ($request->hasFile('foto_barang')) {
            $barang->hapusFoto();
            $validated['foto_barang'] = $this->simpanFoto($request);
        } else {
            unset($validated['foto_barang']);
        }

        $barang->update($validated);

        return redirect()->route('admin.barang.index')
            ->with('success', 'Data barang donasi berhasil diperbarui!');
    }

    /**
     * Hapus data barang beserta fotonya dari storage.
     */
    public function destroy($id): RedirectResponse
    {
        $barang = Barang::findOrFail($id);
        $barang->hapusFoto();
        $barang->delete();

        return redirect()->route('admin.barang.index')
            ->with('success', 'Data barang donasi berhasil dihapus!');
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
     * Pilihan kategori untuk elemen select pada halaman React.
     */
    private function kategoriOptions()
    {
        return Kategori::orderBy('nama_kategori')->get(['id', 'nama_kategori']);
    }

    /**
     * Data barang yang dikirim ke React.
     *
     * @return array<string, mixed>
     */
    private function payload(Barang $barang): array
    {
        return [
            'id' => $barang->id,
            'nama_barang' => $barang->nama_barang,
            'kategori_id' => $barang->kategori_id,
            'kategori_nama' => $barang->kategori->nama_kategori ?? '-',
            'kondisi_barang' => $barang->kondisi_barang,
            'lokasi' => $barang->lokasi,
            'deskripsi' => $barang->deskripsi,
            'status' => $barang->status,
            'foto_url' => $barang->foto_url,
            'donatur_nama' => $barang->user->nama ?? 'Anonim',
            'created_at' => $barang->created_at?->format('d M Y, H:i') ?? '-',
        ];
    }
}
