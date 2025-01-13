import { useState, useRef, useCallback, useEffect } from "react";
import { Player } from "./Player";
import { Monster, BulletType } from "./Monster";
import { Ground } from "./components/Ground";
import { Wall } from "./components/Wall";
import { CameraController } from "./components/CameraController";
import { Joystick, JoystickState } from "./components/Joystick";
import { GameContainer } from "./components/GameContainer";
import { GameSceneCanvas } from "./components/GameScene";
import { AttackButton } from "./components/AttackButton";
import { HealthBar } from "./components/HealthBar";
import { FPSStats } from "./components/FPSStats";
import { LoadingScreen } from "./components/LoadingScreen";
import {
    AudioManager,
    calculateJoystickPosition,
    generateRandomPosition,
} from "./utils/gameUtils";
import { Monster as MonsterType, BulletData } from "./types/gameTypes";
import { Bullet } from "./Bullet";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { BaseBullet, playerBulletProperties } from "./bullets/BaseBullet";
import { GameOverModal } from "./components/GameOverModal";

// 游戏配置常量
const TOUCH_THROTTLE = 100; // 增加到100ms以确保更稳定的状态切换
const MIN_SPAWN_INTERVAL = 1500; // 增加最小生成间隔到1.5秒
const SPAWN_DELAY_AFTER_EVENT = 3000; // 修改为3秒的生成延迟
const SHOOT_COOLDOWN = 150; // 150ms cooldown between shots
const AUTO_AIM_RANGE = 30;
const VIEW_ANGLE = Math.PI / 2;

export function Scene() {
    const [gameStarted, setGameStarted] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [survivalTime, setSurvivalTime] = useState(0);
    // 状态和引用
    const [bullets, setBullets] = useState<BulletData[]>([]);
    const [playerHealth, setPlayerHealth] = useState(100);
    const [updateTrigger, setUpdateTrigger] = useState(0);

    // 处理玩家受伤
    const handlePlayerHit = useCallback(() => {
        if (gameOver.current) return;

        setPlayerHealth((prev) => {
            const newHealth = prev - 5;
            if (newHealth <= 0) {
                gameOver.current = true;
                setIsGameOver(true);
                return 0;
            }
            return Math.max(0, newHealth);
        });
    }, []);

    const joystickState = useRef<JoystickState>({
        active: false,
        position: { x: 60, y: 60 },
        startPosition: { x: 60, y: 60 },
    });
    const joystickRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<THREE.Mesh>(null);
    const monstersRef = useRef<(MonsterType & { health: number })[]>([]);
    const monsterIdCounter = useRef(0);
    const isInitialized = useRef(false);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const audioManager = useRef<AudioManager>(new AudioManager());
    const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const gameOver = useRef(false);

    // 触摸状态
    const touchLocked = useRef(false);
    const touchStartTime = useRef(0);
    const touchStartPos = useRef({ x: 0, y: 0 });
    const isTouchMoved = useRef(false);
    const touchStartArea = useRef<"left" | "right" | null>(null);
    const isTouch = useRef(false);
    const lastShootTime = useRef(0);
    const isProcessingShoot = useRef(false);
    const isProcessingEvent = useRef(false);
    const pendingSpawnCount = useRef(0);
    const lastEventTime = useRef(0);

    // 更新摇杆状态
    const updateJoystickState = useCallback(
        (updates: Partial<JoystickState>) => {
            Object.assign(joystickState.current, updates);
        },
        []
    );

    // 修改添加怪物的函数
    const addMonster = useCallback((position: [number, number, number]) => {
        const id = monsterIdCounter.current++;
        monstersRef.current.push({
            id,
            position,
            health: MAX_MONSTER_HEALTH,
        });
        setUpdateTrigger((prev) => prev + 1);
    }, []);

    // 修改移除怪物的函数
    const removeMonster = useCallback((id: number) => {
        monstersRef.current = monstersRef.current.filter(
            (monster) => monster.id !== id
        );
        setUpdateTrigger((prev) => prev + 1);
    }, []);

    // 处理怪物受伤
    const handleMonsterHealthChange = useCallback(
        (monsterId: number, newHealth: number) => {
            if (gameOver.current) return;

            const monsterIndex = monstersRef.current.findIndex(
                (monster) => monster.id === monsterId
            );

            if (monsterIndex !== -1) {
                monstersRef.current[monsterIndex].health = newHealth;
                setUpdateTrigger((prev) => prev + 1);

                if (newHealth <= 0) {
                    // 延迟移除怪物，让死亡动画有时间播放
                    setTimeout(() => {
                        removeMonster(monsterId);
                    }, 1000);
                }
            }
        },
        [removeMonster]
    );

    // 处理射击完成
    const handleShootComplete = useCallback(() => {
        isProcessingShoot.current = false;
        isProcessingEvent.current = false;
        lastEventTime.current = Date.now();

        if (pendingSpawnCount.current > 0 && monstersRef.current.length === 0) {
            setTimeout(() => {
                addMonster([0, 1, -25]);
            }, SPAWN_DELAY_AFTER_EVENT);
        }
    }, [addMonster]);

    // 处理射击
    const handleShoot = useCallback(() => {
        const now = Date.now();
        if (
            now - lastShootTime.current < SHOOT_COOLDOWN ||
            isProcessingShoot.current ||
            !playerRef.current
        ) {
            return;
        }

        lastShootTime.current = now;
        isProcessingShoot.current = true;
        isProcessingEvent.current = true;

        // 播放射击音效
        audioManager.current.playShootSound();

        // 创建子弹
        const playerPos = playerRef.current.position;
        const playerDirection = new THREE.Vector3(0, 0, 1)
            .applyEuler(playerRef.current.rotation)
            .normalize();
        playerDirection.y = 0;

        // 查找最近的目标
        let nearestTarget: MonsterType | null = null;
        let minDistance = Infinity;

        for (const monster of monstersRef.current) {
            const monsterPos = new THREE.Vector3(...monster.position);
            const toMonster = monsterPos.clone().sub(playerPos).normalize();
            toMonster.y = 0;

            const angle = playerDirection.angleTo(toMonster);
            const distance = playerPos.distanceTo(monsterPos);

            if (distance <= AUTO_AIM_RANGE && angle <= VIEW_ANGLE / 2) {
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestTarget = monster;
                }
            }
        }

        // 确定射击方向
        const shootDirection = nearestTarget
            ? new THREE.Vector3(...nearestTarget.position)
                  .sub(playerPos)
                  .setY(0)
                  .normalize()
            : playerDirection.clone();

        // 发射单颗子弹
        const timestamp = Date.now();
        const newBullet = {
            id: timestamp,
            position: [playerPos.x, 1.5, playerPos.z] as [
                number,
                number,
                number
            ],
            direction: shootDirection.clone(),
            target: nearestTarget,
            type: BulletType.NORMAL, // 使用玩家子弹类型
        };

        setBullets((prev) => {
            // 限制最大子弹数量
            const maxBullets = 10;
            const updatedBullets = [...prev, newBullet];
            if (updatedBullets.length > maxBullets) {
                return updatedBullets.slice(-maxBullets);
            }
            return updatedBullets;
        });

        handleShootComplete();
    }, [handleShootComplete, addMonster]);

    // 处理触摸结束
    const handleTouchEnd = useCallback(
        (e: React.TouchEvent) => {
            e.stopPropagation();
            e.preventDefault();

            // 只处理左侧区域的触摸结束事件
            if (touchStartArea.current === "left") {
                if (joystickRef.current) {
                    joystickRef.current.style.opacity = "0";
                    const container =
                        joystickRef.current.getBoundingClientRect();
                    const centerX = container.width / 2;
                    const centerY = container.height / 2;

                    updateJoystickState({
                        active: false,
                        position: { x: centerX, y: centerY },
                        startPosition: { x: centerX, y: centerY },
                    });

                    setTimeout(() => {
                        touchLocked.current = false;
                    }, 50);
                }

                touchStartArea.current = null;
                isTouch.current = true;
                setTimeout(() => {
                    isTouch.current = false;
                }, 100);
            }
        },
        [updateJoystickState]
    );

    // 处理游戏开始
    const handleGameStart = useCallback(() => {
        setGameStarted(true);
        // 初始化游戏状态
        isInitialized.current = true;
        addMonster([0, 1, -25]);
    }, [addMonster]);

    // 处理游戏重启
    const handleRestart = useCallback(() => {
        // 重置所有状态
        setGameStarted(false);
        setIsGameOver(false);
        setPlayerHealth(100);
        setSurvivalTime(0);
        setBullets([]);
        setUpdateTrigger(0);

        // 重置所有 ref
        gameOver.current = false;
        monstersRef.current = [];
        isInitialized.current = false;
        lastShootTime.current = 0;
        isProcessingShoot.current = false;
        isProcessingEvent.current = false;
        pendingSpawnCount.current = 0;
        lastEventTime.current = 0;

        // 重新开始游戏
        setTimeout(() => {
            setGameStarted(true);
            isInitialized.current = true;
            addMonster([0, 1, -25]);
        }, 0);
    }, [addMonster]);

    // 更新生存时间
    useEffect(() => {
        if (!gameStarted || isGameOver) return;

        const timer = setInterval(() => {
            setSurvivalTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [gameStarted, isGameOver]);

    // 移除原有的初始化 useEffect
    useEffect(() => {
        return () => {
            audioManager.current.cleanup();
        };
    }, []);

    // 设置最大血量常量
    const MAX_PLAYER_HEALTH = 100;
    const MAX_MONSTER_HEALTH = 100;

    if (!gameStarted) {
        return <LoadingScreen onStart={handleGameStart} />;
    }

    return (
        <>
            <GameContainer
                onTouchStart={(e) => {
                    e.stopPropagation();
                    const touch = e.touches[0];
                    touchStartTime.current = Date.now();
                    touchStartPos.current = {
                        x: touch.clientX,
                        y: touch.clientY,
                    };
                    isTouchMoved.current = false;

                    if (touch.clientX <= window.innerWidth * 0.4) {
                        touchStartArea.current = "left";
                        touchLocked.current = true;

                        if (joystickRef.current) {
                            const container =
                                joystickRef.current.getBoundingClientRect();
                            const maxRadius = 40;
                            const centerX = container.width / 2;
                            const centerY = container.height / 2;

                            updateJoystickState({
                                active: true,
                                position: { x: centerX, y: centerY },
                                startPosition: { x: centerX, y: centerY },
                            });

                            joystickRef.current.style.opacity = "1";
                        }
                    }
                }}
                onTouchMove={(e) => {
                    e.stopPropagation();

                    const touch = e.touches[0];
                    const touchX = touch.clientX;
                    const touchY = touch.clientY;

                    const moveThreshold = 5;
                    const dx = touchX - touchStartPos.current.x;
                    const dy = touchY - touchStartPos.current.y;
                    if (
                        Math.abs(dx) > moveThreshold ||
                        Math.abs(dy) > moveThreshold
                    ) {
                        isTouchMoved.current = true;
                    }

                    if (touchStartArea.current !== "left") return;

                    if (!touchLocked.current || !joystickRef.current) return;

                    const container =
                        joystickRef.current.getBoundingClientRect();
                    const maxRadius = 40;

                    const newPosition = calculateJoystickPosition(
                        touch as unknown as Touch,
                        container,
                        { x: 60, y: 60 },
                        maxRadius
                    );

                    updateJoystickState({
                        active: true,
                        position: newPosition,
                    });
                }}
                onTouchEnd={handleTouchEnd}
            >
                <FPSStats />
                <Canvas
                    shadows
                    dpr={[1, 2]}
                    performance={{ min: 0.5 }}
                    gl={{
                        antialias: false,
                        powerPreference: "high-performance",
                        alpha: false,
                    }}
                >
                    <CameraController playerRef={playerRef} />
                    <OrbitControls enableZoom={false} enablePan={false} />
                    <ambientLight intensity={0.5} />
                    <directionalLight
                        position={[10, 10, 10]}
                        castShadow
                        shadow-mapSize={[1024, 1024]}
                    />
                    <Ground />
                    <Wall position={[0, 2.5, -32]} size={[36, 5, 1]} />
                    <Wall position={[0, 2.5, 32]} size={[36, 5, 1]} />
                    <Wall
                        position={[-18, 2.5, 0]}
                        rotation={[0, Math.PI / 2, 0]}
                        size={[64, 5, 1]}
                    />
                    <Wall
                        position={[18, 2.5, 0]}
                        rotation={[0, Math.PI / 2, 0]}
                        size={[64, 5, 1]}
                    />
                    <Player
                        ref={playerRef}
                        joystickState={joystickState.current}
                        bullets={bullets}
                        setBullets={setBullets}
                    />
                    {monstersRef.current.map((monster) => (
                        <Monster
                            key={monster.id}
                            position={monster.position}
                            onDestroy={() => removeMonster(monster.id)}
                            playerRef={playerRef}
                            onHitPlayer={handlePlayerHit}
                            health={monster.health}
                            onHealthChange={(newHealth) =>
                                handleMonsterHealthChange(monster.id, newHealth)
                            }
                        />
                    ))}
                    {bullets.map((bullet) => (
                        <BaseBullet
                            key={bullet.id}
                            position={bullet.position}
                            direction={bullet.direction}
                            type={bullet.type || BulletType.NORMAL}
                            onHit={() => {
                                setBullets((prev) =>
                                    prev.filter((b) => b.id !== bullet.id)
                                );
                            }}
                            properties={playerBulletProperties}
                        />
                    ))}
                </Canvas>
                <Joystick
                    joystickState={joystickState.current}
                    joystickRef={joystickRef}
                />
                <AttackButton onAttack={handleShoot} />
                <HealthBar
                    currentHealth={playerHealth}
                    maxHealth={MAX_PLAYER_HEALTH}
                    isPlayer={true}
                />
                {monstersRef.current.map((monster) => (
                    <HealthBar
                        key={`health-${monster.id}`}
                        currentHealth={monster.health}
                        maxHealth={MAX_MONSTER_HEALTH}
                        isPlayer={false}
                    />
                ))}
            </GameContainer>
            {isGameOver && (
                <GameOverModal
                    onRestart={handleRestart}
                    survivalTime={survivalTime}
                />
            )}
        </>
    );
}

