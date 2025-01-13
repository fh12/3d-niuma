import React, { useState, useEffect } from "react";

interface HealthBarProps {
    currentHealth: number;
    maxHealth: number;
    isPlayer?: boolean;
}

export function HealthBar({
    currentHealth,
    maxHealth,
    isPlayer = false,
}: HealthBarProps) {
    const healthPercentage = (currentHealth / maxHealth) * 100;
    const [time, setTime] = useState(0);

    useEffect(() => {
        if (!isPlayer) return;
        const timer = setInterval(() => {
            setTime((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [isPlayer]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;
    };

    return (
        <div
            style={{
                position: "absolute",
                top: isPlayer ? "50px" : "20px",
                right: "20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "8px 12px",
                background: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(8px)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
        >
            <div
                style={{
                    color: "white",
                    fontSize: isPlayer ? "14px" : "16px",
                    fontWeight: "bold",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                }}
            >
                {isPlayer ? "牛马" : "BOSS"}
            </div>
            <div
                style={{
                    position: "relative",
                    width: isPlayer ? "150px" : "200px",
                    height: "16px",
                    background: "rgba(0, 0, 0, 0.5)",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: `${healthPercentage}%`,
                        height: "100%",
                        background: isPlayer
                            ? "linear-gradient(90deg, #2ecc71, #27ae60)"
                            : "linear-gradient(90deg, #e74c3c, #c0392b)",
                        transition: "width 0.3s ease-in-out",
                        borderRadius: "8px",
                        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                    }}
                />
                {isPlayer && (
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "11px",
                            fontWeight: "bold",
                            textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                            letterSpacing: "0.5px",
                        }}
                    >
                        {`${Math.max(0, currentHealth)} / ${maxHealth}`}
                    </div>
                )}
            </div>
            {isPlayer && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "#fff",
                        fontSize: "14px",
                        fontWeight: "bold",
                        textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                        padding: "4px 8px",
                        background: "rgba(0, 0, 0, 0.3)",
                        borderRadius: "6px",
                        letterSpacing: "0.5px",
                    }}
                >
                    <span style={{ opacity: 0.8 }}>⏱</span>
                    {formatTime(time)}
                </div>
            )}
        </div>
    );
}
