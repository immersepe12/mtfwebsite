import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  plugins: [glsl({ minify: false })],
  build: {
    target: 'es2022',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/three')) return 'three'
          if (id.includes('node_modules/postprocessing')) return 'three'
          if (id.includes('node_modules/gsap')) return 'gsap'
          return undefined
        },
      },
    },
  },
  server: { host: true, port: 5173 },
})
