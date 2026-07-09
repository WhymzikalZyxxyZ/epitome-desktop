import { defineConfig }  from 'vite';
import react             from '@vitejs/plugin-react';
import tailwindcss       from '@tailwindcss/vite';
import path              from 'path';

export default defineConfig({
    root: __dirname,
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: { '@': path.resolve(__dirname, './src') },
    },
    build: {
        outDir: '../dist/client',
        emptyOutDir: true,
    },
    server: {
        port: 5173,
        strictPort: true,
        proxy: {
            '/api': { target: 'http://localhost:3847', changeOrigin: true },
        },
    },
});
