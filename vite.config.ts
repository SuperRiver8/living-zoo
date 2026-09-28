import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 部署在 https://riverxu.cn/zoom/ 子路径下,资源必须以 /zoom/ 开头
  base: '/zoom/',
})
