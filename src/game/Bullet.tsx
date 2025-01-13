import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BulletType } from "./Monster";

interface BulletProps {
    position: [number, number, number];
    direction: THREE.Vector3;
    type: BulletType;
    onHit?: () => void;
    playerRef?: React.RefObject<THREE.Mesh>;
    onDestroy?: () => void;
}

// 缓存几何体和材质
const bulletGeometries = {
    [BulletType.NORMAL]: new THREE.SphereGeometry(0.2, 8, 8), // 减少细分
    [BulletType.FIREBALL]: new THREE.SphereGeometry(0.5, 8, 8), // 减少细分
    [BulletType.FLAME_RING]: new THREE.TorusGeometry(0.5, 0.2, 8, 16), // 减少细分
    [BulletType.BEAM]: new THREE.CylinderGeometry(0.3, 0.3, 6, 8), // 减少细分
    [BulletType.HEMISPHERE]: new THREE.SphereGeometry(
        1.5,
        32,
        16,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2
    ),
};

// 使用基础材质代替 PhongMaterial
const bulletMaterials = {
    [BulletType.NORMAL]: new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        toneMapped: false,
    }),
    [BulletType.FIREBALL]: new THREE.MeshBasicMaterial({
        color: 0xff4400,
        toneMapped: false,
    }),
    [BulletType.FLAME_RING]: new THREE.MeshBasicMaterial({
        color: 0xff8800,
        toneMapped: false,
    }),
    [BulletType.BEAM]: new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.6,
        toneMapped: false,
    }),
    [BulletType.HEMISPHERE]: new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
    }),
};

// 缓存向量以避免在 useFrame 中创建新对象
const tempVec = new THREE.Vector3();
const tempPos = new THREE.Vector3();

export function Bullet({
    position,
    direction,
    type,
    onHit,
    playerRef,
    onDestroy,
}: BulletProps) {
    const bulletRef = useRef<THREE.Mesh>(null);
    const [hasCollided, setHasCollided] = useState(false);
    const lastHitTime = useRef<number>(0);
    const HIT_COOLDOWN = 500;
    const startPosition = useRef(new THREE.Vector3(...position));

    // 在子弹被销毁时调用 onDestroy
    useEffect(() => {
        if (hasCollided && onDestroy) {
            onDestroy();
        }
    }, [hasCollided, onDestroy]);

    useFrame((state, delta) => {
        const bullet = bulletRef.current;
        if (!bullet || hasCollided) return;

        // 更新子弹位置
        let speed;
        if (type === BulletType.NORMAL) {
            // 玩家的子弹
            speed = 30;
            bullet.position.x += direction.x * speed * delta;
            bullet.position.z += direction.z * speed * delta;

            // 检查玩家子弹是否超出范围
            tempPos.copy(bullet.position);
            if (tempPos.distanceTo(startPosition.current) > 50) {
                setHasCollided(true);
                onDestroy?.();
            }
        } else {
            // 怪物的子弹
            speed = type === BulletType.BEAM ? 45 : 15;
            if (playerRef?.current) {
                bullet.position.x += direction.x * speed * delta;
                bullet.position.z += direction.z * speed * delta;

                // 使用缓存的向量计算距离
                tempVec.subVectors(bullet.position, playerRef.current.position);
                const distance = tempVec.length();
                const now = Date.now();

                // 根据子弹类型进行碰撞检测
                switch (type) {
                    case BulletType.FIREBALL:
                        if (distance < 1.5) {
                            onHit?.();
                            setHasCollided(true);
                        }
                        break;

                    case BulletType.FLAME_RING:
                        if (
                            distance < 2 &&
                            now - lastHitTime.current > HIT_COOLDOWN
                        ) {
                            lastHitTime.current = now;
                            onHit?.();
                        }
                        break;

                    case BulletType.BEAM:
                        if (
                            distance < 1.5 &&
                            now - lastHitTime.current > HIT_COOLDOWN
                        ) {
                            lastHitTime.current = now;
                            onHit?.();
                        }
                        break;
                }

                // 检查怪物子弹是否超出范围
                tempPos.copy(bullet.position);
                if (tempPos.distanceTo(startPosition.current) > 50) {
                    setHasCollided(true);
                    onDestroy?.();
                }
            }
        }
    });

    // 如果已经碰撞，不渲染子弹
    if (hasCollided) return null;

    return (
        <mesh
            ref={bulletRef}
            position={[position[0], position[1], position[2]]}
            geometry={bulletGeometries[type]}
            material={bulletMaterials[type]}
            frustumCulled={false}
        />
    );
}

