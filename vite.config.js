// import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Markdown from 'unplugin-vue-markdown/vite'
import { resolve } from 'path'
import viteCompression from 'vite-plugin-compression'
import { constants } from 'zlib'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    BUILD_TIME: JSON.stringify(new Date())
  },
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/]
    }),
    Markdown({ markdownItOptions: { breaks: true } }),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 5120,
      deleteOriginFile: false,
      compressionOptions: {
        level: 9
      }
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 5120,
      deleteOriginFile: false,
      compressionOptions: {
        params: {
          [constants.BROTLI_PARAM_QUALITY]: 11
        }
      }
    }),
  ],
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        index: resolve(".", "index.html"),
        "mf-games": resolve(".", "mf-games.html"),
        "mw-games": resolve(".", "mw-levels.html"),
        "assets": resolve(".", "assets.html"),
        "mario-worker": resolve(".", "mario-worker.html"),
      },
      output: {
        chunkFileNames: "js/[name]-[hash].js",
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: "[ext]/[name]-[hash].[ext]",
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router'],
          'http-vendor': ['axios'],
          'ui-vendor': [
            '@floating-ui/vue',
            'vue3-carousel',
            'overlayscrollbars',
            'overlayscrollbars-vue'
          ],
          'utils-vendor': [
            'js-yaml',
            'js-cookie'
          ]
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      },
    },
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true,
    assetsInlineLimit: 8192,
    reportCompressedSize: true,
    sourcemap: false
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'axios',
      'js-yaml',
      'js-cookie',
      '@floating-ui/vue',
      'vue3-carousel',
      'overlayscrollbars',
      'overlayscrollbars-vue',
      'markdown-it'
    ]
  },
  server: {
    hmr: true,
    host: '0.0.0.0'
  }
})
