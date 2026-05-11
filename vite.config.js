import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const prometheusTarget = env.VITE_PROMETHEUS_PROXY_TARGET || 'http://localhost:9090';
  const backendTarget = env.VITE_BACKEND_PROXY_TARGET || 'http://localhost:7777';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/prometheus': {
          target: prometheusTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/prometheus/, ''),
        },
      },
    },
  };
});