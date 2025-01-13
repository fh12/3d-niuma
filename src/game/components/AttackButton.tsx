interface AttackButtonProps {
    onAttack: () => void;
}

export function AttackButton({ onAttack }: AttackButtonProps) {
    const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onAttack();
    };

    return (
        <div
            style={{
                position: "fixed",
                right: "20px",
                bottom: "20px",
                width: "120px",
                height: "120px",
                borderRadius: "60px",
                background:
                    "radial-gradient(circle at center, #ff4757, #ff6b81)",
                border: "3px solid rgba(255, 255, 255, 0.15)",
                boxShadow: `
                    0 0 20px rgba(255, 71, 87, 0.4),
                    0 0 40px rgba(255, 71, 87, 0.2),
                    inset 0 0 15px rgba(255, 255, 255, 0.1)
                `,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: "bold",
                color: "white",
                userSelect: "none",
                touchAction: "none",
                zIndex: 1000,
                transform: "scale(1)",
                transition:
                    "transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
            }}
            onMouseDown={() => {
                const button = document.querySelector(
                    "[data-attack-button]"
                ) as HTMLElement;
                if (button) {
                    button.style.transform = "scale(0.95)";
                    button.style.boxShadow = `
                        0 0 10px rgba(255, 71, 87, 0.4),
                        0 0 20px rgba(255, 71, 87, 0.2),
                        inset 0 0 15px rgba(255, 255, 255, 0.1)
                    `;
                }
            }}
            onMouseUp={() => {
                const button = document.querySelector(
                    "[data-attack-button]"
                ) as HTMLElement;
                if (button) {
                    button.style.transform = "scale(1)";
                    button.style.boxShadow = `
                        0 0 20px rgba(255, 71, 87, 0.4),
                        0 0 40px rgba(255, 71, 87, 0.2),
                        inset 0 0 15px rgba(255, 255, 255, 0.1)
                    `;
                }
            }}
            onClick={handleInteraction}
            onTouchStart={(e) => {
                handleInteraction(e);
                const button = e.currentTarget;
                button.style.transform = "scale(0.95)";
                button.style.boxShadow = `
                    0 0 10px rgba(255, 71, 87, 0.4),
                    0 0 20px rgba(255, 71, 87, 0.2),
                    inset 0 0 15px rgba(255, 255, 255, 0.1)
                `;
            }}
            onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const button = e.currentTarget;
                button.style.transform = "scale(1)";
                button.style.boxShadow = `
                    0 0 20px rgba(255, 71, 87, 0.4),
                    0 0 40px rgba(255, 71, 87, 0.2),
                    inset 0 0 15px rgba(255, 255, 255, 0.1)
                `;
            }}
            data-attack-button
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                }}
            >
                <span style={{ fontSize: "32px" }}>⚔️</span>
                <span>攻击</span>
            </div>
        </div>
    );
}
