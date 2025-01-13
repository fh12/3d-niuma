import React, { useState, useEffect } from "react";

interface LoadingScreenProps {
    onStart: () => void;
}

export function LoadingScreen({ onStart }: LoadingScreenProps) {
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 模拟资源加载进度
        const interval = setInterval(() => {
            setLoadingProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsLoading(false);
                    return 100;
                }
                return prev + Math.random() * 15;
            });
        }, 200);

        return () => clearInterval(interval);
    }, []);

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
            }}
        >
            <div
                style={{
                    fontSize: "32px",
                    color: "white",
                    marginBottom: "40px",
                    fontWeight: "bold",
                    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                }}
            >
                牛马大作战
            </div>

            {isLoading ? (
                <div
                    style={{
                        width: "300px",
                        position: "relative",
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            height: "4px",
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: "2px",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                width: `${Math.min(loadingProgress, 100)}%`,
                                height: "100%",
                                background:
                                    "linear-gradient(90deg, #2ecc71, #27ae60)",
                                transition: "width 0.2s ease-out",
                                borderRadius: "2px",
                            }}
                        />
                    </div>
                    <div
                        style={{
                            color: "rgba(255,255,255,0.8)",
                            fontSize: "14px",
                            marginTop: "12px",
                            textAlign: "center",
                        }}
                    >
                        资源加载中...{" "}
                        {Math.min(Math.round(loadingProgress), 100)}%
                    </div>
                </div>
            ) : (
                <button
                    onClick={onStart}
                    style={{
                        padding: "16px 40px",
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "white",
                        background: "linear-gradient(90deg, #2ecc71, #27ae60)",
                        border: "none",
                        borderRadius: "30px",
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
                    开始工作
                </button>
            )}
        </div>
    );
}
