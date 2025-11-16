import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const isTauri = env.TAURI_PLATFORM !== undefined

  const host = isTauri ? '127.0.0.1' : 'localhost'
  const port = isTauri ? 1420 : 5173

  return {
    plugins: [react()],
    clearScreen: false,
    server: {
      host,
      port,
      strictPort: isTauri,
    },
    preview: {
      host,
      port,
    },
    envPrefix: ['VITE_', 'TAURI_'],
    build: {
      target: isTauri
        ? process.env.TAURI_PLATFORM === 'windows'
          ? 'chrome105'
          : 'safari13'
        : 'esnext',
      minify: isTauri ? !process.env.TAURI_DEBUG : true,
      sourcemap: isTauri ? !!process.env.TAURI_DEBUG : false,
    },
    optimizeDeps: {
      // Tauri expects CommonJS modules to be pre-bundled
      esbuildOptions: {
        target: isTauri ? 'esnext' : 'es2020',
      },
    },
  }
})
