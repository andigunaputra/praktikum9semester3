<?php

use Illuminate\Support\Facades\Route;
use Modules\Donasi\Http\Controllers\DonasiController;

/*
|--------------------------------------------------------------------------
| Web Routes - Modul Donasi (CRUD AJAX)
|--------------------------------------------------------------------------
| Seluruh endpoint dilindungi middleware 'auth' dan 'role:admin,user'.
| Hak akses data dibatasi di controller:
| - Admin: melihat dan mengelola seluruh donasi, termasuk mengubah status.
| - User : hanya melihat dan mengelola donasi miliknya sendiri.
*/

Route::middleware(['auth', 'role:admin,user'])->prefix('donasi')->name('donasi.')->group(function () {
    Route::get('/', [DonasiController::class, 'index'])->name('index');
    Route::get('/create', [DonasiController::class, 'index'])->name('create');

    // Route data ditulis sebelum route {id} agar kata "data" tidak dianggap sebagai id
    Route::get('/data', [DonasiController::class, 'getData'])->name('data');

    Route::post('/', [DonasiController::class, 'store'])->name('store');
    Route::get('/{id}', [DonasiController::class, 'show'])->whereNumber('id')->name('show');
    Route::post('/{id}', [DonasiController::class, 'update'])->whereNumber('id')->name('update.post');
    Route::put('/{id}', [DonasiController::class, 'update'])->whereNumber('id')->name('update');
    Route::delete('/{id}', [DonasiController::class, 'destroy'])->whereNumber('id')->name('destroy');
});
