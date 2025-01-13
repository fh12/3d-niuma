import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

// 相机控制器组件
export function CameraController({
    playerRef,
}: {
    playerRef: React.RefObject<THREE.Mesh>;
}) {
    const cameraRef = useRef<THREE.PerspectiveCamera>(null);

    useFrame(() => {
        if (playerRef.current && cameraRef.current) {
            // 获取玩家位置
            const playerPos = playerRef.current.position;
            // 设置相机位置，保持在玩家后上方
            cameraRef.current.position.x = playerPos.x;
            cameraRef.current.position.z = playerPos.z + 25;
            cameraRef.current.position.y = 15;
            // 让相机始终看向玩家
            cameraRef.current.lookAt(playerPos);
        }
    });

    return (
        <PerspectiveCamera
            ref={cameraRef}
            makeDefault
            position={[0, 15, 25]}
            fov={50}
        />
    );
}

