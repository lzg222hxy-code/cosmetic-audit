import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    // 关键修改：设置基础路径为相对路径，这样既可以在本地运行，也可以在 GitHub Pages 子目录运行
    base: './', 
    plugins: [react()],
    define: {
      // Polyfill process.env for the app code
      // 在 GitHub Actions 构建时，它会读取仓库的 Secrets
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
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