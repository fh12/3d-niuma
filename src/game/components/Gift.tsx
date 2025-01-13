import { useRef } from "react";
import * as THREE from "three";

interface GiftProps {
    position: [number, number, number];
}

export function Gift({ position }: GiftProps) {
    return (
        <group position={position}>
            <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color="#ffdd00" />
            </mesh>
            <mesh rotation-y={Math.PI / 4}>
                <boxGeometry args={[1.2, 0.1, 1.2]} />
                <meshBasicMaterial color="#ff4400" />
            </mesh>
        </group>
    );
}

