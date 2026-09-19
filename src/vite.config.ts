import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    build: {
        // p5 is ~1MB minified but lives entirely in its own lazy-loaded chunk
        // (see manualChunks below), so it never affects initial page load.
        chunkSizeWarningLimit: 1100,
        rollupOptions: {
            output: {
                // p5 (~1MB) is only pulled in by the lazy-loaded arcade games, never
                // by the initial bundle — split it into its own named chunk so the
                // size warning doesn't fire on a vendor lib that's already lazy.
                manualChunks: {
                    p5: ['p5'],
                },
            },
        },
    },
});
