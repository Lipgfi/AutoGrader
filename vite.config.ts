import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue()
  ],
  server: {
    proxy: {
      // B4 主后端服务 (端口 8002)
      '/api/v1': {
        target: 'http://localhost:8002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, '/api/v1')
      },
      // B3 题库评测服务 (端口 8003)
      '/api/v1/b3': {
        target: 'http://localhost:8003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/b3/, '/api/v1/b3')
      },
      // B2 代码测评服务 (端口 8001)
      '/api/v1/b2': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/b2/, '/api/v1/b2')
      }
    }
  }
})
