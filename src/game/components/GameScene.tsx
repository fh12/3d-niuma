import { Canvas, useThree } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { Suspense, useEffect } from "react";
import * as THREE from "three";

interface GameSceneProps {
    children: React.ReactNode;
}

// 场景初始化
function SceneSetup() {
    const { scene } = useThree();

    useEffect(() => {
        // 确保场景被正确初始化
        scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.frustumCulled = false;
            }
        });
    }, [scene]);

    return null;
}

// 添加 R3F 状态初始化事件处理
function handleCanvasCreated({
    gl,
    scene,
}: {
    gl: THREE.WebGLRenderer;
    scene: THREE.Scene;
}) {
    // 设置渲染器参数
    gl.setPixelRatio(Math.min(2, window.devicePixelRatio));
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
}

export function GameSceneCanvas({ children }: GameSceneProps) {
    return (
        <Canvas
            shadows
            style={{ position: "absolute", inset: 0 }}
            camera={{
                fov: 50,
                near: 0.1,
                far: 1000,
                position: [0, 15, 25],
            }}
            gl={{
                antialias: true,
                alpha: false,
                powerPreference: "high-performance",
                preserveDrawingBuffer: true,
            }}
            dpr={Math.min(2, window.devicePixelRatio)}
            performance={{ min: 0.5 }}
            onCreated={handleCanvasCreated}
        >
            <Suspense fallback={null}>
                <SceneSetup />
                {/* 环境光源 */}
                <ambientLight intensity={0.5} />
                {/* 平行光源 */}
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={1}
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                />
                {/* 天空盒 */}
                <Sky sunPosition={[100, 20, 100]} />
                {children}
            </Suspense>
        </Canvas>
    );
}
