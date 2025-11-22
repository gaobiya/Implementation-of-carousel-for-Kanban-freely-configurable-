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
          board2: resolve(__dirname, 'board2.html'),
          board3: resolve(__dirname, 'board3.html'),
          board4: resolve(__dirname, 'board4.html'),
          board5: resolve(__dirname, 'board5.html'),
          'board-external': resolve(__dirname, 'board-external.html')
        }
      }
    }
  }
})