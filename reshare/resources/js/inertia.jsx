import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

// Halaman milik aplikasi utama dan halaman milik setiap modul dikumpulkan oleh Vite
const pages = import.meta.glob([
    './pages/**/*.jsx',
    '../../Modules/*/resources/js/pages/**/*.jsx',
]);

createInertiaApp({
    title: (title) => (title ? `${title} | ReShare` : 'ReShare'),

    // Halaman modul ditulis dengan format NamaModul::nama-halaman, misalnya Barang::index
    resolve: async (name) => {
        const path = name.includes('::')
            ? `../../Modules/${name.split('::')[0]}/resources/js/pages/${name.split('::')[1]}.jsx`
            : `./pages/${name}.jsx`;

        if (!pages[path]) {
            throw new Error(`Halaman React tidak ditemukan: ${name} (${path})`);
        }

        return (await pages[path]()).default;
    },

    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },

    progress: { color: '#0d9488' },
});
