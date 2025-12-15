import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载本地 .env 文件
  const env = loadEnv(mode, process.cwd(), '');
  
  // 核心修复：更强壮的读取逻辑
  // 1. 优先读取 GitHub Actions 注入的 process.env.API_KEY
  // 2. 其次读取本地 .env 文件的 env.API_KEY
  // 3. 都没有则为空字符串
  const apiKey = process.env.API_KEY || env.API_KEY || '';

  console.log(`[Build Check] API Key present: ${!!apiKey}`); // 构建日志辅助

  return {
    base: './', 
    plugins: [react()],
    define: {
      // 确保前端代码里 process.env.API_KEY 永远是一个字符串，避免 undefined 错误
      'process.env.API_KEY': JSON.stringify(apiKey)
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
