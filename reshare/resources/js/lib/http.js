// Helper fetch() untuk CRUD AJAX: mengirim token CSRF, meminta respons JSON,
// dan melempar HttpError agar halaman dapat membedakan error 422 dari error lain.

export class HttpError extends Error {
    constructor(status, data) {
        super(data?.message ?? `Request gagal dengan status ${status}`);
        this.status = status;
        this.data = data;
    }
}

// Membaca token CSRF dari cookie XSRF-TOKEN yang dibuat oleh Laravel
function getXsrfToken() {
    const cookie = document.cookie.split('; ').find((row) => row.startsWith('XSRF-TOKEN='));

    return cookie ? decodeURIComponent(cookie.substring('XSRF-TOKEN='.length)) : '';
}

export async function http(url, { method = 'GET', body, params } = {}) {
    let target = url;

    if (params) {
        const query = new URLSearchParams(
            Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
        ).toString();

        if (query) {
            target += `?${query}`;
        }
    }

    const response = await fetch(target, {
        method,
        body,
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': getXsrfToken(),
        },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new HttpError(response.status, data);
    }

    return data;
}
