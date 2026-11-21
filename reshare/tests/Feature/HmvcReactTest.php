<?php

namespace Tests\Feature;

use App\Models\Barang;
use App\Models\Kategori;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HmvcReactTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Tes tidak membutuhkan hasil build Vite
        $this->withoutVite();
        Storage::fake('public');
    }

    private function akun(string $role): User
    {
        return User::create([
            'nama' => ucfirst($role).' Uji',
            'email' => $role.'@uji.test',
            'password' => 'password',
            'role' => $role,
        ]);
    }

    private function dataDonasi(array $override = []): array
    {
        $kategori = Kategori::firstOrCreate(['nama_kategori' => 'Pakaian']);

        return array_merge([
            'nama_barang' => 'Baju Seragam SD',
            'kategori_id' => $kategori->id,
            'kondisi_barang' => 'Baik',
            'lokasi' => 'Bandung',
            'deskripsi' => 'Baju seragam masih layak pakai.',
            'status' => 'Tersedia',
        ], $override);
    }

    public function test_tamu_diarahkan_ke_login_dari_halaman_pengelolaan(): void
    {
        $this->get('/admin/barang')->assertRedirect('/login');
        $this->get('/donasi')->assertRedirect('/login');
        $this->getJson('/donasi/data')->assertUnauthorized();
    }

    public function test_user_biasa_mendapat_403_pada_modul_barang_admin(): void
    {
        $this->actingAs($this->akun('user'));

        $this->get('/admin/barang')->assertForbidden();
        $this->get('/admin/barang/create')->assertForbidden();
        $this->post('/admin/barang', $this->dataDonasi())->assertForbidden();
    }

    public function test_admin_membuka_halaman_react_modul_barang(): void
    {
        $admin = $this->akun('admin');
        $kategori = Kategori::create(['nama_kategori' => 'Pakaian']);

        Barang::create([
            'user_id' => $admin->id,
            'kategori_id' => $kategori->id,
            'nama_barang' => 'Jaket',
            'kondisi_barang' => 'Baik',
            'deskripsi' => 'Jaket bekas',
            'status' => 'Tersedia',
            'lokasi' => 'Jakarta',
        ]);

        $this->actingAs($admin)
            ->get('/admin/barang')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Barang::index', false)
                ->has('barangs.data', 1)
                ->where('barangs.data.0.nama_barang', 'Jaket'));
    }

    public function test_admin_menambah_mengubah_dan_menghapus_barang_beserta_foto(): void
    {
        $admin = $this->akun('admin');
        $this->actingAs($admin);

        $this->post('/admin/barang', $this->dataDonasi([
            'foto_barang' => UploadedFile::fake()->image('lama.png'),
        ]))->assertRedirect('/admin/barang')->assertSessionHas('success');

        $barang = Barang::first();
        Storage::disk('public')->assertExists($barang->foto_barang);
        $fotoLama = $barang->foto_barang;

        // Ubah tanpa foto baru: foto lama dipertahankan
        $this->put("/admin/barang/{$barang->id}", $this->dataDonasi(['lokasi' => 'Depok']))
            ->assertRedirect('/admin/barang');
        $this->assertSame($fotoLama, $barang->fresh()->foto_barang);

        // Ubah dengan foto baru: foto lama dihapus
        $this->post("/admin/barang/{$barang->id}", $this->dataDonasi([
            '_method' => 'put',
            'foto_barang' => UploadedFile::fake()->image('baru.jpg'),
        ]))->assertRedirect('/admin/barang');
        Storage::disk('public')->assertMissing($fotoLama);

        $fotoBaru = $barang->fresh()->foto_barang;
        $this->delete("/admin/barang/{$barang->id}")->assertRedirect('/admin/barang');
        Storage::disk('public')->assertMissing($fotoBaru);
        $this->assertDatabaseCount('barang', 0);
    }

    public function test_form_barang_kosong_menghasilkan_error_validasi(): void
    {
        $this->actingAs($this->akun('admin'))
            ->post('/admin/barang', [])
            ->assertSessionHasErrors(['nama_barang', 'kategori_id', 'lokasi', 'deskripsi']);
    }

    public function test_halaman_donasi_adalah_halaman_react_dan_data_diambil_lewat_ajax(): void
    {
        $this->actingAs($this->akun('user'))
            ->get('/donasi')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Donasi::index', false));

        $this->getJson('/donasi/data')->assertOk()->assertJsonPath('status', 'success');
    }

    public function test_user_hanya_melihat_donasi_miliknya_sedangkan_admin_melihat_semua(): void
    {
        $user = $this->akun('user');
        $admin = $this->akun('admin');
        $kategori = Kategori::create(['nama_kategori' => 'Buku']);

        foreach ([$user, $admin] as $pemilik) {
            Barang::create([
                'user_id' => $pemilik->id,
                'kategori_id' => $kategori->id,
                'nama_barang' => 'Barang '.$pemilik->role,
                'kondisi_barang' => 'Baik',
                'deskripsi' => 'Deskripsi',
                'status' => 'Tersedia',
                'lokasi' => 'Bandung',
            ]);
        }

        $this->actingAs($user)->getJson('/donasi/data')->assertJsonCount(1, 'data');
        $this->actingAs($admin)->getJson('/donasi/data')->assertJsonCount(2, 'data');
    }

    public function test_store_donasi_ajax_mengembalikan_422_dan_menyimpan_foto(): void
    {
        $this->actingAs($this->akun('user'));

        $this->postJson('/donasi', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['nama_barang', 'kategori_id', 'lokasi', 'deskripsi']);

        $this->postJson('/donasi', $this->dataDonasi([
            'foto_barang' => UploadedFile::fake()->create('dokumen.zip', 100),
        ]))->assertStatus(422)->assertJsonValidationErrors('foto_barang');

        $this->postJson('/donasi', $this->dataDonasi([
            'foto_barang' => UploadedFile::fake()->image('barang.png'),
        ]))->assertCreated();

        Storage::disk('public')->assertExists(Barang::first()->foto_barang);
    }

    public function test_user_tidak_dapat_menentukan_status_donasi(): void
    {
        $this->actingAs($this->akun('user'));

        $this->postJson('/donasi', $this->dataDonasi(['status' => 'Disalurkan']))->assertCreated();

        $this->assertSame('Tersedia', Barang::first()->status);
    }

    public function test_user_tidak_dapat_mengubah_atau_menghapus_donasi_milik_orang_lain(): void
    {
        $pemilik = $this->akun('admin');
        $kategori = Kategori::create(['nama_kategori' => 'Elektronik']);
        $barang = Barang::create([
            'user_id' => $pemilik->id,
            'kategori_id' => $kategori->id,
            'nama_barang' => 'Kipas',
            'kondisi_barang' => 'Baik',
            'deskripsi' => 'Kipas angin',
            'status' => 'Tersedia',
            'lokasi' => 'Bogor',
        ]);

        $this->actingAs($this->akun('user'));

        $this->getJson("/donasi/{$barang->id}")->assertForbidden();
        $this->deleteJson("/donasi/{$barang->id}")->assertForbidden();
        $this->assertDatabaseCount('barang', 1);
    }

    public function test_hapus_donasi_ajax_ikut_menghapus_foto(): void
    {
        $this->actingAs($this->akun('user'));

        $this->postJson('/donasi', $this->dataDonasi([
            'foto_barang' => UploadedFile::fake()->image('barang.png'),
        ]))->assertCreated();

        $barang = Barang::first();
        $this->deleteJson("/donasi/{$barang->id}")->assertOk();

        Storage::disk('public')->assertMissing($barang->foto_barang);
        $this->assertDatabaseCount('barang', 0);
    }
}
