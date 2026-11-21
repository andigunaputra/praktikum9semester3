<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Modules\Buku\Models\Buku;

function dataBuku(array $overrides = []): array
{
    return [
        'judul' => 'Laravel untuk Pemula',
        'penulis' => 'Budi Santoso',
        'penerbit' => 'Informatika',
        'tahun_terbit' => 2024,
        'stok' => 5,
        ...$overrides,
    ];
}

test('user can see the book list rendered by the module page', function () {
    Buku::factory()->count(3)->create();

    $this->actingAs(User::factory()->create())
        ->get('/buku')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Buku::index', false)
            ->has('bukus.data', 3));
});

test('book list supports search and pagination', function () {
    Buku::factory()->count(12)->create();
    Buku::factory()->create(['judul' => 'Judul Unik Pencarian']);

    $this->actingAs(User::factory()->create());

    $this->get('/buku')->assertInertia(fn (Assert $page) => $page
        ->has('bukus.data', 10)
        ->where('bukus.total', 13));

    $this->get('/buku?search=Unik+Pencarian')->assertInertia(fn (Assert $page) => $page
        ->has('bukus.data', 1)
        ->where('bukus.data.0.judul', 'Judul Unik Pencarian'));
});

test('user cannot open admin-only book pages', function () {
    $buku = Buku::factory()->create();

    $this->actingAs(User::factory()->create());

    $this->get('/buku/create')->assertForbidden();
    $this->post('/buku', dataBuku())->assertForbidden();
    $this->get("/buku/{$buku->id}/edit")->assertForbidden();
    $this->put("/buku/{$buku->id}", dataBuku())->assertForbidden();
    $this->delete("/buku/{$buku->id}")->assertForbidden();

    $this->assertDatabaseCount('bukus', 1);
});

test('admin sees validation errors on an empty form', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->post('/buku', [])
        ->assertSessionHasErrors(['judul', 'penulis', 'penerbit', 'tahun_terbit', 'stok']);
});

test('admin can create, update, and delete a book', function () {
    $this->actingAs(User::factory()->admin()->create());

    $this->post('/buku', dataBuku())
        ->assertRedirect('/buku')
        ->assertSessionHas('success', 'Buku berhasil ditambahkan.');

    $buku = Buku::first();
    expect($buku->judul)->toBe('Laravel untuk Pemula');

    $this->put("/buku/{$buku->id}", dataBuku(['stok' => 9]))
        ->assertRedirect('/buku')
        ->assertSessionHas('success', 'Buku berhasil diperbarui.');
    expect($buku->fresh()->stok)->toBe(9);

    $this->delete("/buku/{$buku->id}")
        ->assertRedirect('/buku')
        ->assertSessionHas('success', 'Buku berhasil dihapus.');
    $this->assertDatabaseMissing('bukus', ['id' => $buku->id]);
});
