import React from "react";

interface HealthDisplayProps {
    playerHealth: number;
    monsterHealth: number;
}

export function HealthDisplay({
    playerHealth,
    monsterHealth,
}: HealthDisplayProps) {
    return (
        <div
            style={{
                position: "fixed",
                top: "20px",
                right: "20px",
                background: "rgba(0, 0, 0, 0.7)",
                padding: "10px",
                borderRadius: "5px",
                color: "white",
                fontFamily: "Arial, sans-serif",
                zIndex: 1000,
            }}
        >
            <div style={{ marginBottom: "5px" }}>
                <span style={{ color: "#ff4444" }}>Boss: </span>
                <span>{monsterHealth}</span>
            </div>
            <div>
                <span style={{ color: "#44ff44" }}>Player: </span>
                <span>{playerHealth}</span>
            </div>
        </div>
    );
}
