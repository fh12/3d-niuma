import React, { useState, useEffect } from "react";

interface LeaderboardEntry {
    id: number;
    name: string;
    score: number;
    completion_time: number;
    remaining_health: number;
    updated_at: string;
}

interface LeaderboardProps {
    isVisible: boolean;
    onClose: () => void;
}

export function Leaderboard({ isVisible, onClose }: LeaderboardProps) {
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
        []
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 格式化时间显示
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;
    };

    // 获取排行榜数据
    useEffect(() => {
        if (!isVisible) return;

        const fetchLeaderboard = async () => {
            try {
                setIsLoading(true);
                const response = await fetch("/bpi/users/leaderboard");
                if (!response.ok) {
                    throw new Error("获取排行榜失败");
                }
                const data = await response.json();
                setLeaderboardData(data);
            } catch (error) {
                console.error("获取排行榜错误:", error);
                setError("获取排行榜失败，请稍后再试");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, [isVisible]);

    if (!isVisible) return null;

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
                    padding: "20px",
                    borderRadius: "20px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "white",
                    minWidth: "80%",
                    maxWidth: "600px",
                    maxHeight: "80vh",
                    overflowY: "auto",
                }}
            >
                <h2
                    style={{
                        margin: "0 0 30px 0",
                        fontSize: "28px",
                        fontWeight: "bold",
                        textAlign: "center",
                        background: "linear-gradient(45deg, #3498db, #2980b9)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    🏆 牛马排行榜 🏆
                </h2>

                {isLoading ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        加载中...
                    </div>
                ) : error ? (
                    <div
                        style={{
                            textAlign: "center",
                            color: "#ff6b6b",
                            padding: "20px",
                        }}
                    >
                        {error}
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                            }}
                        >
                            <thead>
                                <tr
                                    style={{
                                        borderBottom:
                                            "2px solid rgba(255,255,255,0.1)",
                                    }}
                                >
                                    <th
                                        style={{
                                            padding: "10px",
                                            textAlign: "center",
                                        }}
                                    >
                                        排名
                                    </th>
                                    <th
                                        style={{
                                            padding: "10px",
                                            textAlign: "left",
                                        }}
                                    >
                                        牛马
                                    </th>
                                    <th
                                        style={{
                                            padding: "10px",
                                            textAlign: "right",
                                        }}
                                    >
                                        通关时间
                                    </th>
                                    <th
                                        style={{
                                            padding: "10px",
                                            textAlign: "right",
                                        }}
                                    >
                                        分数
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboardData.map((entry, index) => (
                                    <tr
                                        key={entry.id}
                                        style={{
                                            borderBottom:
                                                "1px solid rgba(255,255,255,0.05)",
                                            background:
                                                index === 0
                                                    ? "linear-gradient(90deg, rgba(255,215,0,0.1), transparent)"
                                                    : undefined,
                                        }}
                                    >
                                        <td
                                            style={{
                                                padding: "10px",
                                                textAlign: "center",
                                            }}
                                        >
                                            {index === 0
                                                ? "🥇"
                                                : index === 1
                                                ? "🥈"
                                                : index === 2
                                                ? "🥉"
                                                : index + 1}
                                        </td>
                                        <td
                                            style={{
                                                padding: "10px",
                                                maxWidth: "120px",
                                                position: "relative",
                                                overflow: "hidden",
                                            }}
                                        >
                                            <div
                                                className="player-name-container"
                                                style={{
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    position: "relative",
                                                    cursor: "pointer",
                                                }}
                                                onTouchStart={(e) => {
                                                    const container =
                                                        e.currentTarget;
                                                    const textSpan =
                                                        container.querySelector(
                                                            ".player-name-text"
                                                        ) as HTMLElement;
                                                    if (
                                                        textSpan &&
                                                        textSpan.offsetWidth >
                                                            container.clientWidth
                                                    ) {
                                                        textSpan.style.animation =
                                                            "none";
                                                        textSpan.offsetHeight; // 触发重排
                                                        const distance = -(
                                                            textSpan.offsetWidth -
                                                            container.clientWidth +
                                                            10
                                                        );
                                                        textSpan.style.setProperty(
                                                            "--scroll-distance",
                                                            `${distance}px`
                                                        );
                                                        const duration =
                                                            Math.max(
                                                                Math.abs(
                                                                    distance
                                                                ) / 40,
                                                                2
                                                            );
                                                        textSpan.style.animation = `scrollText ${duration}s linear`;
                                                    }
                                                }}
                                                onTouchEnd={(e) => {
                                                    const textSpan =
                                                        e.currentTarget.querySelector(
                                                            ".player-name-text"
                                                        ) as HTMLElement;
                                                    if (textSpan) {
                                                        textSpan.style.animation =
                                                            "none";
                                                    }
                                                }}
                                            >
                                                <span
                                                    className="player-name-text"
                                                    style={{
                                                        display: "inline-block",
                                                        position: "relative",
                                                    }}
                                                >
                                                    {entry.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td
                                            style={{
                                                padding: "10px",
                                                textAlign: "right",
                                            }}
                                        >
                                            {formatTime(entry.completion_time)}
                                        </td>
                                        <td
                                            style={{
                                                padding: "10px",
                                                textAlign: "right",
                                                color: "#ffd700",
                                                fontWeight:
                                                    index === 0
                                                        ? "bold"
                                                        : "normal",
                                            }}
                                        >
                                            {entry.score}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div style={{ textAlign: "center", marginTop: "30px" }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: "12px 30px",
                            fontSize: "16px",
                            fontWeight: "bold",
                            color: "white",
                            background:
                                "linear-gradient(90deg, #e74c3c, #c0392b)",
                            border: "none",
                            borderRadius: "20px",
                            cursor: "pointer",
                            transition: "all 0.2s ease-out",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                        }}
                    >
                        关闭
                    </button>
                </div>
            </div>
            <style>
                {`
                    @keyframes scrollText {
                        0% { transform: translateX(0); }
                        15% { transform: translateX(0); }
                        85% { transform: translateX(var(--scroll-distance)); }
                        100% { transform: translateX(var(--scroll-distance)); }
                    }
                    .player-name-container {
                        padding: 2px 0;
                        transition: all 0.3s ease;
                    }
                    .player-name-container:active {
                        opacity: 0.8;
                    }
                    .player-name-text {
                        will-change: transform;
                    }
                `}
            </style>
        </div>
    );
}
