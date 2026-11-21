<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title inertia>ReShare | Berbagi Barang, Menebar Harapan</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <link rel="stylesheet" href="{{ asset('css/reshare-asli.css') }}">
    @viteReactRefresh
    @vite('resources/js/inertia.jsx')
    @inertiaHead
</head>
<body class="d-flex flex-column min-vh-100">
    {{-- Navbar tetap dirender Blade agar tampilan seragam dengan halaman lain --}}
    @auth
        @include('components.navbar')
    @endauth

    {{-- Seluruh isi halaman modul dirender oleh React melalui Inertia --}}
    <main class="flex-grow-1">
        @inertia
    </main>

    <footer class="reshare-footer">© {{ date('Y') }} ReShare — Berbagi Barang, Menebar Harapan.</footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
