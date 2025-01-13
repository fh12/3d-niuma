import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BulletProperties } from "./BaseBullet";

interface LaserBulletProps {
    position: [number, number, number];
    direction: THREE.Vector3;
    onHit?: () => void;
    properties: BulletProperties;
}

export function LaserBullet({
    position,
    direction,
    onHit,
    properties,
}: LaserBulletProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const startTime = useRef(Date.now());

    // 创建激光材质
    const material = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 2,
        transparent: true,
        opacity: 0.8,
    });

    useFrame(() => {
        if (!meshRef.current) return;

        // 更新位置
        const speed = properties.speed * 1.5; // 激光速度更快
        meshRef.current.position.x += direction.x * speed;
        meshRef.current.position.z += direction.z * speed;

        // 旋转效果
        meshRef.current.rotation.y += 0.2;

        // 检查生命周期
        const elapsed = Date.now() - startTime.current;
        if (elapsed > properties.lifetime) {
            onHit?.();
        }
    });

    return (
        <mesh ref={meshRef} position={position}>
            <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}
