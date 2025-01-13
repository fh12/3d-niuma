import React, { useEffect, useState } from "react";
import { Leaderboard } from "./Leaderboard";

interface VictoryModalProps {
    onContinue: () => void;
    survivalTime: number;
    remainingHealth: number;
    userId: number;
}

// 游戏参数配置
const GAME_CONFIG = {
    MAX_SCORE: 10000, // 最高基础分数
    MAX_TIME: 300, // 最长参考时间（秒）
    MAX_HEALTH: 100, // 最大生命值
};

// 计算游戏分数
function calculateScore(
    completionTime: number,
    remainingHealth: number
): number {
    // 基础分数：时间越短，分数越高
    const baseScore = Math.max(
        0,
        GAME_CONFIG.MAX_SCORE * (1 - completionTime / GAME_CONFIG.MAX_TIME)
    );

    // 血量加成：剩余血量越高，加成越多
    const healthBonus = remainingHealth / GAME_CONFIG.MAX_HEALTH;

    // 最终分数 = 基础分数 * (1 + 血量加成)
    const finalScore = Math.round(baseScore * (1 + healthBonus));

    return Math.min(finalScore, GAME_CONFIG.MAX_SCORE); // 确保不超过最高分
}

export function VictoryModal({
    onContinue,
    survivalTime,
    remainingHealth,
    userId,
}: VictoryModalProps) {
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [score, setScore] = useState(0);
    // 添加粒子动画状态
    const [particles, setParticles] = useState<
        Array<{ id: number; left: string; animationDuration: string }>
    >([]);

    // 生成随机粒子
    useEffect(() => {
        const newParticles = Array.from({ length: 50 }, (_, index) => ({
            id: index,
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 2 + 1}s`,
        }));
        setParticles(newParticles);
    }, []);

    // 更新用户分数
    useEffect(() => {
        const updateUserStats = async () => {
            const calculatedScore = calculateScore(
                survivalTime,
                remainingHealth
            );
            setScore(calculatedScore);

            try {
                const response = await fetch(`/bpi/users/${userId}/stats`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        score: calculatedScore,
                        completion_time: survivalTime,
                        remaining_health: remainingHealth,
                    }),
                });

                if (!response.ok) {
                    throw new Error("更新分数失败");
                }

                const data = await response.json();
                console.log("分数更新成功:", data);
            } catch (error) {
                console.error("更新分数错误:", error);
            }
        };

        updateUserStats();
    }, [survivalTime, remainingHealth, userId]);

    // 格式化时间显示
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;
    };

    return (
        <>
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0, 0, 0, 0.8)",
                    backdropFilter: "blur(8px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10000,
                    overflow: "hidden",
                }}
            >
                {/* 粒子动画 */}
                {particles.map((particle) => (
                    <div
                        key={particle.id}
                        style={{
                            position: "absolute",
                            left: particle.left,
                            top: "-20px",
                            width: "10px",
                            height: "10px",
                            background: `hsl(${
                                Math.random() * 360
                            }, 100%, 50%)`,
                            borderRadius: "50%",
                            animation: `fall ${particle.animationDuration} linear infinite`,
                        }}
                    />
                ))}

                <div
                    style={{
                        background: "linear-gradient(135deg, #4a148c, #7b1fa2)",
                        padding: "40px",
                        borderRadius: "20px",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                        border: "2px solid rgba(255, 255, 255, 0.2)",
                        textAlign: "center",
                        color: "white",
                        minWidth: "300px",
                        animation: "victoryPulse 2s infinite",
                    }}
                >
                    <h2
                        style={{
                            margin: "0 0 30px 0",
                            fontSize: "32px",
                            fontWeight: "bold",
                            background:
                                "linear-gradient(45deg, #ffd700, #ff9800)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                            animation: "titleFloat 3s ease-in-out infinite",
                        }}
                    >
                        🎉恭喜击败BOSS！
                    </h2>
                    <div
                        style={{
                            marginBottom: "30px",
                            fontSize: "20px",
                            opacity: 0.9,
                        }}
                    >
                        <div style={{ marginBottom: "20px" }}>
                            通关时间: {formatTime(survivalTime)}
                        </div>
                        <div style={{ marginBottom: "20px" }}>
                            剩余血量: {remainingHealth}%
                        </div>
                        <div
                            style={{
                                fontSize: "24px",
                                color: "#ffd700",
                                fontWeight: "bold",
                                marginBottom: "20px",
                                animation: "textGlow 2s infinite",
                            }}
                        >
                            最终得分: {score}
                        </div>
                        <div
                            style={{
                                fontSize: "24px",
                                opacity: 0.8,
                                marginBottom: "20px",
                                animation: "textGlow 2s infinite",
                            }}
                        >
                            你是最强的牛马！
                        </div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            gap: "20px",
                            justifyContent: "center",
                        }}
                    >
                        <button
                            onClick={onContinue}
                            style={{
                                padding: "15px 30px",
                                fontSize: "18px",
                                fontWeight: "bold",
                                color: "white",
                                background:
                                    "linear-gradient(90deg, #ffd700, #ff9800)",
                                border: "none",
                                borderRadius: "25px",
                                cursor: "pointer",
                                boxShadow: "0 4px 15px rgba(255, 215, 0, 0.3)",
                                transform: "scale(1)",
                                transition: "all 0.2s ease-out",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.05)";
                                e.currentTarget.style.boxShadow =
                                    "0 6px 20px rgba(255, 215, 0, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.boxShadow =
                                    "0 4px 15px rgba(255, 215, 0, 0.3)";
                            }}
                        >
                            继续挑战
                        </button>
                        <button
                            onClick={() => setShowLeaderboard(true)}
                            style={{
                                padding: "15px 30px",
                                fontSize: "18px",
                                fontWeight: "bold",
                                color: "white",
                                background:
                                    "linear-gradient(90deg, #3498db, #2980b9)",
                                border: "none",
                                borderRadius: "25px",
                                cursor: "pointer",
                                boxShadow: "0 4px 15px rgba(52, 152, 219, 0.3)",
                                transform: "scale(1)",
                                transition: "all 0.2s ease-out",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.05)";
                                e.currentTarget.style.boxShadow =
                                    "0 6px 20px rgba(52, 152, 219, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.boxShadow =
                                    "0 4px 15px rgba(52, 152, 219, 0.3)";
                            }}
                        >
                            查看排行
                        </button>
                    </div>
                </div>
            </div>
            <Leaderboard
                isVisible={showLeaderboard}
                onClose={() => setShowLeaderboard(false)}
            />
            <style>
                {`
                    @keyframes fall {
                        0% {
                            transform: translateY(0) rotate(0deg);
                            opacity: 1;
                        }
                        100% {
                            transform: translateY(100vh) rotate(360deg);
                            opacity: 0;
                        }
                    }
                    @keyframes victoryPulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.02); }
                        100% { transform: scale(1); }
                    }
                    @keyframes titleFloat {
                        0% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                        100% { transform: translateY(0); }
                    }
                    @keyframes textGlow {
                        0% { text-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
                        50% { text-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
                        100% { text-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
                    }
                `}
            </style>
        </>
    );
}
