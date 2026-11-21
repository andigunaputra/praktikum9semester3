import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import FieldError from '@/components/field-error';
import { KONDISI, STATUS } from '@/lib/barang';

// Form tambah dan ubah barang yang dipakai bersama oleh halaman create dan edit.
// `form` adalah objek hasil useForm() milik Inertia (data, setData, errors, processing).
export default function BarangForm({ form, kategoris, fotoSaatIni = null, submitLabel, submitIcon, onSubmit }) {
    const { data, setData, errors, processing } = form;
    const [preview, setPreview] = useState(null);

    // Bersihkan URL sementara agar tidak menumpuk di memori
    useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

    const handleFile = (event) => {
        const file = event.target.files?.[0] ?? null;
        setData('foto_barang', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const gambar = preview ?? fotoSaatIni;
    const invalid = (name) => (errors[name] ? ' is-invalid' : '');

    return (
        <form onSubmit={onSubmit} noValidate encType="multipart/form-data">
            <div className="row g-4">
                {/* Kolom kiri: foto barang */}
                <div className="col-md-5">
                    <label className="form-label fw-semibold">{fotoSaatIni ? 'Foto Barang Saat Ini' : 'Foto Barang'}</label>
                    <div
                        className="border rounded-3 p-3 text-center d-flex flex-column align-items-center justify-content-center bg-light"
                        style={{ minHeight: 260, borderStyle: 'dashed' }}
                    >
                        {gambar ? (
                            <img src={gambar} alt="Foto barang" className="rounded mb-2 img-fluid" style={{ maxHeight: 180, objectFit: 'contain' }} />
                        ) : (
                            <div>
                                <i className="bi bi-image text-muted" style={{ fontSize: '3rem' }}></i>
                                <p className="small text-muted mt-2 mb-0">Belum ada foto</p>
                            </div>
                        )}
                        {fotoSaatIni && !preview && (
                            <a href={fotoSaatIni} target="_blank" rel="noopener noreferrer" className="small text-teal text-decoration-none fw-semibold">
                                <i className="bi bi-box-arrow-up-right me-1"></i>Buka Foto Ukuran Penuh
                            </a>
                        )}
                        <input
                            type="file"
                            className={`form-control mt-3${invalid('foto_barang')}`}
                            accept="image/jpeg,image/png"
                            onChange={handleFile}
                        />
                    </div>
                    <small className="text-muted d-block text-center mt-2">
                        Format JPG, JPEG, PNG (maks 2 MB).{fotoSaatIni && ' Kosongkan jika tidak ingin mengganti foto.'}
                    </small>
                    <FieldError message={errors.foto_barang} />
                </div>

                {/* Kolom kanan: data barang */}
                <div className="col-md-7">
                    <div className="mb-3">
                        <label htmlFor="nama_barang" className="form-label fw-semibold">
                            Nama Barang <span className="text-danger">*</span>
                        </label>
                        <input
                            id="nama_barang"
                            type="text"
                            className={`form-control${invalid('nama_barang')}`}
                            value={data.nama_barang}
                            onChange={(event) => setData('nama_barang', event.target.value)}
                            maxLength={150}
                            placeholder="Contoh: Baju Seragam SD"
                        />
                        <FieldError message={errors.nama_barang} />
                    </div>

                    <div className="row g-2 mb-3">
                        <div className="col-sm-6">
                            <label htmlFor="kategori_id" className="form-label fw-semibold">
                                Kategori <span className="text-danger">*</span>
                            </label>
                            <select
                                id="kategori_id"
                                className={`form-select${invalid('kategori_id')}`}
                                value={data.kategori_id}
                                onChange={(event) => setData('kategori_id', event.target.value)}
                            >
                                <option value="">Pilih Kategori</option>
                                {kategoris.map((kategori) => (
                                    <option key={kategori.id} value={kategori.id}>
                                        {kategori.nama_kategori}
                                    </option>
                                ))}
                            </select>
                            <FieldError message={errors.kategori_id} />
                        </div>
                        <div className="col-sm-6">
                            <label htmlFor="kondisi_barang" className="form-label fw-semibold">
                                Kondisi <span className="text-danger">*</span>
                            </label>
                            <select
                                id="kondisi_barang"
                                className={`form-select${invalid('kondisi_barang')}`}
                                value={data.kondisi_barang}
                                onChange={(event) => setData('kondisi_barang', event.target.value)}
                            >
                                {KONDISI.map((kondisi) => (
                                    <option key={kondisi} value={kondisi}>
                                        {kondisi}
                                    </option>
                                ))}
                            </select>
                            <FieldError message={errors.kondisi_barang} />
                        </div>
                    </div>

                    <div className="row g-2 mb-3">
                        <div className="col-sm-6">
                            <label htmlFor="lokasi" className="form-label fw-semibold">
                                Lokasi <span className="text-danger">*</span>
                            </label>
                            <input
                                id="lokasi"
                                type="text"
                                className={`form-control${invalid('lokasi')}`}
                                value={data.lokasi}
                                onChange={(event) => setData('lokasi', event.target.value)}
                                maxLength={255}
                                placeholder="Kota / wilayah"
                            />
                            <FieldError message={errors.lokasi} />
                        </div>
                        <div className="col-sm-6">
                            <label htmlFor="status" className="form-label fw-semibold">
                                Status <span className="text-danger">*</span>
                            </label>
                            <select
                                id="status"
                                className={`form-select${invalid('status')}`}
                                value={data.status}
                                onChange={(event) => setData('status', event.target.value)}
                            >
                                {STATUS.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                            <FieldError message={errors.status} />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="deskripsi" className="form-label fw-semibold">
                            Deskripsi Barang <span className="text-danger">*</span>
                        </label>
                        <textarea
                            id="deskripsi"
                            rows={4}
                            className={`form-control${invalid('deskripsi')}`}
                            value={data.deskripsi}
                            onChange={(event) => setData('deskripsi', event.target.value)}
                            maxLength={1000}
                            placeholder="Jelaskan ukuran, bahan, dan kelayakan barang..."
                        ></textarea>
                        <FieldError message={errors.deskripsi} />
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                        <Link href="/admin/barang" className="btn btn-outline-secondary px-4 py-2">
                            Batal
                        </Link>
                        <button type="submit" className="btn btn-teal px-4 py-2" disabled={processing}>
                            {processing ? (
                                <span className="spinner-border spinner-border-sm me-1"></span>
                            ) : (
                                <i className={`bi bi-${submitIcon} me-1`}></i>
                            )}
                            {processing ? 'Menyimpan...' : submitLabel}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
