// Gambar mini barang; klik untuk membuka foto di tab baru
export default function FotoThumb({ url, alt }) {
    if (!url) {
        return (
            <div className="bg-light rounded d-flex align-items-center justify-content-center text-muted" style={{ width: 52, height: 52 }}>
                <i className="bi bi-image fs-4"></i>
            </div>
        );
    }

    return (
        <a href={url} target="_blank" rel="noopener noreferrer" title="Klik untuk perbesar">
            <img src={url} alt={alt} className="rounded shadow-sm" style={{ width: 52, height: 52, objectFit: 'cover' }} />
        </a>
    );
}
