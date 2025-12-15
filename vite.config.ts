import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量，(process as any) 强制绕过 TS 检查
  const env = loadEnv(mode, (process as any).cwd(), '');
  const apiKey = process.env.API_KEY || env.API_KEY || '';

  return {
    base: './', 
    plugins: [react()],
    define: {
      // 确保构建时注入 API KEY
      'process.env.API_KEY': JSON.stringify(apiKey)
    },
    server: {
      host: true,
      port: 3000,
      open: true
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});
