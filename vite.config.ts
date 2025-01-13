import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    assetsInclude: ["**/*.glb"],
    build: {
        assetsInlineLimit: 0,
    },
    server: {
        host: true, // 监听所有地址，包括局域网和公网地址
        port: 5173, // 指定端口号
        strictPort: true, // 端口被占用时直接退出
        // https: true, // 如果需要https可以取消注释
    },
});

