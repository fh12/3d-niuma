import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";
import { FireballBullet } from "./bullets/FireballBullet";
import { AudioManager } from "./utils/gameUtils";
import {
    BaseBullet,
    beamBulletProperties,
    hemisphereBulletProperties,
} from "./bullets/BaseBullet";

// 生成唯一标识符的函数
function generateUUID(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `${timestamp}-${random}`;
}

// 定义子弹类型
export enum BulletType {
    NORMAL = "normal", // 玩家普通子弹
    FIREBALL = "fireball", // 火球攻击
    FLAME_RING = "flame_ring", // 火焰环攻击
    BEAM = "beam", // 光束波攻击
    HEMISPHERE = "hemisphere", // 半球形慢速子弹
}

// 添加伤害冷却时间常量
const DAMAGE_COOLDOWN = 1000; // 1秒的伤害冷却时间
const BEAM_DAMAGE_COOLDOWN = 3000; // 光束波特殊的3秒伤害冷却时间

// 添加伤害函数
const dealDamage = (times: number, callback?: () => void) => {
    if (!callback) return;
    callback(); // 只调用一次，让游戏系统处理具体的伤害数值
};

export interface MonsterProps {
    position: [number, number, number];
    onDestroy?: () => void;
    playerRef?: React.RefObject<THREE.Mesh>;
    onHitPlayer?: () => void;
    health: number;
    onHealthChange: (newHealth: number) => void;
}

export function Monster({
    position,
    onDestroy,
    playerRef,
    onHitPlayer,
    health,
    onHealthChange,
}: MonsterProps) {
    const monsterRef = useRef<THREE.Group>(null);
    const isInitialized = useRef(false);
    const instanceId = useRef<string>();
    const cleanupInProgress = useRef(false);
    const [isDying, setIsDying] = useState(false);
    const deathAnimationProgress = useRef(0);
    const BASE_SCALE = 0.66 * 20;

    // 攻击相关状态
    const [bullets, setBullets] = useState<
        Array<{
            id: number;
            position: [number, number, number];
            direction: THREE.Vector3;
            type: BulletType;
        }>
    >([]);
    const lastAttackTime = useRef(0);
    const attackCooldown = useRef(5000); // 火球攻击冷却时间5秒
    const lastFlameRingTime = useRef(0);
    const FLAME_RING_COOLDOWN = 15000; // 15秒冷却时间
    const lastHemisphereTime = useRef(0);
    const HEMISPHERE_COOLDOWN = 8000; // 半球攻击冷却时间8秒

    // 获取原始模型和动画
    const gltf = useGLTF("/assets/models/enemy.glb");

    // 克隆场景
    const clonedScene = useMemo(() => {
        // 使用 SkeletonUtils 克隆场景
        const cloned = SkeletonUtils.clone(gltf.scene) as THREE.Group;

        // 遍历并更新材质
        cloned.traverse((node) => {
            if (
                node instanceof THREE.SkinnedMesh ||
                node instanceof THREE.Mesh
            ) {
                // 克隆材质
                if (Array.isArray(node.material)) {
                    node.material = node.material.map((mat) => {
                        const clonedMat = mat.clone();
                        clonedMat.needsUpdate = true;
                        return clonedMat;
                    });
                } else {
                    const clonedMat = node.material.clone();
                    clonedMat.needsUpdate = true;
                    node.material = clonedMat;
                }
            }
        });

        // 设置位置和旋转
        cloned.position.set(...position);
        cloned.scale.set(BASE_SCALE, BASE_SCALE, BASE_SCALE);
        cloned.rotation.set(0, Math.PI, 0); // 初始旋转

        return cloned;
    }, [gltf.scene, position]);

    // 设置动画
    const { actions } = useAnimations(gltf.animations, monsterRef);

    // 动画状态管理
    const currentAnimation = useRef("walk");
    const lastMeleeAttackTime = useRef(0);
    const MELEE_COOLDOWN = 5000; // 改为5秒冷却时间
    const hasTriggeredFirstAttack = useRef(false); // 追踪是否已触发首次攻击

    // 添加近战攻击状态
    const meleeAttackState = useRef({
        isAttacking: false,
        damageDealt: false,
        attackStartTime: 0,
        DAMAGE_FRAME_START: 300, // 攻击开始后300ms开始造成伤害
        DAMAGE_FRAME_END: 500, // 攻击开始后500ms结束造成伤害
        ATTACK_DURATION: 1000, // 整个攻击动画持续1000ms
    });

    // 切换动画
    const switchAnimation = useCallback(
        (newAnimation: string) => {
            if (currentAnimation.current === newAnimation) return;

            // 停止当前动画
            if (
                currentAnimation.current === "walk" &&
                actions[
                    "Armature|Armature|pm0571_00_41_ba10_waitA01|Base Layer"
                ]
            ) {
                actions[
                    "Armature|Armature|pm0571_00_41_ba10_waitA01|Base Layer"
                ].fadeOut(0.2);
            } else if (
                currentAnimation.current === "melee" &&
                actions[
                    "Armature|Armature|pm0571_00_41_ba20_buturi01|Base Layer"
                ]
            ) {
                actions[
                    "Armature|Armature|pm0571_00_41_ba20_buturi01|Base Layer"
                ].fadeOut(0.2);
            } else if (
                currentAnimation.current === "beam" &&
                actions[
                    "Armature|Armature|pm0571_00_41_ba21_tokusyu01|Base Layer"
                ]
            ) {
                actions[
                    "Armature|Armature|pm0571_00_41_ba21_tokusyu01|Base Layer"
                ].fadeOut(0.2);
            }

            // 开始新动画
            if (
                newAnimation === "walk" &&
                actions[
                    "Armature|Armature|pm0571_00_41_ba10_waitA01|Base Layer"
                ]
            ) {
                const walkAnimation =
                    actions[
                        "Armature|Armature|pm0571_00_41_ba10_waitA01|Base Layer"
                    ];
                walkAnimation.reset().fadeIn(0.2).play();
                walkAnimation.setLoop(THREE.LoopRepeat, Infinity);
                meleeAttackState.current.isAttacking = false;
                meleeAttackState.current.damageDealt = false;
            } else if (
                newAnimation === "melee" &&
                actions[
                    "Armature|Armature|pm0571_00_41_ba20_buturi01|Base Layer"
                ]
            ) {
                const meleeAnimation =
                    actions[
                        "Armature|Armature|pm0571_00_41_ba20_buturi01|Base Layer"
                    ];
                meleeAnimation.reset().fadeIn(0.2).play();
                meleeAnimation.setLoop(THREE.LoopOnce, 1);

                // 设置攻击状态
                meleeAttackState.current.isAttacking = true;
                meleeAttackState.current.damageDealt = false;
                meleeAttackState.current.attackStartTime = Date.now();

                // 动画播放完后切回走路动画
                setTimeout(() => {
                    if (currentAnimation.current === "melee") {
                        switchAnimation("walk");
                    }
                }, meleeAttackState.current.ATTACK_DURATION);
            } else if (
                newAnimation === "beam" &&
                actions[
                    "Armature|Armature|pm0571_00_41_ba21_tokusyu01|Base Layer"
                ]
            ) {
                const beamAnimation =
                    actions[
                        "Armature|Armature|pm0571_00_41_ba21_tokusyu01|Base Layer"
                    ];
                beamAnimation.reset().fadeIn(0.2).play();
                beamAnimation.setLoop(THREE.LoopOnce, 1);

                // 动画播放完后切回走路动画
                setTimeout(() => {
                    if (currentAnimation.current === "beam") {
                        switchAnimation("walk");
                    }
                }, BEAM_ANIMATION_DURATION);
            }

            currentAnimation.current = newAnimation;
        },
        [actions]
    );

    // 初始化动画
    useEffect(() => {
        if (
            !monsterRef.current ||
            !actions["Armature|Armature|pm0571_00_41_ba10_waitA01|Base Layer"]
        )
            return;

        // 开始走路动画
        switchAnimation("walk");

        return () => {
            Object.values(actions).forEach((action) => action?.stop());
        };
    }, [actions, switchAnimation]);

    // 添加音频管理器
    const audioManagerRef = useRef<AudioManager>(new AudioManager());

    // 修改光束波攻击函数
    const performBeamAttack = useCallback(() => {
        if (!monsterRef.current || !playerRef?.current || isDying) return;

        const now = Date.now();
        if (now - lastBeamTime.current < BEAM_COOLDOWN) return;

        lastBeamTime.current = now;
        switchAnimation("beam"); // 播放前摇动画

        // 在前摇动画完成后播放Boss音效
        setTimeout(() => {
            audioManagerRef.current.playBossSound();
        }, BEAM_CHARGE_TIME - 500); // 在光束发射前0.5秒播放音效

        // 在前摇动画完成后发射光束
        setTimeout(() => {
            if (!monsterRef.current || !playerRef?.current || isDying) return;

            const monsterPos = monsterRef.current.position;
            const playerPos = playerRef.current.position;

            // 计算朝向玩家的方向
            const toPlayer = new THREE.Vector3()
                .subVectors(playerPos, monsterPos)
                .normalize();

            // 计算垂直于移动方向的向量（用于偏移）
            const perpendicular = new THREE.Vector3(-toPlayer.z, 0, toPlayer.x);

            // 发射三道平行光束
            const spacing = 1; // 将光束间距从2减小到1
            [-1, 0, 1].forEach((offset) => {
                // 计算偏移后的发射位置
                const offsetPos = new THREE.Vector3(
                    monsterPos.x + perpendicular.x * offset * spacing,
                    1.5,
                    monsterPos.z + perpendicular.z * offset * spacing
                );

                setBullets((prev) => [
                    ...prev,
                    {
                        id: Date.now() + offset,
                        position: [offsetPos.x, offsetPos.y, offsetPos.z],
                        direction: toPlayer,
                        type: BulletType.BEAM,
                    },
                ]);
            });
        }, BEAM_CHARGE_TIME);
    }, [isDying, switchAnimation]);

    // 修改事件处理器
    const handleHit = useCallback(() => {
        if (isDying) {
            return;
        }

        // 减少怪物血量
        const newHealth = health - 1;
        onHealthChange(newHealth);

        // 只有在血量为0时才死亡
        if (newHealth <= 0) {
            setIsDying(true);
            deathAnimationProgress.current = 0;
            Object.values(actions).forEach((action) => action?.stop());
            if (actions["death"]) {
                actions["death"].reset().fadeIn(0.2).play();
            }

            // 播放Boss死亡音效
            audioManagerRef.current.playBossDeadSound();

            setTimeout(() => {
                if (onDestroy) {
                    onDestroy();
                }
            }, 1000);
        }
    }, [actions, isDying, onDestroy, health, onHealthChange]);

    // 初始化和清理
    useEffect(() => {
        if (!monsterRef.current || isInitialized.current) return;

        // 生成唯一ID
        const uuid = generateUUID();
        instanceId.current = uuid;

        // 遍历并设置用户数据和事件处理器
        monsterRef.current.traverse((node) => {
            // 设置基本用户数据
            if (node instanceof THREE.Mesh || node instanceof THREE.Group) {
                node.userData = {
                    ...node.userData,
                    type: "monster",
                    instanceId: uuid,
                    isMonster: true,
                    onHit: handleHit,
                };

                // 确保网格可见且不会被视锥体剔除
                if (node instanceof THREE.Mesh) {
                    node.visible = true;
                    node.frustumCulled = false;

                    // 更新材质属性
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
            }
        });

        // 在根节点上也设置 userData
        monsterRef.current.userData = {
            type: "monster",
            instanceId: uuid,
            isMonster: true,
            onHit: handleHit,
        };

        isInitialized.current = true;

        return () => {
            cleanupInProgress.current = true;
            isInitialized.current = false;
            if (monsterRef.current) {
                monsterRef.current.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.geometry.dispose();
                        if (Array.isArray(child.material)) {
                            child.material.forEach((mat) => mat.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
            }
        };
    }, [handleHit]);

    // 添加攻击函数
    const performAttack = useCallback(() => {
        if (!monsterRef.current || !playerRef?.current || isDying) return;

        const now = Date.now();
        const monsterPos = monsterRef.current.position;
        const playerPos = playerRef.current.position;

        // 检查火球攻击冷却
        if (now - lastAttackTime.current < attackCooldown.current) return;
        lastAttackTime.current = now;

        // 计算到玩家的方向
        const toPlayer = new THREE.Vector3()
            .subVectors(playerPos, monsterPos)
            .normalize();

        // 发射火球
        setBullets((prev) => [
            ...prev,
            {
                id: Date.now(),
                position: [monsterPos.x, 1.5, monsterPos.z],
                direction: toPlayer,
                type: BulletType.FIREBALL,
            },
        ]);
    }, [isDying]);

    // 添加碰撞持续时间的引用
    const collisionStartTime = useRef<number | null>(null);
    const COLLISION_DAMAGE_DELAY = 1500; // 1.5秒的碰撞延迟
    const MELEE_RANGE = 5;

    // 添加光束波攻击相关状态
    const lastBeamTime = useRef(0);
    const BEAM_COOLDOWN = 20000; // 增加到20秒冷却时间
    const BEAM_ANIMATION_DURATION = 3000;
    const BEAM_CHARGE_TIME = 2000;

    // 添加光束波伤害状态追踪
    const beamDamageState = useRef<{ [key: string]: boolean }>({});

    useFrame((state, delta) => {
        if (
            !monsterRef.current ||
            !isInitialized.current ||
            !playerRef?.current ||
            isDying
        )
            return;

        // 检查与玩家的距离
        const distanceToPlayer = monsterRef.current.position.distanceTo(
            playerRef.current.position
        );
        const now = Date.now();

        // 统一的碰撞检测和伤害逻辑
        if (distanceToPlayer < MELEE_RANGE) {
            // 如果是首次进入碰撞范围
            if (collisionStartTime.current === null) {
                collisionStartTime.current = now;
            }
            // 如果已经在碰撞范围内超过2秒
            else if (
                now - collisionStartTime.current >=
                COLLISION_DAMAGE_DELAY
            ) {
                onHitPlayer?.();
                onHitPlayer?.(); // 造成双倍伤害
                collisionStartTime.current = now; // 重置碰撞时间，准备下一次伤害
            }

            // 触发近战动画，但不造成伤害
            if (
                !meleeAttackState.current.isAttacking &&
                (!hasTriggeredFirstAttack.current ||
                    now - lastMeleeAttackTime.current > MELEE_COOLDOWN)
            ) {
                hasTriggeredFirstAttack.current = true;
                lastMeleeAttackTime.current = now;
                switchAnimation("melee");
            }
        } else {
            // 如果离开了碰撞范围，重置所有相关状态
            collisionStartTime.current = null;
            hasTriggeredFirstAttack.current = false;

            // 修改远程攻击逻辑
            if (distanceToPlayer < 20) {
                const now = Date.now();
                // 在远程时优先使用光束波攻击
                if (now - lastBeamTime.current >= BEAM_COOLDOWN) {
                    performBeamAttack();
                } else {
                    // 分别检查火球和半球攻击的冷却时间
                    if (
                        now - lastAttackTime.current >=
                        attackCooldown.current
                    ) {
                        performAttack(); // 发射火球
                    }
                    if (
                        now - lastHemisphereTime.current >=
                        HEMISPHERE_COOLDOWN
                    ) {
                        performHemisphereAttack();
                    }
                }
            }
        }

        // 追踪玩家的逻辑
        const MONSTER_SPEED = 2.5;
        const playerPosition = playerRef.current.position;
        const monsterPosition = monsterRef.current.position;

        // 计算方向向量
        const direction = new THREE.Vector3()
            .subVectors(playerPosition, monsterPosition)
            .normalize();

        // 更新怪物位置
        monsterPosition.x += direction.x * MONSTER_SPEED * delta;
        monsterPosition.z += direction.z * MONSTER_SPEED * delta;

        // 计算朝向角度
        const angle = Math.atan2(
            playerPosition.x - monsterPosition.x,
            playerPosition.z - monsterPosition.z
        );

        // 设置旋转，使怪物面向玩家
        monsterRef.current.rotation.set(0, angle, 0);

        // 确保怪物保持在正确的高度
        if (Math.abs(monsterPosition.y - 1.0) > 0.1) {
            monsterPosition.y = 1.0;
        }
    });

    // 预加载模型
    useEffect(() => {
        useGLTF.preload("/assets/models/enemy.glb");
    }, []);

    // 添加伤害冷却时间引用
    const lastDamageTime = useRef<{ [key: string]: number }>({});

    // 添加半球形子弹攻击函数
    const performHemisphereAttack = useCallback(() => {
        if (!monsterRef.current || !playerRef?.current || isDying) return;

        const now = Date.now();
        if (now - lastHemisphereTime.current < HEMISPHERE_COOLDOWN) return;
        lastHemisphereTime.current = now;

        const monsterPos = monsterRef.current.position;

        // 创建8个方向的半球形子弹
        const numDirections = 8;
        for (let i = 0; i < numDirections; i++) {
            const angle = (i * Math.PI * 2) / numDirections;
            const direction = new THREE.Vector3(
                Math.cos(angle),
                0,
                Math.sin(angle)
            ).normalize();

            setBullets((prev) => [
                ...prev,
                {
                    id: Date.now() + i,
                    position: [monsterPos.x, 0, monsterPos.z],
                    direction: direction,
                    type: BulletType.HEMISPHERE,
                },
            ]);
        }
    }, [isDying]);

    // 清理音频
    useEffect(() => {
        return () => {
            audioManagerRef.current.cleanup();
        };
    }, []);

    return (
        <>
            <primitive
                ref={monsterRef}
                object={clonedScene}
                castShadow
                userData={{
                    type: "monster",
                    isMonster: true,
                    instanceId: instanceId.current,
                    onHit: handleHit,
                }}
            />
            {bullets.map((bullet) => {
                const { id } = bullet;
                const commonProps = {
                    position: bullet.position,
                    direction: bullet.direction,
                    playerRef: playerRef,
                    onDestroy: () => {
                        setBullets((prev) =>
                            prev.filter((b) => b.id !== bullet.id)
                        );
                    },
                    onHit: () => {
                        const now = Date.now();
                        const bulletKey = `${bullet.type}_${bullet.id}`;
                        const lastHit = lastDamageTime.current[bulletKey] || 0;
                        const cooldownTime =
                            bullet.type === BulletType.BEAM
                                ? BEAM_DAMAGE_COOLDOWN
                                : DAMAGE_COOLDOWN;

                        if (now - lastHit > cooldownTime) {
                            lastDamageTime.current[bulletKey] = now;

                            switch (bullet.type) {
                                case BulletType.FIREBALL:
                                    onHitPlayer?.();
                                    onHitPlayer?.();
                                    break;
                                case BulletType.BEAM:
                                    if (!beamDamageState.current[bulletKey]) {
                                        beamDamageState.current[bulletKey] =
                                            true;
                                        onHitPlayer?.();
                                        onHitPlayer?.();
                                    }
                                    break;
                                case BulletType.HEMISPHERE:
                                    // 半球形子弹的伤害处理
                                    onHitPlayer?.();
                                    onHitPlayer?.();
                                    break;
                            }
                        }
                    },
                };

                switch (bullet.type) {
                    case BulletType.FIREBALL:
                        return <FireballBullet key={id} {...commonProps} />;
                    case BulletType.BEAM:
                        return (
                            <BaseBullet
                                key={id}
                                {...commonProps}
                                type={BulletType.BEAM}
                                properties={beamBulletProperties}
                            />
                        );
                    case BulletType.HEMISPHERE:
                        return (
                            <BaseBullet
                                key={id}
                                {...commonProps}
                                type={BulletType.HEMISPHERE}
                                properties={hemisphereBulletProperties}
                            />
                        );
                    default:
                        return null;
                }
            })}
        </>
    );
}

