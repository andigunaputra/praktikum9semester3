<?php

namespace Modules\Peminjaman\Providers;

use Nwidart\Modules\Support\ModuleServiceProvider;

class PeminjamanServiceProvider extends ModuleServiceProvider
{
    protected string $name = 'Peminjaman';
    protected string $nameLower = 'peminjaman';

    protected array $providers = [
        EventServiceProvider::class,
        RouteServiceProvider::class,
    ];
}
