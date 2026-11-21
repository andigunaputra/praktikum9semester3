import { Head, Link, useForm } from '@inertiajs/react';
import BarangForm from '../components/barang-form';

export default function Create({ kategoris }) {
    const form = useForm({
        nama_barang: '',
        kategori_id: '',
        kondisi_barang: 'Baik',
        lokasi: '',
        deskripsi: '',
        status: 'Tersedia',
        foto_barang: null,
    });

    const submit = (event) => {
        event.preventDefault();
        // forceFormData diperlukan karena form membawa berkas foto
        form.post('/admin/barang', { forceFormData: true });
    };

    return (
        <>
            <Head title="Tambah Barang Donasi - Admin" />

            <div className="container px-4 py-4">
                <div className="mb-4">
                    <Link href="/admin/barang" className="text-decoration-none text-dark fw-semibold d-inline-flex align-items-center">
                        <i className="bi bi-chevron-left me-2 fw-bold text-teal"></i>Kembali ke Daftar Barang
                    </Link>
                    <h4 className="fw-bold text-dark mt-2 mb-1">Tambah Barang Donasi</h4>
                    <p className="text-muted small mb-0">Isi data barang baru. Formulir ini dikirim dengan useForm() milik Inertia.</p>
                </div>

                <div className="card border-0 shadow-sm mx-auto" style={{ borderRadius: 14, maxWidth: 860 }}>
                    <div className="card-body p-4 p-md-5">
                        <BarangForm form={form} kategoris={kategoris} submitLabel="Simpan Data Barang" submitIcon="cloud-arrow-up" onSubmit={submit} />
                    </div>
                </div>
            </div>
        </>
    );
}
