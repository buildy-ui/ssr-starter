import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      preserveSymlinks: true,
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@ui8kit/core': path.resolve(__dirname, './src/components/ui8kit')
      }
    }
  }
})
