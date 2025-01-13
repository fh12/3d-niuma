// 墙壁组件
export function Wall({
    position,
    rotation,
    size,
}: {
    position: [number, number, number];
    rotation?: [number, number, number];
    size: [number, number, number];
}) {
    return (
        <mesh position={position} rotation={rotation} receiveShadow castShadow>
            <boxGeometry args={size} />
            <meshStandardMaterial color="#666666" />
        </mesh>
    );
}
