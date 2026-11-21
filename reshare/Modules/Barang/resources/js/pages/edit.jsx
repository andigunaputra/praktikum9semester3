import { Head, Link, useForm } from '@inertiajs/react';
import BarangForm from '../components/barang-form';

export default function Edit({ barang, kategoris }) {
    // _method: 'put' dipakai karena PHP hanya membaca berkas multipart pada request POST
    const form = useForm({
        _method: 'put',
        nama_barang: barang.nama_barang,
        kategori_id: String(barang.kategori_id),
        kondisi_barang: barang.kondisi_barang,
        lokasi: barang.lokasi,
        deskripsi: barang.deskripsi,
        status: barang.status,
        foto_barang: null,
    });

    const submit = (event) => {
        event.preventDefault();
        form.post(`/admin/barang/${barang.id}`, { forceFormData: true });
    };

    return (
        <>
            <Head title="Edit Barang Donasi - Admin" />

            <div className="container px-4 py-4">
                <div className="mb-4">
                    <Link href="/admin/barang" className="text-decoration-none text-dark fw-semibold d-inline-flex align-items-center">
                        <i className="bi bi-chevron-left me-2 fw-bold text-teal"></i>Kembali ke Daftar Barang
                    </Link>
                    <h4 className="fw-bold text-dark mt-2 mb-1">Edit Data Barang Donasi</h4>
                    <p className="text-muted small mb-0">Ubah informasi barang {barang.nama_barang}.</p>
                </div>

                <div className="card border-0 shadow-sm mx-auto" style={{ borderRadius: 14, maxWidth: 860 }}>
                    <div className="card-body p-4 p-md-5">
                        <BarangForm
                            form={form}
                            kategoris={kategoris}
                            fotoSaatIni={barang.foto_url}
                            submitLabel="Perbarui Data Barang"
                            submitIcon="arrow-repeat"
                            onSubmit={submit}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
