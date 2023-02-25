import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path-browserify";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(), 
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    })
  ],
  resolve: {
    // 配置路径别名
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    open: true,
    hmr: true,
    port: 3001,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://admin.i-blog.online/", // 目标代理接口地址
        secure: false,
        changeOrigin: true, // 开启代理，在本地创建一个虚拟服务器
        pathRewrite: {
          "^/api": "/api",
        },
      },
      "/files": {
        target: "http://admin.i-blog.online/",
        secure: false,
        changeOrigin: true,
        pathRewrite: {
          "^/files": "/files",
        },
      },
    },
  }
})
