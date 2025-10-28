import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Removed the automatic import to avoid circular dependencies
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.neds.com.au',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true,
        configure: (proxy, options) => {
          // Handle text/plain response from API
          proxy.on('proxyRes', function (proxyRes, req, res) {
            const contentType = proxyRes.headers['content-type'];
            if (contentType && contentType.includes('text/plain')) {
              // Change content-type to application/json for proper parsing
              proxyRes.headers['content-type'] = 'application/json';
            }
          });
        }
      }
    }
  }
})