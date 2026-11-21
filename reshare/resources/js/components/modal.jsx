import { useEffect } from 'react';

// Modal Bootstrap yang dikendalikan state React (tanpa jQuery maupun bootstrap.Modal)
export default function Modal({ open, title, icon, size = '', staticBackdrop = false, onClose, children, footer }) {
    useEffect(() => {
        if (!open) {
            return;
        }

        document.body.classList.add('modal-open');
        const onKey = (event) => event.key === 'Escape' && !staticBackdrop && onClose();
        document.addEventListener('keydown', onKey);

        return () => {
            document.body.classList.remove('modal-open');
            document.removeEventListener('keydown', onKey);
        };
    }, [open, staticBackdrop]);

    if (!open) {
        return null;
    }

    return (
        <>
            <div
                className="modal fade show d-block"
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                style={{ overflowY: 'auto' }}
                onMouseDown={(event) => event.target === event.currentTarget && !staticBackdrop && onClose()}
            >
                <div className={`modal-dialog modal-dialog-centered ${size}`}>
                    <div className="modal-content border-0 shadow" style={{ borderRadius: 14 }}>
                        <div className="modal-header border-bottom py-3 px-4">
                            <h5 className="modal-title fw-bold text-dark">
                                {icon && <i className={`bi bi-${icon} me-2 text-teal`}></i>}
                                {title}
                            </h5>
                            <button type="button" className="btn-close" aria-label="Tutup" onClick={onClose}></button>
                        </div>
                        {children}
                        {footer && <div className="modal-footer border-top py-3 px-4">{footer}</div>}
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show"></div>
        </>
    );
}
