import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useGLTF } from "@react-three/drei";
import { preloadSounds, AUDIO_URLS } from "../assets/sounds";

interface LoadingScreenProps {
    onStart: () => void;
}

// 预加载资源列表
const PRELOAD_RESOURCES = {
    models: [
        "/game/assets/models/character.glb",
        "/game/assets/models/enemy.glb",
    ],
    textures: ["/game/assets/textures/grass/grass_color.jpg"],
};

// 加载状态追踪
interface LoadingState {
    models: boolean[];
    textures: boolean[];
    audio: boolean;
}

async function preloadResources(onProgress: (progress: number) => void) {
    const loadingState: LoadingState = {
        models: new Array(PRELOAD_RESOURCES.models.length).fill(false),
        textures: new Array(PRELOAD_RESOURCES.textures.length).fill(false),
        audio: false,
    };

    function updateProgress() {
        const totalItems =
            loadingState.models.length + loadingState.textures.length + 1; // 音频作为一个整体

        const loadedItems =
            loadingState.models.filter(Boolean).length +
            loadingState.textures.filter(Boolean).length +
            (loadingState.audio ? 1 : 0);

        const progress = (loadedItems / totalItems) * 100;
        onProgress(progress);
    }

    // 预加载3D模型
    const modelPromises = PRELOAD_RESOURCES.models.map(
        async (modelUrl, index) => {
            try {
                await useGLTF.preload(modelUrl);
                loadingState.models[index] = true;
                updateProgress();
            } catch (error) {
                console.error(`Error loading model ${modelUrl}:`, error);
                // 即使加载失败也标记为完成，避免卡在加载界面
                loadingState.models[index] = true;
                updateProgress();
            }
        }
    );

    // 预加载纹理
    const texturePromises = PRELOAD_RESOURCES.textures.map(
        async (textureUrl, index) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    loadingState.textures[index] = true;
                    updateProgress();
                    resolve(true);
                };
                img.onerror = () => {
                    console.error(`Error loading texture ${textureUrl}`);
                    // 即使加载失败也标记为完成，避免卡在加载界面
                    loadingState.textures[index] = true;
                    updateProgress();
                    resolve(false);
                };
                img.src = textureUrl;
            });
        }
    );

    // 预加载音频
    const audioPromise = preloadSounds()
        .then(() => {
            loadingState.audio = true;
            updateProgress();
        })
        .catch((error) => {
            console.error("Error loading audio:", error);
            // 即使加载失败也标记为完成，避免卡在加载界面
            loadingState.audio = true;
            updateProgress();
        });

    try {
        // 等待所有资源加载完成
        await Promise.all([...modelPromises, ...texturePromises, audioPromise]);
    } catch (error) {
        console.error("Error loading resources:", error);
    }
}

async function recordVisit() {
    try {
        const sessionId: string =
            localStorage.getItem("game_session_id") ||
            (() => {
                const newId = uuidv4();
                localStorage.setItem("game_session_id", newId);
                return newId;
            })();

        const response = await fetch("/game-stats/record", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                sessionId,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to record visit: ${response.status} ${errorText}`
            );
        }

        const data = await response.json();
        console.log("Visit recorded successfully:", data);
    } catch (error) {
        console.error("Error recording visit:", error);
    }
}

export function LoadingScreen({ onStart }: LoadingScreenProps) {
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 开始预加载资源
        preloadResources(setLoadingProgress).then(() => {
            setIsLoading(false);
        });
    }, []);

    const handleStart = async () => {
        try {
            await recordVisit();
            onStart();
        } catch (error) {
            console.error("Error starting game:", error);
            onStart();
        }
    };

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
            <div
                style={{
                    fontSize: "16px",
                    color: "rgba(255,255,255,0.7)",
                    marginBottom: "30px",
                    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                }}
            >
                果果AI出品
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
                    onClick={handleStart}
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
                    开始上班
                </button>
            )}
        </div>
    );
}
