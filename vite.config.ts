import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: "/game/",
    build: {
        outDir: "dist",
        assetsDir: "assets",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: "./index.html",
            },
            output: {
                assetFileNames: (assetInfo) => {
                    const fileName = assetInfo.name || "";
                    // 将 .glb 文件放在 models 目录下
                    if (fileName.endsWith(".glb")) {
                        return "assets/models/[name][extname]";
                    }
                    // 将音频文件放在 sounds 目录下
                    if (fileName.endsWith(".mp3")) {
                        return "assets/sounds/[name][extname]";
                    }
                    // 其他资源使用默认路径
                    return "assets/[name]-[hash][extname]";
                },
                chunkFileNames: "assets/js/[name]-[hash].js",
                entryFileNames: "assets/js/[name]-[hash].js",
            },
        },
        // 优化资源处理
        assetsInlineLimit: 0, // 禁用小文件内联，确保所有资源文件都会被单独打包
    },
    assetsInclude: ["**/*.mp3", "**/*.glb"],
    server: {
        host: true,
        port: 5173,
        strictPort: true,
        proxy: {
            "/bpi": {
                target: "http://localhost:3008",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/bpi/, ""),
            },
        },
    },
    publicDir: "public",
    // 优化资源导入
    resolve: {
        alias: {
            "@assets": "/src/assets",
            "@sounds": "/public/assets/sounds",
            "@models": "/public/assets/models",
        },
    },
});

