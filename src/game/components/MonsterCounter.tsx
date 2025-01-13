interface MonsterCounterProps {
    count: number;
}

export function MonsterCounter({ count }: MonsterCounterProps) {
    return (
        <div
            style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "rgba(0, 0, 0, 0.5)",
                color: "white",
                padding: "10px",
                borderRadius: "5px",
                zIndex: 1000,
                fontSize: "18px",
                fontWeight: "bold",
            }}
        >
            怪物数量: {count}
        </div>
    );
}
