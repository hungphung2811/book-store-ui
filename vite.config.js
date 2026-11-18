import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Đích proxy /public/** (customer-api): nginx 8080, hoặc customer-api 8088 khi dev bằng dev-start.ps1 (không có nginx). Proxy để không dính CORS.
  const target = env.VITE_API_TARGET || 'http://localhost:8088'
  return {
    plugins: [react()],
    resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
    server: {
      port: 3008,
      proxy: { '/public': { target, changeOrigin: true } },
    },
  }
})
