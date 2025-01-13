import { forwardRef, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { BaseBullet, playerBulletProperties } from "./bullets/BaseBullet";
import { BulletType } from "./Monster";
import { BulletData } from "./types/gameTypes";

interface PlayerProps {
    joystickState: {
        active: boolean;
        position: { x: number; y: number };
        startPosition: { x: number; y: number };
    };
    bullets: BulletData[];
    setBullets: React.Dispatch<React.SetStateAction<BulletData[]>>;
}

export const Player = forwardRef<THREE.Mesh, PlayerProps>(
    ({ joystickState, bullets, setBullets }, ref) => {
        const speed = 0.2;
        const velocity = useRef<THREE.Vector3>(new THREE.Vector3());
        const targetRotation = useRef<number>(0);

        // 加载角色模型
        const { scene, animations } = useGLTF("/assets/models/character.glb");
        // 获取动画控制器
        const { actions } = useAnimations(animations, scene);

        // 动画状态管理
        const currentAnimation = useRef("idle");

        // 初始化动画
        useEffect(() => {
            // 打印所有可用的动画名称，用于调试
            console.log("Available animations:", Object.keys(actions));

            // 播放待机动画
            if (actions["mixamo.com"]) {
                actions["mixamo.com"].reset().fadeIn(0.5).play();
                currentAnimation.current = "mixamo.com";
            }
        }, [actions]);

        // 初始化模型
        useEffect(() => {
            if (!scene) return;

            // 遍历场景中的所有对象，设置用户数据
            scene.traverse((node) => {
                node.userData.type = "player"; // 设置类型为 player

                // 确保所有网格都可见
                if (node instanceof THREE.Mesh) {
                    node.visible = true;
                    node.frustumCulled = false;
                    if (Array.isArray(node.material)) {
                        node.material.forEach((mat) => {
                            mat.transparent = false;
                            mat.opacity = 1;
                            mat.needsUpdate = true;
                        });
                    } else {
                        node.material.transparent = false;
                        node.material.opacity = 1;
                        node.material.needsUpdate = true;
                    }
                }
            });

            // 设置初始位置和缩放
            scene.position.set(0, 0, 0);
            scene.scale.set(1.5, 1.5, 1.5);
        }, [scene]);

        useFrame((state, delta) => {
            if (ref && "current" in ref && ref.current) {
                // 计算摇杆输入
                if (joystickState.active) {
                    const dx =
                        joystickState.position.x -
                        joystickState.startPosition.x;
                    const dy =
                        joystickState.position.y -
                        joystickState.startPosition.y;
                    const length = Math.sqrt(dx * dx + dy * dy);

                    if (length > 0) {
                        // 归一化方向向量
                        const normalizedDx = dx / length;
                        const normalizedDy = dy / length;

                        // 设置速度
                        velocity.current.x = normalizedDx * speed;
                        velocity.current.z = normalizedDy * speed;

                        // 计算目标旋转角度
                        targetRotation.current = Math.atan2(
                            normalizedDx,
                            normalizedDy
                        );

                        // 如果正在播放待机动画，停止它
                        if (
                            currentAnimation.current === "mixamo.com" &&
                            actions["mixamo.com"]
                        ) {
                            actions["mixamo.com"].fadeOut(0.2);
                            currentAnimation.current = "none";
                        }
                    }
                } else {
                    // 停止移动
                    velocity.current.x = 0;
                    velocity.current.z = 0;

                    // 恢复待机动画
                    if (
                        currentAnimation.current !== "mixamo.com" &&
                        actions["mixamo.com"]
                    ) {
                        actions["mixamo.com"].reset().fadeIn(0.2).play();
                        currentAnimation.current = "mixamo.com";
                    }
                }

                // 应用移动
                ref.current.position.x += velocity.current.x;
                ref.current.position.z += velocity.current.z;

                // 平滑旋转更新
                if (velocity.current.length() > 0.01) {
                    const currentRotation = ref.current.rotation.y;
                    const rotationDiff =
                        targetRotation.current - currentRotation;
                    const normalizedDiff = Math.atan2(
                        Math.sin(rotationDiff),
                        Math.cos(rotationDiff)
                    );
                    ref.current.rotation.y += normalizedDiff * delta * 10;
                }

                // 限制在边界内
                const maxBoundX = 17;
                const maxBoundZ = 31;
                ref.current.position.x = Math.max(
                    -maxBoundX,
                    Math.min(maxBoundX, ref.current.position.x)
                );
                ref.current.position.z = Math.max(
                    -maxBoundZ,
                    Math.min(maxBoundZ, ref.current.position.z)
                );
            }
        });

        return (
            <>
                <primitive
                    ref={ref}
                    object={scene}
                    position={[0, 0, 0]}
                    scale={[1.5, 1.5, 1.5]}
                    castShadow
                    userData={{ type: "player" }}
                />
                {bullets.map((bullet) => (
                    <BaseBullet
                        key={bullet.id}
                        position={bullet.position}
                        direction={bullet.direction}
                        type={BulletType.NORMAL}
                        onHit={() => {
                            setBullets((prev) =>
                                prev.filter((b) => b.id !== bullet.id)
                            );
                        }}
                        properties={playerBulletProperties}
                    />
                ))}
            </>
        );
    }
);

// 预加载模型
useGLTF.preload("/assets/models/character.glb");

