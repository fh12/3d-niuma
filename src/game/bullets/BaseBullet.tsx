import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BulletType } from "../Monster";

export interface BaseBulletProps {
    position: [number, number, number];
    direction: THREE.Vector3;
    type: BulletType;
    onHit?: () => void;
    playerRef?: React.RefObject<THREE.Mesh>;
    onDestroy?: () => void;
}

// 基础子弹属性
export interface BulletProperties {
    speed: number;
    size: number;
    collisionRadius: number;
    color: string;
    lifetime: number;
    damage: number;
    cooldown?: number;
    geometry?: THREE.BufferGeometry;
    material?: THREE.Material;
}

// 缓存向量以避免在 useFrame 中创建新对象
const tempVec = new THREE.Vector3();
const tempPos = new THREE.Vector3();

export function BaseBullet({
    position,
    direction,
    type,
    onHit,
    playerRef,
    onDestroy,
    properties,
}: BaseBulletProps & { properties: BulletProperties }) {
    const bulletRef = useRef<THREE.Mesh>(null);
    const [hasCollided, setHasCollided] = useState(false);
    const lastHitTime = useRef<number>(0);
    const startPosition = useRef(new THREE.Vector3(...position));
    const startTime = useRef(Date.now());
    const materialRef = useRef<THREE.Material | THREE.Material[]>();

    // 在子弹被销毁时调用 onDestroy
    useEffect(() => {
        if (hasCollided && onDestroy) {
            onDestroy();
        }
    }, [hasCollided, onDestroy]);

    useEffect(() => {
        // 保存材质引用
        if (bulletRef.current) {
            materialRef.current = bulletRef.current.material;
        }

        // 清理函数
        return () => {
            if (materialRef.current) {
                if (Array.isArray(materialRef.current)) {
                    materialRef.current.forEach((material) =>
                        material.dispose()
                    );
                } else {
                    materialRef.current.dispose();
                }
            }
        };
    }, []);

    useFrame((state, delta) => {
        const bullet = bulletRef.current;
        if (!bullet || hasCollided) return;

        // 检查生命周期
        if (
            properties.lifetime &&
            Date.now() - startTime.current > properties.lifetime
        ) {
            setHasCollided(true);
            onDestroy?.();
            return;
        }

        // 更新子弹位置
        bullet.position.x += direction.x * properties.speed * delta;
        bullet.position.z += direction.z * properties.speed * delta;

        // 检查碰撞
        if (type === BulletType.NORMAL) {
            // 玩家子弹：检查与怪物的碰撞
            let hitMonster = false;

            state.scene.traverse((object) => {
                if (hasCollided || hitMonster) return;

                // 检查是否是怪物的任何部分
                if (object.userData && object.userData.isMonster) {
                    // 获取对象的世界位置
                    const worldPosition = new THREE.Vector3();
                    if (
                        object instanceof THREE.Mesh ||
                        object instanceof THREE.Group
                    ) {
                        object.getWorldPosition(worldPosition);

                        // 计算碰撞半径
                        let effectiveRadius = properties.collisionRadius;
                        if (object instanceof THREE.Mesh) {
                            const box = new THREE.Box3().setFromObject(object);
                            const size = box.getSize(new THREE.Vector3());
                            effectiveRadius = Math.max(size.x, size.z) / 4;
                        }

                        tempVec.copy(bullet.position);
                        const distance = tempVec.distanceTo(worldPosition);

                        if (
                            distance <
                            effectiveRadius + properties.collisionRadius
                        ) {
                            hitMonster = true;
                            setHasCollided(true);

                            // 调用怪物的 onHit 函数
                            if (typeof object.userData.onHit === "function") {
                                object.userData.onHit();
                            }

                            onHit?.();
                            onDestroy?.();
                        }
                    }
                }
            });
        } else {
            // 怪物子弹：检查与玩家的碰撞
            if (playerRef?.current) {
                const playerPosition = playerRef.current.position;
                tempVec.copy(bullet.position);

                // 获取玩家的碰撞半径
                const playerBox = new THREE.Box3().setFromObject(
                    playerRef.current
                );
                const playerSize = playerBox.getSize(new THREE.Vector3());
                const playerRadius = Math.max(playerSize.x, playerSize.z) / 4;

                // 对于光束类型的子弹，使用特殊的碰撞检测
                if (type === BulletType.BEAM) {
                    // 获取光束的起点和终点
                    const beamStart = bullet.position.clone();
                    const beamLength = 4.0; // 光束长度
                    const beamDirection = direction.clone().normalize();
                    const beamEnd = beamStart
                        .clone()
                        .add(beamDirection.multiplyScalar(beamLength));

                    // 计算玩家到光束的最短距离
                    const playerToBeam = new THREE.Vector3();
                    const line = new THREE.Line3(beamStart, beamEnd);
                    line.closestPointToPoint(
                        playerPosition,
                        true,
                        playerToBeam
                    );

                    const distance = playerPosition.distanceTo(playerToBeam);
                    const effectiveCollisionRadius = 2.0; // 增加碰撞范围

                    // 添加调试信息
                    console.log("Beam collision check:", {
                        beamStart: beamStart.toArray(),
                        beamEnd: beamEnd.toArray(),
                        playerPos: playerPosition.toArray(),
                        closestPoint: playerToBeam.toArray(),
                        distance,
                        threshold: playerRadius + effectiveCollisionRadius,
                        isColliding:
                            distance < playerRadius + effectiveCollisionRadius,
                    });

                    // 如果距离小于碰撞半径，则发生碰撞
                    if (distance < playerRadius + effectiveCollisionRadius) {
                        const now = Date.now();
                        const cooldown = properties.cooldown ?? 0;
                        if (now - lastHitTime.current > cooldown) {
                            console.log("Beam hit player!");
                            lastHitTime.current = now;
                            onHit?.();
                            // 确保光束在击中玩家时被销毁
                            setHasCollided(true);
                            onDestroy?.();
                        }
                    }
                } else {
                    // 其他类型子弹使用点对点的碰撞检测
                    const distance = tempVec.distanceTo(playerPosition);

                    // 半球形子弹的特殊碰撞检测
                    if (type === BulletType.HEMISPHERE) {
                        const bulletToPlayer = playerPosition
                            .clone()
                            .sub(bullet.position);
                        const bulletHeight = 1.0; // 半球的高度
                        const bulletRadius = properties.collisionRadius;

                        // 检查玩家是否在半球范围内
                        const horizontalDistance = Math.sqrt(
                            bulletToPlayer.x * bulletToPlayer.x +
                                bulletToPlayer.z * bulletToPlayer.z
                        );
                        const verticalDistance = Math.abs(bulletToPlayer.y);

                        // 判断是否在半球体内（使用椭球方程）
                        const isInHemisphere =
                            (horizontalDistance * horizontalDistance) /
                                (bulletRadius * bulletRadius) +
                                (verticalDistance * verticalDistance) /
                                    (bulletHeight * bulletHeight) <=
                            1;

                        // 添加调试信息
                        console.log("Hemisphere collision check:", {
                            horizontalDistance,
                            verticalDistance,
                            bulletRadius,
                            bulletHeight,
                            isInHemisphere,
                        });

                        if (isInHemisphere) {
                            const now = Date.now();
                            const cooldown = properties.cooldown ?? 0;
                            if (now - lastHitTime.current > cooldown) {
                                console.log("Hemisphere hit player!");
                                lastHitTime.current = now;
                                onHit?.();
                                // 半球形子弹击中玩家后销毁
                                setHasCollided(true);
                                onDestroy?.();
                            }
                        }
                    } else if (
                        distance <
                        playerRadius + properties.collisionRadius
                    ) {
                        // 其他子弹的碰撞检测
                        const now = Date.now();
                        const cooldown = properties.cooldown ?? 0;
                        if (now - lastHitTime.current > cooldown) {
                            lastHitTime.current = now;
                            onHit?.();
                            setHasCollided(true);
                            onDestroy?.();
                        }
                    }
                }
            }
        }

        // 检查子弹是否超出范围
        tempPos.copy(bullet.position);
        const distanceFromStart = tempPos.distanceTo(startPosition.current);
        if (distanceFromStart > 50) {
            console.log(`Bullet out of range: ${distanceFromStart}`);
            setHasCollided(true);
            onDestroy?.();
        }

        // 更新彩虹光束的时间
        if (
            type === BulletType.BEAM &&
            materialRef.current instanceof THREE.ShaderMaterial
        ) {
            materialRef.current.uniforms.time.value =
                (Date.now() - startTime.current) / 1000;
        }
    });

    // 如果已经碰撞，不渲染子弹
    if (hasCollided) return null;

    // 根据子弹类型设置旋转
    const rotation: [number, number, number] =
        type === BulletType.BEAM
            ? [0, Math.atan2(direction.x, direction.z), 0]
            : type === BulletType.HEMISPHERE
            ? [Math.PI / 2, Math.atan2(direction.x, direction.z), 0]
            : [0, 0, 0];

    return (
        <mesh
            ref={bulletRef}
            position={[position[0], position[1], position[2]]}
            rotation={rotation}
            geometry={properties.geometry}
            material={properties.material}
            frustumCulled={false}
        />
    );
}

// 添加玩家子弹的默认属性
export const playerBulletProperties: BulletProperties = {
    speed: 30.0,
    size: 0.4,
    collisionRadius: 0.4,
    color: "#00ff00",
    lifetime: 2000,
    damage: 1,
    cooldown: 0,
    geometry: new THREE.SphereGeometry(0.4, 8, 8),
    material: new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        toneMapped: false,
    }),
};

// 光束子弹的属性
export const beamBulletProperties: BulletProperties = {
    speed: 40.0,
    damage: 2,
    size: 4.0,
    color: "#ff00ff",
    collisionRadius: 2.0,
    cooldown: 500,
    lifetime: 2000,
    geometry: new THREE.CylinderGeometry(0.5, 0.5, 4.0, 8),
    material: new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec2 vUv;
            void main() {
                float t = time * 2.0;
                vec3 color = 0.5 + 0.5 * cos(t + vUv.x * 6.28318 + vec3(0.0, 2.0, 4.0));
                gl_FragColor = vec4(color, 1.0);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
    }),
};

// 半球形子弹的属性
export const hemisphereBulletProperties: BulletProperties = {
    speed: 5.0,
    damage: 2,
    size: 2.0,
    color: "#ffffff",
    collisionRadius: 3.0,
    cooldown: 100,
    lifetime: 4000,
    geometry: new THREE.SphereGeometry(
        1.5,
        32,
        16,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2
    ),
    material: new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
    }),
};

