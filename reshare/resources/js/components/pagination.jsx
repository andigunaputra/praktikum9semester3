import { Link } from '@inertiajs/react';

// Label pagination Laravel berisi entitas HTML, misalnya "&laquo; Previous" dan "Next &raquo;"
function cleanLabel(label) {
    return label
        .replace('&laquo; Previous', '«')
        .replace('Next &raquo;', '»')
        .replace('&laquo;', '«')
        .replace('&raquo;', '»');
}

export default function Pagination({ links }) {
    if (!links || links.length <= 3) {
        return null;
    }

    return (
        <ul className="pagination pagination-sm mb-0 flex-wrap">
            {links.map((link, index) => (
                <li key={index} className={`page-item${link.active ? ' active' : ''}${link.url ? '' : ' disabled'}`}>
                    {link.url ? (
                        <Link className="page-link" href={link.url} preserveScroll>
                            {cleanLabel(link.label)}
                        </Link>
                    ) : (
                        <span className="page-link">{cleanLabel(link.label)}</span>
                    )}
                </li>
            ))}
        </ul>
    );
}
