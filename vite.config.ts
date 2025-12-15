import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量，process.cwd() 需要类型断言以避免 TS 检查报错
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = process.env.API_KEY || env.API_KEY || '';

  return {
    base: './', 
    plugins: [react()],
    define: {
      // 确保在构建过程中 API Key 被正确注入到代码中
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
