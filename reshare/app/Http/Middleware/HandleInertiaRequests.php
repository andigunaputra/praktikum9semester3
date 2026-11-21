<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * Root view (resources/views/inertia.blade.php) yang membungkus semua halaman React.
     *
     * @var string
     */
    protected $rootView = 'inertia';

    /**
     * Versi aset; Inertia memuat ulang halaman penuh jika versi berubah.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Shared props: data yang otomatis tersedia di semua halaman React.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'nama' => $request->user()->nama,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
