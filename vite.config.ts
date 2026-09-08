import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    target: 'es2020',
    sourcemap: true,
    lib: {
      entry: {
        core: resolve(projectRoot, 'src/core.ts'),
        react: resolve(projectRoot, 'src/react.tsx'),
        vue: resolve(projectRoot, 'src/vue.ts'),
        'web-component': resolve(projectRoot, 'src/web-component.ts'),
      },
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'vue'],
      output: [
        {
          format: 'es',
          entryFileNames: '[name].js',
          chunkFileNames: 'chunks/[name]-[hash].js',
        },
        {
          format: 'cjs',
          exports: 'named',
          entryFileNames: '[name].cjs',
          chunkFileNames: 'chunks/[name]-[hash].cjs',
        },
      ],
    },
  },
});
