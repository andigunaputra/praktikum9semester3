import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmModal from '@/components/confirm-modal';
import StatusBadge from '@/components/status-badge';

export default function Show({ barang }) {
    const [confirming, setConfirming] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        router.delete(`/admin/barang/${barang.id}`, {
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setConfirming(false);
            },
        });
    };

    return (
        <>
            <Head title="Detail Barang Donasi - Admin" />

            <div className="container px-4 py-4">
                <div className="mb-4">
                    <Link href="/admin/barang" className="text-decoration-none text-dark fw-semibold d-inline-flex align-items-center">
                        <i className="bi bi-chevron-left me-2 fw-bold text-teal"></i>Kembali ke Daftar Barang
                    </Link>
                    <h4 className="fw-bold text-dark mt-2 mb-1">Detail Barang Donasi #{barang.id}</h4>
                    <p className="text-muted small mb-0">Informasi lengkap data barang donasi di platform ReShare.</p>
                </div>

                <div className="card border-0 shadow-sm mx-auto" style={{ borderRadius: 14, maxWidth: 900, overflow: 'hidden' }}>
                    <div className="row g-0">
                        <div className="col-md-5 bg-light d-flex align-items-center justify-content-center p-4 border-end">
                            {barang.foto_url ? (
                                <div className="text-center">
                                    <img src={barang.foto_url} alt={barang.nama_barang} className="img-fluid rounded shadow-sm mb-3" style={{ maxHeight: 280, objectFit: 'contain' }} />
                                    <div>
                                        <a href={barang.foto_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary">
                                            <i className="bi bi-box-arrow-up-right me-1"></i>Buka Gambar Asli
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted py-5">
                                    <i className="bi bi-image fs-1 mb-2 d-block"></i>
                                    <p className="small mb-0">Tidak ada foto barang</p>
                                </div>
                            )}
                        </div>

                        <div className="col-md-7 p-4 p-md-5">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <span className="badge bg-info bg-opacity-10 text-info px-3 py-1">{barang.kategori_nama}</span>
                                <StatusBadge status={barang.status} />
                            </div>
                            <h3 className="fw-bold text-dark mb-3">{barang.nama_barang}</h3>

                            <div className="row g-3 mb-4">
                                <div className="col-sm-6">
                                    <small className="text-muted d-block">Kondisi Barang</small>
                                    <span className="fw-semibold text-dark">{barang.kondisi_barang}</span>
                                </div>
                                <div className="col-sm-6">
                                    <small className="text-muted d-block">Lokasi Barang</small>
                                    <span className="fw-semibold text-dark">
                                        <i className="bi bi-geo-alt me-1 text-danger"></i>
                                        {barang.lokasi}
                                    </span>
                                </div>
                                <div className="col-sm-6">
                                    <small className="text-muted d-block">Donatur / Pemilik</small>
                                    <span className="fw-semibold text-dark">
                                        <i className="bi bi-person me-1 text-secondary"></i>
                                        {barang.donatur_nama}
                                    </span>
                                </div>
                                <div className="col-sm-6">
                                    <small className="text-muted d-block">Waktu Ditambahkan</small>
                                    <span className="fw-semibold text-dark">{barang.created_at}</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h6 className="fw-bold text-dark mb-2">Deskripsi Barang:</h6>
                                <div className="p-3 bg-light rounded text-secondary" style={{ whiteSpace: 'pre-line' }}>
                                    {barang.deskripsi}
                                </div>
                            </div>

                            <div className="d-flex gap-2 pt-3 border-top">
                                <Link href={`/admin/barang/${barang.id}/edit`} className="btn btn-teal px-4">
                                    <i className="bi bi-pencil-square me-1"></i>Edit Data
                                </Link>
                                <button type="button" className="btn btn-outline-danger px-3" onClick={() => setConfirming(true)}>
                                    <i className="bi bi-trash me-1"></i>Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                open={confirming}
                description={`Yakin ingin menghapus barang "${barang.nama_barang}"? Tindakan ini tidak dapat dibatalkan.`}
                processing={processing}
                onConfirm={handleDelete}
                onClose={() => setConfirming(false)}
            />
        </>
    );
}
