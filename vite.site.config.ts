import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'site-dist',
    emptyOutDir: true,
    sourcemap: true,
  },
});
