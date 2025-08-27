import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import tailwind from '@astrojs/tailwind'

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [tailwind()],
  vite: {
    server: {
      host: true,
      port: Number(process.env.PORT) || 4321,
      strictPort: true,
      allowedHosts: ['localhost', '127.0.0.1', '.replit.dev', '.repl.co'],
      hmr: { clientPort: 443 }
    }
  }
})