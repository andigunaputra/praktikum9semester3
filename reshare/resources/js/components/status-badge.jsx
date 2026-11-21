import { STATUS_CLASS } from '@/lib/barang';

export default function StatusBadge({ status }) {
    return <span className={`badge px-2 py-1 ${STATUS_CLASS[status] ?? STATUS_CLASS.Disalurkan}`}>{status}</span>;
}
