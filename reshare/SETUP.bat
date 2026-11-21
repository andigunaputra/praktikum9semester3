@echo off
setlocal
chcp 65001 >nul
echo ============================================================
echo   ReShare - pemasangan otomatis (HMVC + React + Inertia)
echo ============================================================
echo.
echo SEBELUM MENJALANKAN: pastikan MySQL di XAMPP/Laragon sudah ON
echo dan database bernama  reshare  sudah dibuat di phpMyAdmin.
echo (Pengaturan database ada di file .env)
echo.
pause

echo.
echo [1/6] composer install ...
call composer install --no-interaction
if errorlevel 1 goto gagal

if not exist .env copy .env.example .env >nul
findstr /c:"APP_KEY=base64" .env >nul || call php artisan key:generate --force

echo.
echo [2/6] Migrasi database ...
choice /c YN /m "Database masih KOSONG/baru dan ingin diisi data awal (akun admin dan user)"
if errorlevel 2 goto lanjutMigrate
call php artisan migrate --force
if errorlevel 1 goto gagal
call php artisan db:seed --force
if errorlevel 1 goto gagal
goto sesudahMigrate
:lanjutMigrate
call php artisan migrate --force
if errorlevel 1 goto gagal
:sesudahMigrate

echo.
echo [3/6] storage:link ...
call php artisan storage:link

echo.
echo [4/6] Membersihkan cache ...
call php artisan optimize:clear

echo.
echo [5/6] npm install ...
call npm install
if errorlevel 1 goto gagal

echo.
echo [6/6] npm run build ...
call npm run build
if errorlevel 1 goto gagal

echo.
echo ============================================================
echo   SELESAI. Server akan dijalankan di http://127.0.0.1:8000
echo   Akun: admin@reshare.test / admin12345
echo         user@reshare.test  / user12345
echo   Tekan Ctrl+C untuk menghentikan server.
echo ============================================================
start "" http://127.0.0.1:8000
call php artisan serve
goto selesai

:gagal
echo.
echo ************************************************************
echo   Ada langkah yang GAGAL. Baca pesan error di atas,
echo   lalu kirim pesan tersebut agar bisa diperbaiki.
echo ************************************************************
:selesai
endlocal
pause
