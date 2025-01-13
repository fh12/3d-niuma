import React from "react";

interface GameOverModalProps {
    onRestart: () => void;
    survivalTime: number;
}

export function GameOverModal({ onRestart, survivalTime }: GameOverModalProps) {
    // 格式化时间显示
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;
    };

    // 计算评级和超越百分比
    const calculateRank = (
        seconds: number
    ): { rank: string; color: string; percentage: number } => {
        // 评级标准（秒）
        const ranks = [
            { threshold: 120, rank: "SSS", color: "#FFD700", percentage: 99.9 }, // 2分钟
            { threshold: 60, rank: "SS", color: "#FFA500", percentage: 99 }, // 1分钟
            { threshold: 45, rank: "S", color: "#FF4500", percentage: 95 }, // 45秒
            { threshold: 30, rank: "A", color: "#FF6B6B", percentage: 85 }, // 30秒
            { threshold: 20, rank: "B", color: "#4CAF50", percentage: 70 }, // 20秒
            { threshold: 10, rank: "C", color: "#2196F3", percentage: 50 }, // 10秒
            { threshold: 0, rank: "D", color: "#9E9E9E", percentage: 20 }, // 其他
        ];

        const rank =
            ranks.find((r) => seconds >= r.threshold) ||
            ranks[ranks.length - 1];
        return rank;
    };

    const rankInfo = calculateRank(survivalTime);

    return (
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
            }}
        >
            <div
                style={{
                    background: "linear-gradient(135deg, #2c3e50, #34495e)",
                    padding: "40px",
                    borderRadius: "20px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    textAlign: "center",
                    color: "white",
                    minWidth: "300px",
                }}
            >
                <h2
                    style={{
                        margin: "0 0 30px 0",
                        fontSize: "28px",
                        fontWeight: "bold",
                        background: "linear-gradient(45deg, #e74c3c, #c0392b)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                    }}
                >
                    牛马被BOSS干死了...
                </h2>
                <div
                    style={{
                        marginBottom: "30px",
                        fontSize: "18px",
                        opacity: 0.9,
                    }}
                >
                    <div style={{ marginBottom: "20px" }}>
                        生存时间: {formatTime(survivalTime)}
                    </div>
                    <div
                        style={{
                            fontSize: "48px",
                            fontWeight: "bold",
                            color: rankInfo.color,
                            textShadow: `0 0 10px ${rankInfo.color}`,
                            margin: "20px 0",
                            animation: "rankPulse 2s infinite",
                        }}
                    >
                        {rankInfo.rank}
                    </div>
                    <div
                        style={{
                            fontSize: "16px",
                            opacity: 0.8,
                            marginBottom: "20px",
                        }}
                    >
                        超越了 {rankInfo.percentage}% 的牛马
                    </div>
                    <div
                        style={{
                            fontSize: "16px",
                            opacity: 0.7,
                            fontStyle: "italic",
                        }}
                    >
                        继续努力，下次一定能行！
                    </div>
                </div>
                <button
                    onClick={onRestart}
                    style={{
                        padding: "15px 40px",
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "white",
                        background: "linear-gradient(90deg, #2ecc71, #27ae60)",
                        border: "none",
                        borderRadius: "25px",
                        cursor: "pointer",
                        boxShadow: "0 4px 15px rgba(46, 204, 113, 0.3)",
                        transform: "scale(1)",
                        transition: "all 0.2s ease-out",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                        e.currentTarget.style.boxShadow =
                            "0 6px 20px rgba(46, 204, 113, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow =
                            "0 4px 15px rgba(46, 204, 113, 0.3)";
                    }}
                >
                    快！扶我起来
                </button>
            </div>
            <style>
                {`
                    @keyframes rankPulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                        100% { transform: scale(1); }
                    }
                `}
            </style>
        </div>
    );
}

