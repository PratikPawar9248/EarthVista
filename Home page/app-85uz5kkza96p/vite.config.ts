import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

import { miaodaDevPlugin } from "miaoda-sc-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr({
      svgrOptions: {
        icon: true, exportType: 'named', namedExport: 'ReactComponent', }, }), nodePolyfills({
      // Enable polyfills for Node.js built-ins needed by netcdfjs
      include: ['buffer', 'process', 'stream'],
      globals: {
        Buffer: true,
        process: true,
      },
    }),
    miaodaDevPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['netcdfjs'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
