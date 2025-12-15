import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载本地 .env 文件
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    base: './', 
    plugins: [react()],
    define: {
      // 关键修复：优先使用 process.env.API_KEY (GitHub Actions 环境)，其次使用 env.API_KEY (本地 .env 文件)
      // 这样可以确保在 GitHub 构建时能正确读取到 Secrets
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.API_KEY)
    },
    server: {
      host: true,
      port: 3000,
      open: true
    },
    preview: {
      host: true,
      port: 8080,
      open: true
    }
  };
});
