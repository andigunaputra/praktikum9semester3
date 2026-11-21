import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { AlertMessage } from '@/components/alert-message';
import ConfirmModal from '@/components/confirm-modal';
import FieldError from '@/components/field-error';
import FotoThumb from '@/components/foto-thumb';
import Modal from '@/components/modal';
import StatusBadge from '@/components/status-badge';
import { http, HttpError } from '@/lib/http';
import { KONDISI, STATUS } from '@/lib/barang';

const emptyFilters = { search: '', kategori_id: '', status: '' };

const emptyForm = {
    nama_barang: '',
    kategori_id: '',
    kondisi_barang: 'Baik',
    lokasi: '',
    deskripsi: '',
    status: 'Tersedia',
};

const urls = {
    data: '/donasi/data',
    store: '/donasi',
    show: (id) => `/donasi/${id}`,
    update: (id) => `/donasi/${id}`,
    destroy: (id) => `/donasi/${id}`,
};

// Error 422 Laravel berbentuk { field: ['pesan'] }; ambil pesan pertama tiap field
const firstError = (errors, name) => errors[name]?.[0];

export default function Index({ kategoris, isAdmin }) {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState(emptyFilters);
    const [message, setMessage] = useState(null);

    // State modal tambah / ubah
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [fileKey, setFileKey] = useState(0);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    // State modal detail dan hapus
    const [detail, setDetail] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [processingDelete, setProcessingDelete] = useState(false);

    const showError = (error, fallback) => {
        setMessage({ type: 'error', text: error instanceof HttpError ? (error.data?.message ?? fallback) : fallback });
    };

    // Mengambil data donasi dari server (GET /donasi/data) tanpa memuat ulang halaman
    const loadData = async (params = filters) => {
        setLoading(true);

        try {
            const result = await http(urls.data, { params });
            setRecords(result.data);
        } catch (error) {
            showError(error, 'Gagal memuat data donasi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(emptyFilters);
    }, []);

    // Bersihkan URL pratinjau foto agar tidak menumpuk di memori
    useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

    const applyFilters = (event) => {
        event.preventDefault();
        loadData(filters);
    };

    const resetFilters = () => {
        setFilters(emptyFilters);
        loadData(emptyFilters);
    };

    const resetFormState = () => {
        setFile(null);
        setPreview(null);
        setFileKey((key) => key + 1);
        setErrors({});
    };

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        resetFormState();
        setFormOpen(true);
    };

    // Mengambil satu data (GET /donasi/{id}) lalu mengisi form pada modal
    const openEdit = async (id) => {
        try {
            const { data } = await http(urls.show(id));
            setEditing(data);
            setForm({
                nama_barang: data.nama_barang,
                kategori_id: String(data.kategori_id),
                kondisi_barang: data.kondisi_barang,
                lokasi: data.lokasi,
                deskripsi: data.deskripsi,
                status: data.status,
            });
            resetFormState();
            setFormOpen(true);
        } catch (error) {
            showError(error, 'Data donasi tidak ditemukan.');
        }
    };

    const openDetail = async (id) => {
        try {
            const { data } = await http(urls.show(id));
            setDetail(data);
        } catch (error) {
            showError(error, 'Detail donasi tidak dapat dimuat.');
        }
    };

    const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

    const handleFile = (event) => {
        const selected = event.target.files?.[0] ?? null;
        setFile(selected);
        setPreview(selected ? URL.createObjectURL(selected) : null);
    };

    // Menyimpan data (tambah dan ubah) dengan FormData agar berkas foto ikut terkirim
    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setErrors({});

        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            // Status hanya dikirim oleh admin; server juga mengabaikannya untuk user biasa
            if (key !== 'status' || isAdmin) {
                formData.append(key, value);
            }
        });

        if (file) {
            formData.append('foto_barang', file);
        }

        if (editing) {
            formData.append('_method', 'PUT');
        }

        try {
            const result = await http(editing ? urls.update(editing.id) : urls.store, { method: 'POST', body: formData });

            setFormOpen(false);
            setMessage({ type: 'success', text: result.message });
            await loadData();
        } catch (error) {
            if (error instanceof HttpError && error.status === 422) {
                setErrors(error.data?.errors ?? {});
            } else {
                showError(error, 'Terjadi kesalahan, silakan coba lagi.');
            }
        } finally {
            setSaving(false);
        }
    };

    // Menghapus data (DELETE /donasi/{id}) setelah dikonfirmasi
    const handleDelete = async () => {
        if (!deleting) {
            return;
        }

        setProcessingDelete(true);

        try {
            const result = await http(urls.destroy(deleting.id), { method: 'DELETE' });
            setMessage({ type: 'success', text: result.message });
            await loadData();
        } catch (error) {
            showError(error, 'Data donasi gagal dihapus.');
        } finally {
            setProcessingDelete(false);
            setDeleting(null);
        }
    };

    const invalid = (name) => (errors[name] ? ' is-invalid' : '');
    const gambar = preview ?? editing?.foto_url ?? null;

    return (
        <>
            <Head title="Donasi Barang (CRUD AJAX)" />

            <div className="container-fluid px-4 px-lg-5 py-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <a href="/dashboard" className="text-decoration-none text-muted small">
                                <i className="bi bi-house me-1"></i>Beranda
                            </a>
                            <span className="text-muted small">/</span>
                            <span className="small fw-semibold text-teal">Modul Donasi (AJAX)</span>
                        </div>
                        <h4 className="fw-bold text-dark mb-1">Pengelolaan Donasi Barang</h4>
                        <p className="text-muted small mb-0">
                            Kelola donasi barang dengan <strong>CRUD AJAX</strong> (fetch, modal React, dan upload foto) tanpa pindah halaman.
                        </p>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        {isAdmin ? (
                            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-2">
                                <i className="bi bi-shield-check me-1"></i>Akses Admin (Semua Donasi)
                            </span>
                        ) : (
                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2">
                                <i className="bi bi-person me-1"></i>Donasi Milik Saya
                            </span>
                        )}
                        <button type="button" className="btn btn-teal px-3 py-2 shadow-sm" onClick={openCreate}>
                            <i className="bi bi-plus-circle me-2"></i>Donasi Barang Baru
                        </button>
                    </div>
                </div>

                <div className="mb-3">
                    <AlertMessage type={message?.type ?? 'success'} message={message?.text} onClose={() => setMessage(null)} />
                </div>

                {/* Filter dan pencarian */}
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
                    <div className="card-body p-3 p-md-4">
                        <form onSubmit={applyFilters} className="row g-3 align-items-end">
                            <div className="col-md-5">
                                <label className="form-label small fw-semibold text-muted">Cari Donasi (Nama / Lokasi / Deskripsi)</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0">
                                        <i className="bi bi-search text-muted"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        placeholder="Ketik kata kunci pencarian..."
                                        value={filters.search}
                                        onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold text-muted">Filter Kategori</label>
                                <select
                                    className="form-select"
                                    value={filters.kategori_id}
                                    onChange={(event) => setFilters({ ...filters, kategori_id: event.target.value })}
                                >
                                    <option value="">Semua Kategori</option>
                                    {kategoris.map((kategori) => (
                                        <option key={kategori.id} value={kategori.id}>
                                            {kategori.nama_kategori}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small fw-semibold text-muted">Filter Status</label>
                                <select
                                    className="form-select"
                                    value={filters.status}
                                    onChange={(event) => setFilters({ ...filters, status: event.target.value })}
                                >
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
                                    <i className="bi bi-funnel me-1"></i>Terapkan
                                </button>
                                <button type="button" className="btn btn-light border text-muted" title="Reset filter" onClick={resetFilters}>
                                    <i className="bi bi-arrow-counterclockwise"></i>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Tabel donasi */}
                <div className="card border-0 shadow-sm" style={{ borderRadius: 12, overflow: 'hidden' }}>
                    <div className="card-header bg-white py-3 px-4 border-bottom d-flex justify-content-between align-items-center">
                        <h6 className="fw-bold mb-0 text-dark">
                            <i className="bi bi-box2-heart me-2 text-teal"></i>Daftar Donasi Barang
                        </h6>
                        <span className="badge bg-light text-dark border px-3 py-2 fw-medium">
                            {loading ? 'Memuat data...' : `Total: ${records.length} Data`}
                        </span>
                    </div>
                    <div className="table-responsive">
                        <table className="table align-middle mb-0 table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-4" style={{ width: 60 }}>No</th>
                                    <th style={{ width: 80 }}>Foto</th>
                                    <th>Barang &amp; Lokasi</th>
                                    <th>Kategori</th>
                                    <th>Kondisi</th>
                                    <th>Status</th>
                                    <th>Donatur</th>
                                    <th className="text-center pe-4" style={{ width: 170 }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr>
                                        <td colSpan={8} className="text-center py-5 text-muted">
                                            <div className="spinner-border text-teal mb-2" role="status"></div>
                                            <p className="mb-0">Memuat data donasi via AJAX...</p>
                                        </td>
                                    </tr>
                                )}
                                {!loading && records.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="text-center py-5 text-muted">
                                            <i className="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
                                            <p className="mb-0">Belum ada data donasi yang sesuai.</p>
                                        </td>
                                    </tr>
                                )}
                                {!loading &&
                                    records.map((item, index) => (
                                        <tr key={item.id}>
                                            <td className="ps-4 text-muted small">{index + 1}</td>
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
                                                    <button type="button" className="btn btn-outline-info" title="Lihat Detail" onClick={() => openDetail(item.id)}>
                                                        <i className="bi bi-eye"></i>
                                                    </button>
                                                    {item.can_manage && (
                                                        <>
                                                            <button type="button" className="btn btn-outline-warning" title="Edit" onClick={() => openEdit(item.id)}>
                                                                <i className="bi bi-pencil-square"></i>
                                                            </button>
                                                            <button type="button" className="btn btn-outline-danger" title="Hapus" onClick={() => setDeleting(item)}>
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal tambah / ubah donasi */}
            <Modal
                open={formOpen}
                title={editing ? 'Edit Donasi Barang' : 'Donasi Barang Baru'}
                icon="heart"
                size="modal-lg"
                staticBackdrop
                onClose={() => !saving && setFormOpen(false)}
            >
                <form onSubmit={handleSubmit} noValidate encType="multipart/form-data">
                    <div className="modal-body p-4">
                        <div className="row g-4">
                            <div className="col-md-5">
                                <label className="form-label fw-semibold">Foto Barang Donasi</label>
                                <div
                                    className="border rounded-3 p-3 text-center d-flex flex-column align-items-center justify-content-center bg-light"
                                    style={{ minHeight: 240, borderStyle: 'dashed' }}
                                >
                                    {gambar ? (
                                        <img src={gambar} alt="Foto barang" className="rounded mb-2 img-fluid" style={{ maxHeight: 160, objectFit: 'contain' }} />
                                    ) : (
                                        <div>
                                            <i className="bi bi-cloud-arrow-up text-teal" style={{ fontSize: '2.8rem' }}></i>
                                            <p className="small text-muted mt-2 mb-0">Format: JPG, JPEG, PNG (maks 2 MB)</p>
                                        </div>
                                    )}
                                    {editing?.foto_url && !preview && (
                                        <a href={editing.foto_url} target="_blank" rel="noopener noreferrer" className="small text-teal text-decoration-none fw-semibold">
                                            <i className="bi bi-box-arrow-up-right me-1"></i>Buka Foto Saat Ini
                                        </a>
                                    )}
                                    <input
                                        key={fileKey}
                                        type="file"
                                        className={`form-control mt-3${invalid('foto_barang')}`}
                                        accept="image/jpeg,image/png"
                                        onChange={handleFile}
                                    />
                                </div>
                                <small className="text-muted d-block text-center mt-2">
                                    {editing ? 'Kosongkan jika tidak ingin mengganti foto.' : 'Pilih foto barang yang jelas dan layak.'}
                                </small>
                                <FieldError message={firstError(errors, 'foto_barang')} />
                            </div>

                            <div className="col-md-7">
                                <div className="mb-3">
                                    <label htmlFor="nama_barang" className="form-label fw-semibold">
                                        Nama Barang <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id="nama_barang"
                                        name="nama_barang"
                                        type="text"
                                        className={`form-control${invalid('nama_barang')}`}
                                        value={form.nama_barang}
                                        onChange={handleChange}
                                        maxLength={150}
                                        placeholder="Contoh: Baju Seragam SD"
                                    />
                                    <FieldError message={firstError(errors, 'nama_barang')} />
                                </div>

                                <div className="row g-2 mb-3">
                                    <div className="col-sm-6">
                                        <label htmlFor="kategori_id" className="form-label fw-semibold">
                                            Kategori <span className="text-danger">*</span>
                                        </label>
                                        <select id="kategori_id" name="kategori_id" className={`form-select${invalid('kategori_id')}`} value={form.kategori_id} onChange={handleChange}>
                                            <option value="">Pilih Kategori</option>
                                            {kategoris.map((kategori) => (
                                                <option key={kategori.id} value={kategori.id}>
                                                    {kategori.nama_kategori}
                                                </option>
                                            ))}
                                        </select>
                                        <FieldError message={firstError(errors, 'kategori_id')} />
                                    </div>
                                    <div className="col-sm-6">
                                        <label htmlFor="kondisi_barang" className="form-label fw-semibold">
                                            Kondisi <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            id="kondisi_barang"
                                            name="kondisi_barang"
                                            className={`form-select${invalid('kondisi_barang')}`}
                                            value={form.kondisi_barang}
                                            onChange={handleChange}
                                        >
                                            {KONDISI.map((kondisi) => (
                                                <option key={kondisi} value={kondisi}>
                                                    {kondisi}
                                                </option>
                                            ))}
                                        </select>
                                        <FieldError message={firstError(errors, 'kondisi_barang')} />
                                    </div>
                                </div>

                                <div className="row g-2 mb-3">
                                    <div className={isAdmin ? 'col-sm-6' : 'col-12'}>
                                        <label htmlFor="lokasi" className="form-label fw-semibold">
                                            Lokasi <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            id="lokasi"
                                            name="lokasi"
                                            type="text"
                                            className={`form-control${invalid('lokasi')}`}
                                            value={form.lokasi}
                                            onChange={handleChange}
                                            maxLength={255}
                                            placeholder="Kota / wilayah"
                                        />
                                        <FieldError message={firstError(errors, 'lokasi')} />
                                    </div>
                                    {isAdmin && (
                                        <div className="col-sm-6">
                                            <label htmlFor="status" className="form-label fw-semibold">
                                                Status <span className="text-danger">*</span>
                                            </label>
                                            <select id="status" name="status" className={`form-select${invalid('status')}`} value={form.status} onChange={handleChange}>
                                                {STATUS.map((item) => (
                                                    <option key={item} value={item}>
                                                        {item}
                                                    </option>
                                                ))}
                                            </select>
                                            <FieldError message={firstError(errors, 'status')} />
                                        </div>
                                    )}
                                </div>

                                <div className="mb-1">
                                    <label htmlFor="deskripsi" className="form-label fw-semibold">
                                        Deskripsi Barang <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        id="deskripsi"
                                        name="deskripsi"
                                        rows={3}
                                        className={`form-control${invalid('deskripsi')}`}
                                        value={form.deskripsi}
                                        onChange={handleChange}
                                        maxLength={1000}
                                        placeholder="Jelaskan ukuran, bahan, dan kelayakan barang donasi..."
                                    ></textarea>
                                    <FieldError message={firstError(errors, 'deskripsi')} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer border-top py-3 px-4">
                        <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setFormOpen(false)} disabled={saving}>
                            Batal
                        </button>
                        <button type="submit" className="btn btn-teal px-4" disabled={saving}>
                            {saving ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="bi bi-cloud-arrow-up me-1"></i>}
                            {saving ? 'Menyimpan...' : 'Simpan Donasi'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal detail donasi */}
            <Modal
                open={detail !== null}
                title="Detail Donasi Barang"
                icon="info-circle"
                size="modal-lg"
                onClose={() => setDetail(null)}
                footer={
                    <button type="button" className="btn btn-secondary btn-sm px-4" onClick={() => setDetail(null)}>
                        Tutup
                    </button>
                }
            >
                {detail && (
                    <div className="modal-body p-4">
                        <div className="row g-4">
                            <div className="col-md-5 bg-light rounded d-flex flex-column align-items-center justify-content-center p-3 text-center">
                                {detail.foto_url ? (
                                    <>
                                        <img src={detail.foto_url} alt={detail.nama_barang} className="img-fluid rounded shadow-sm mb-2" style={{ maxHeight: 220, objectFit: 'contain' }} />
                                        <a href={detail.foto_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary mt-2">
                                            <i className="bi bi-box-arrow-up-right me-1"></i>Buka Foto Asli
                                        </a>
                                    </>
                                ) : (
                                    <div className="text-muted py-4">
                                        <i className="bi bi-image fs-1 d-block mb-1"></i>
                                        <span className="small">Tidak ada foto</span>
                                    </div>
                                )}
                            </div>
                            <div className="col-md-7">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="badge bg-info bg-opacity-10 text-info px-3 py-1">{detail.kategori_nama}</span>
                                    <StatusBadge status={detail.status} />
                                </div>
                                <h4 className="fw-bold text-dark mb-3">{detail.nama_barang}</h4>
                                <div className="row g-2 mb-3">
                                    <div className="col-6">
                                        <small className="text-muted d-block">Kondisi Barang</small>
                                        <span className="fw-semibold text-dark">{detail.kondisi_barang}</span>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-muted d-block">Lokasi</small>
                                        <span className="fw-semibold text-dark">{detail.lokasi}</span>
                                    </div>
                                    <div className="col-6 mt-2">
                                        <small className="text-muted d-block">Donatur</small>
                                        <span className="fw-semibold text-dark">{detail.donatur_nama}</span>
                                    </div>
                                    <div className="col-6 mt-2">
                                        <small className="text-muted d-block">Tanggal Donasi</small>
                                        <span className="fw-semibold text-dark">{detail.created_at}</span>
                                    </div>
                                </div>
                                <small className="text-muted d-block fw-semibold mb-1">Deskripsi:</small>
                                <div className="p-3 bg-light rounded text-secondary small" style={{ whiteSpace: 'pre-line' }}>
                                    {detail.deskripsi}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <ConfirmModal
                open={deleting !== null}
                description={`Yakin ingin menghapus donasi "${deleting?.nama_barang}"? Foto barang juga akan dihapus dari storage.`}
                processing={processingDelete}
                onConfirm={handleDelete}
                onClose={() => setDeleting(null)}
            />
        </>
    );
}
