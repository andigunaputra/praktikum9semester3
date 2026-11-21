import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

// Pesan berwarna hijau (berhasil) atau merah (error) bergaya Bootstrap
export function AlertMessage({ type, message, onClose }) {
    // Pesan berhasil otomatis tertutup setelah 4 detik
    useEffect(() => {
        if (!message || type !== 'success' || !onClose) {
            return;
        }

        const timer = setTimeout(onClose, 4000);

        return () => clearTimeout(timer);
    }, [message, type]);

    if (!message) {
        return null;
    }

    const isSuccess = type === 'success';

    return (
        <div
            role="alert"
            className={`alert alert-${isSuccess ? 'success' : 'danger'} alert-dismissible border-0 shadow-sm`}
            style={{ borderRadius: 10 }}
        >
            <i className={`bi bi-${isSuccess ? 'check-circle-fill' : 'exclamation-triangle-fill'} me-2`}></i>
            {message}
            {onClose && <button type="button" className="btn-close" aria-label="Tutup" onClick={onClose}></button>}
        </div>
    );
}

// Membaca flash dari shared props (HandleInertiaRequests) dan menampilkannya
export function FlashMessage() {
    const { flash } = usePage().props;
    const [success, setSuccess] = useState(flash?.success ?? null);
    const [error, setError] = useState(flash?.error ?? null);

    // Tampilkan ulang pesan setiap kali server mengirim flash baru
    useEffect(() => {
        setSuccess(flash?.success ?? null);
        setError(flash?.error ?? null);
    }, [flash?.success, flash?.error]);

    return (
        <>
            <AlertMessage type="success" message={success} onClose={() => setSuccess(null)} />
            <AlertMessage type="error" message={error} onClose={() => setError(null)} />
        </>
    );
}
