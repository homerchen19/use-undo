import { defineConfig } from 'vitest/config';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    outDir: 'lib',
    lib: {
      entry: 'index.ts',
      formats: ['es', 'cjs'],
      fileName: (format: string) => `use-undo.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
