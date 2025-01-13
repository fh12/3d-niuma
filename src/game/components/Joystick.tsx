import { useRef } from "react";

// 虚拟摇杆状态接口
export interface JoystickState {
    active: boolean;
    position: { x: number; y: number };
    startPosition: { x: number; y: number };
}

interface JoystickProps {
    joystickState: JoystickState;
    joystickRef: React.RefObject<HTMLDivElement>;
}

export function Joystick({ joystickState, joystickRef }: JoystickProps) {
    return (
        <div
            ref={joystickRef}
            id="joystick-container"
            style={{
                position: "fixed",
                left: "40px",
                bottom: "40px",
                width: "160px",
                height: "160px",
                background:
                    "radial-gradient(circle at center, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
                borderRadius: "80px",
                border: "2px solid rgba(255, 255, 255, 0.2)",
                boxShadow: `
                    0 0 20px rgba(255, 255, 255, 0.1),
                    inset 0 0 20px rgba(255, 255, 255, 0.05)
                `,
                touchAction: "none",
                zIndex: 1000,
                pointerEvents: "auto",
                userSelect: "none",
                WebkitUserSelect: "none",
                opacity: 0,
                transition: "opacity 0.2s ease-out",
                backdropFilter: "blur(4px)",
            }}
        >
            {/* 外圈装饰 */}
            <div
                style={{
                    position: "absolute",
                    left: "10px",
                    top: "10px",
                    right: "10px",
                    bottom: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "50%",
                    pointerEvents: "none",
                }}
            />
            {/* 中心标记 */}
            <div
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: "4px",
                    height: "4px",
                    background: "rgba(255, 255, 255, 0.5)",
                    borderRadius: "50%",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                }}
            />
            {/* 摇杆手柄 */}
            <div
                style={{
                    position: "absolute",
                    left: `${joystickState.position.x - 35}px`,
                    top: `${joystickState.position.y - 35}px`,
                    width: "70px",
                    height: "70px",
                    background:
                        "radial-gradient(circle at center, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.15))",
                    borderRadius: "35px",
                    boxShadow: `
                        0 0 10px rgba(255, 255, 255, 0.2),
                        inset 0 0 10px rgba(255, 255, 255, 0.1)
                    `,
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    transform: joystickState.active ? "scale(0.9)" : "scale(1)",
                    transition: joystickState.active
                        ? "none"
                        : "all 0.15s ease-out",
                    pointerEvents: "none",
                }}
            >
                {/* 手柄内部装饰 */}
                <div
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: "30px",
                        height: "30px",
                        transform: "translate(-50%, -50%)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "50%",
                    }}
                />
            </div>
        </div>
    );
}
