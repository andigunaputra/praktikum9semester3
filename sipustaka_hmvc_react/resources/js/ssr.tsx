import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: (name) => {
            const pages = import.meta.glob([
                './pages/**/*.tsx',
                '../../Modules/*/resources/js/pages/**/*.tsx',
            ]);

            // Halaman modul ditulis dengan format NamaModul::nama-halaman
            if (name.includes('::')) {
                const [module, page] = name.split('::');

                return resolvePageComponent(
                    `../../Modules/${module}/resources/js/pages/${page}.tsx`,
                    pages,
                );
            }

            return resolvePageComponent(`./pages/${name}.tsx`, pages);
        },
        setup: ({ App, props }) => {
            return <App {...props} />;
        },
    }),
);
