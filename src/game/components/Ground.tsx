import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// 地面组件
export function Ground() {
    // 加载草地纹理
    const grassTexture = useTexture("/assets/textures/grass/grass_color.jpg");

    // 设置纹理重复
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(2, 2); // 调整重复次数为2，使瓷砖变大10倍

    return (
        <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0, 0]}
            receiveShadow
        >
            <planeGeometry args={[36, 64]} />
            <meshStandardMaterial
                map={grassTexture}
                roughness={0.8}
                metalness={0.2}
            />
        </mesh>
    );
}
