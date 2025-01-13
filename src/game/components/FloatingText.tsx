import { useEffect, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FloatingTextProps {
    text: string;
    position: [number, number, number];
    color?: string;
    size?: number;
    onComplete?: () => void;
}

export function FloatingText({
    text,
    position,
    color = "#ff0000",
    size = 1.0,
    onComplete,
}: FloatingTextProps) {
    const groupRef = useRef<THREE.Group>(null);
    const startTime = useRef(Date.now());
    const duration = 1000; // 动画持续时间
    const delay = 800; // 显示延迟时间，文字将保持显示800ms才开始淡出

    // 创建文字纹理
    const texture = useMemo(() => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        // 设置画布大小
        canvas.width = 512;
        canvas.height = 128;

        // 设置文字样式
        const fontSize = 64;
        ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制文字
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        // 创建纹理
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }, [text, color]);

    // 创建材质
    const material = useMemo(() => {
        return new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 1,
        });
    }, [texture]);

    // 创建精灵
    const sprite = useMemo(() => {
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(4 * size, 1 * size, 1);
        return sprite;
    }, [material, size]);

    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.add(sprite);
        }
        return () => {
            onComplete?.();
            material.dispose();
            texture.dispose();
            if (groupRef.current) {
                groupRef.current.remove(sprite);
            }
        };
    }, [sprite, material, texture, onComplete]);

    useFrame(() => {
        if (!groupRef.current) return;

        const elapsed = Date.now() - startTime.current;

        // 计算延迟后的进度
        const delayedProgress = Math.max(0, elapsed - delay) / duration;
        const progress = Math.min(delayedProgress, 1);

        // 上升和淡出动画
        // 在延迟期间，文字缓慢上升
        const floatProgress = Math.min(elapsed / (delay + duration), 1);
        groupRef.current.position.y = position[1] + floatProgress * 1.5;

        // 只在延迟后开始淡出
        material.opacity = 1 - progress;

        // 动画结束时移除
        if (progress >= 1 && onComplete) {
            onComplete();
        }
    });

    return <group ref={groupRef} position={position} />;
}

