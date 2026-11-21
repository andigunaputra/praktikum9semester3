<?php

namespace Modules\Buku\Providers;

use Nwidart\Modules\Support\ModuleServiceProvider;

class BukuServiceProvider extends ModuleServiceProvider
{
    protected string $name = 'Buku';
    protected string $nameLower = 'buku';

    protected array $providers = [
        EventServiceProvider::class,
        RouteServiceProvider::class,
    ];
}
