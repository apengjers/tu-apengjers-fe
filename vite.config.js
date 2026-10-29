import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import flowbiteReact from "flowbite-react/plugin/vite";

const frontendDir = path.dirname(fileURLToPath(import.meta.url))

// Proxy API calls through Vite so the frontend needs no separate .env file.
export default defineConfig(({ mode }) => {
  const backendEnv = loadEnv(mode, path.resolve(frontendDir, '../backend'), '')
  const apiTarget = backendEnv.API_PROXY_TARGET || 'http://localhost:3001'

  return {
    plugins: [react(), tailwindcss(), flowbiteReact()],
    server: {
      host: '0.0.0.0',
      allowedHosts: ['.ngrok-free.app'],
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => proxyReq.removeHeader('origin'))
          },
        },
        '/auth': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => proxyReq.removeHeader('origin'))
          },
        },
      },
    },
  }
})
