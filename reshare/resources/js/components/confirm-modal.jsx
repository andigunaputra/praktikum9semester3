import Modal from '@/components/modal';

// Dialog konfirmasi hapus yang dipakai bersama oleh kedua modul
export default function ConfirmModal({ open, title = 'Konfirmasi Hapus', description, processing = false, onConfirm, onClose }) {
    return (
        <Modal
            open={open}
            title={title}
            icon="exclamation-triangle"
            onClose={() => !processing && onClose()}
            footer={
                <>
                    <button type="button" className="btn btn-outline-secondary px-4" onClick={onClose} disabled={processing}>
                        Batal
                    </button>
                    <button type="button" className="btn btn-danger px-4" onClick={onConfirm} disabled={processing}>
                        {processing && <span className="spinner-border spinner-border-sm me-1"></span>}
                        {processing ? 'Menghapus...' : 'Ya, hapus'}
                    </button>
                </>
            }
        >
            <div className="modal-body p-4">
                <p className="mb-0">{description}</p>
            </div>
        </Modal>
    );
}
