import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { mars3dPlugin } from 'vite-plugin-mars3d'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        // 将 better-sqlite3 排除在打包之外
        external: ['better-sqlite3']
      }
    }
  },
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [vue(), tailwindcss(), mars3dPlugin() as any]
  }
})
