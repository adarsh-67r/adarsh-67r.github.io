import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('shiki'))                    return 'shiki'
          if (id.includes('react-syntax-highlighter')) return 'syntax'
          if (id.includes('react-markdown'))           return 'markdown'
          if (id.includes('framer-motion'))            return 'motion'
          if (
            id.includes('react-dom') ||
            id.includes('react-router-dom') ||
            id.includes('react-helmet-async') ||
            id.includes('node_modules/react/')
          ) return 'react-vendor'
        },
      },
    },
  },
})
