import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue()
  ],
  server: {
    proxy: {
      '/api/v1/b3': {
        target: 'http://localhost:8001',
        changeOrigin: true
      },
      '/api/v1': {
        target: 'http://localhost:8002',
        changeOrigin: true
      }
    }
  }
})
