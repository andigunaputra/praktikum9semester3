import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { FlashMessage } from '@/components/alert-message';
import ConfirmModal from '@/components/confirm-modal';
import FotoThumb from '@/components/foto-thumb';
import Pagination from '@/components/pagination';
import StatusBadge from '@/components/status-badge';
import { STATUS } from '@/lib/barang';

export default function Index({ barangs, kategoris, filters }) {
    const [search, setSearch] = useState(filters.search);
    const [kategoriId, setKategoriId] = useState(filters.kategori_id);
    const [status, setStatus] = useState(filters.status);
    const [deleting, setDeleting] = useState(null);
    const [processing, setProcessing] = useState(false);

    const hasFilter = filters.search !== '' || filters.kategori_id !== '' || filters.status !== '';

    // Kirim ulang request GET /admin/barang dengan kata kunci dan filter
    const applyFilters = (event) => {
        event.preventDefault();
        router.get('/admin/barang', { search, kategori_id: kategoriId, status }, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setSearch('');
        setKategoriId('');
        setStatus('');
        router.get('/admin/barang', {}, { replace: true });
    };

    const handleDelete = () => {
        if (!deleting) {
            return;
        }

        router.delete(`/admin/barang/${deleting.id}`, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setDeleting(null);
            },
        });
    };

    return (
        <>
            <Head title="Kelola Barang Donasi - Admin" />

            <div className="container-fluid px-4 px-lg-5 py-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <a href="/admin" className="text-decoration-none text-muted small">
                                <i className="bi bi-speedometer2 me-1"></i>Admin Dashboard
                            </a>
                            <span className="text-muted small">/</span>
                            <span className="small fw-semibold text-teal">Kelola Barang</span>
                        </div>
                        <h4 className="fw-bold text-dark mb-1">Pengelolaan Barang Donasi</h4>
                        <p className="text-muted small mb-0">Kelola katalog barang donasi ReShare menggunakan modul CRUD Inertia (React).</p>
                    </div>
                    <div className="d-flex gap-2">
                        <Link href="/admin/barang/create" className="btn btn-teal px-3 py-2 shadow-sm">
                            <i className="bi bi-plus-circle me-2"></i>Tambah Barang
                        </Link>
                        <a href="/admin" className="btn btn-outline-secondary px-3 py-2">
                            <i className="bi bi-arrow-left me-1"></i>Kembali
                        </a>
                    </div>
                </div>

                <FlashMessage />

                {/* Filter dan pencarian */}
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
                    <div className="card-body p-3 p-md-4">
                        <form onSubmit={applyFilters} className="row g-3 align-items-end">
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold text-muted">Cari Nama / Deskripsi / Lokasi</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0">
                                        <i className="bi bi-search text-muted"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        placeholder="Ketik kata kunci..."
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold text-muted">Filter Kategori</label>
                                <select className="form-select" value={kategoriId} onChange={(event) => setKategoriId(event.target.value)}>
                                    <option value="">Semua Kategori</option>
                                    {kategoris.map((kategori) => (
                                        <option key={kategori.id} value={kategori.id}>
                                            {kategori.nama_kategori}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold text-muted">Filter Status</label>
                                <select className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}>
                                    <option value="">Semua Status</option>
                                    {STATUS.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2 d-flex gap-2">
                                <button type="submit" className="btn btn-teal w-100">
                                    <i className="bi bi-funnel me-1"></i>Filter
                                </button>
                                {hasFilter && (
                                    <button type="button" className="btn btn-light border text-muted" title="Reset filter" onClick={resetFilters}>
                                        <i className="bi bi-arrow-counterclockwise"></i>
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Tabel data barang */}
                <div className="card border-0 shadow-sm" style={{ borderRadius: 12, overflow: 'hidden' }}>
                    <div className="card-header bg-white py-3 px-4 border-bottom d-flex justify-content-between align-items-center">
                        <h6 className="fw-bold mb-0 text-dark">
                            <i className="bi bi-box-seam me-2 text-teal"></i>Daftar Barang Donasi
                        </h6>
                        <span className="badge bg-light text-dark border px-3 py-2 fw-medium">Total: {barangs.total} Data</span>
                    </div>
                    <div className="table-responsive">
                        <table className="table align-middle mb-0 table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-4" style={{ width: 60 }}>No</th>
                                    <th style={{ width: 80 }}>Foto</th>
                                    <th>Nama Barang &amp; Lokasi</th>
                                    <th>Kategori</th>
                                    <th>Kondisi</th>
                                    <th>Status</th>
                                    <th>Donatur</th>
                                    <th className="text-center pe-4" style={{ width: 170 }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {barangs.data.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="text-center py-5 text-muted">
                                            <i className="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
                                            <p className="mb-0">Tidak ada data barang yang sesuai dengan kriteria pencarian.</p>
                                        </td>
                                    </tr>
                                )}
                                {barangs.data.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="ps-4 text-muted small">{(barangs.from ?? 1) + index}</td>
                                        <td>
                                            <FotoThumb url={item.foto_url} alt={item.nama_barang} />
                                        </td>
                                        <td>
                                            <div className="fw-bold text-dark">{item.nama_barang}</div>
                                            <div className="text-muted small">
                                                <i className="bi bi-geo-alt me-1 text-danger"></i>
                                                {item.lokasi}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge bg-info bg-opacity-10 text-info px-2 py-1">{item.kategori_nama}</span>
                                        </td>
                                        <td className="small fw-medium">{item.kondisi_barang}</td>
                                        <td>
                                            <StatusBadge status={item.status} />
                                        </td>
                                        <td className="small text-muted">{item.donatur_nama}</td>
                                        <td className="text-center pe-4">
                                            <div className="btn-group btn-group-sm" role="group">
                                                <Link href={`/admin/barang/${item.id}`} className="btn btn-outline-info" title="Lihat Detail">
                                                    <i className="bi bi-eye"></i>
                                                </Link>
                                                <Link href={`/admin/barang/${item.id}/edit`} className="btn btn-outline-warning" title="Edit Barang">
                                                    <i className="bi bi-pencil-square"></i>
                                                </Link>
                                                <button type="button" className="btn btn-outline-danger" title="Hapus Barang" onClick={() => setDeleting(item)}>
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="card-footer bg-white py-3 px-4 border-top d-flex flex-wrap justify-content-between align-items-center gap-2">
                        <small className="text-muted">
                            Menampilkan {barangs.from ?? 0}-{barangs.to ?? 0} dari {barangs.total} data
                        </small>
                        <Pagination links={barangs.links} />
                    </div>
                </div>
            </div>

            <ConfirmModal
                open={deleting !== null}
                description={`Yakin ingin menghapus barang "${deleting?.nama_barang}"? Foto barang juga akan dihapus dari storage.`}
                processing={processing}
                onConfirm={handleDelete}
                onClose={() => setDeleting(null)}
            />
        </>
    );
}
