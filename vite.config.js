import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Markdown from 'unplugin-vue-markdown/vite'
import {resolve} from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/, /\.yml$/], // <-- allows Vue to compile Markdown and yaml files
    }),
    Markdown({ /* options */ }),
  ],
  server: {
    hmr: true,
    host: '0.0.0.0'
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        "mf-games": resolve(__dirname, "mf-games.html"),
        "mw-games": resolve(__dirname, "mw-levels.html")
      },
      output: {
        chunkFileNames: "js/[name]-[hash].js",
        assetFileNames: "[ext]/[name]-[hash].[ext]"
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  logLevel: 'debug',
})