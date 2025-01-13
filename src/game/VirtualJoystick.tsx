import { useEffect, useState } from "react";
import { Html } from "@react-three/drei";

interface VirtualJoystickProps {
    onMove: (x: number, y: number) => void;
}

export function VirtualJoystick({ onMove }: VirtualJoystickProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [basePosition, setBasePosition] = useState({ x: 0, y: 0 });

    // 处理触摸开始
    const handleTouchStart = (e: TouchEvent) => {
        const touch = e.touches[0];
        setIsDragging(true);
        setBasePosition({
            x: touch.clientX,
            y: touch.clientY,
        });
    };

    // 处理触摸移动
    const handleTouchMove = (e: TouchEvent) => {
        if (!isDragging) return;
        e.preventDefault();

        const touch = e.touches[0];
        const deltaX = touch.clientX - basePosition.x;
        const deltaY = touch.clientY - basePosition.y;

        // 限制摇杆移动范围
        const maxDistance = 50;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const scale = distance > maxDistance ? maxDistance / distance : 1;

        const newX = deltaX * scale;
        const newY = deltaY * scale;

        setPosition({ x: newX, y: newY });

        // 将位置标准化为-1到1之间的值
        onMove(newX / maxDistance, -newY / maxDistance);
    };

    // 处理触摸结束
    const handleTouchEnd = () => {
        setIsDragging(false);
        setPosition({ x: 0, y: 0 });
        onMove(0, 0);
    };

    useEffect(() => {
        const joystickBase = document.getElementById("joystick-base");
        if (!joystickBase) return;

        joystickBase.addEventListener("touchstart", handleTouchStart);
        document.addEventListener("touchmove", handleTouchMove, {
            passive: false,
        });
        document.addEventListener("touchend", handleTouchEnd);

        return () => {
            joystickBase.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
        };
    }, [isDragging, basePosition]);

    return (
        <Html
            prepend
            style={{
                position: "fixed",
                left: "20px",
                bottom: "20px",
                transform: "none",
                pointerEvents: "none",
                userSelect: "none",
                touchAction: "none",
                zIndex: 1000,
            }}
        >
            <div
                id="joystick-base"
                style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "75px",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    position: "relative",
                    pointerEvents: "auto",
                    boxShadow: "0 0 20px rgba(0, 0, 0, 0.3)",
                }}
            >
                <div
                    style={{
                        width: "70px",
                        height: "70px",
                        borderRadius: "35px",
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        position: "absolute",
                        left: "40px",
                        top: "40px",
                        transform: `translate(${position.x}px, ${position.y}px)`,
                        transition: isDragging ? "none" : "transform 0.2s",
                        boxShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
                    }}
                />
            </div>
        </Html>
    );
}

