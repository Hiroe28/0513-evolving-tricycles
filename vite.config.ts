import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/evolving-tricycles/', // GitHub Pagesのリポジトリ名を設定
  build: {
    outDir: 'dist', // ビルド出力先
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Node.js のポリフィルを無効化
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  // Node.js の組み込みモジュールをブラウザで使わないように設定
  server: {
    fs: {
      // nodeモジュールへのアクセスを許可しない
      strict: true,
    },
  },
});