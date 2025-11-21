import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  return {
    plugins: [vue()],
    server: {
      port: 3000
    },
    build: {
      // 多页面构建配置
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          board1: resolve(__dirname, 'board1.html'),
          board2: resolve(__dirname, 'board2.html')
        }
      }
    }
  }
})