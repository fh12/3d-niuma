import { useEffect, useRef } from "react";
import Stats from "stats.js";

export function FPSStats() {
    const statsRef = useRef<Stats>();

    useEffect(() => {
        // 创建 stats 实例
        const stats = new Stats();
        statsRef.current = stats;

        // 设置样式和位置
        stats.dom.style.position = "absolute";
        stats.dom.style.left = "0px";
        stats.dom.style.top = "0px";

        // 添加到页面
        document.body.appendChild(stats.dom);

        // 开始监控
        function animate() {
            stats.begin();
            stats.end();
            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);

        // 清理函数
        return () => {
            document.body.removeChild(stats.dom);
            statsRef.current = undefined;
        };
    }, []);

    return null;
}
