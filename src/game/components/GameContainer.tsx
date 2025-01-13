interface GameContainerProps {
    children: React.ReactNode;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    onClick?: (e: React.MouseEvent) => void;
}

export function GameContainer({
    children,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onClick,
}: GameContainerProps) {
    return (
        <div
            style={{
                position: "relative",
                width: "100vw",
                height: "100vh",
                touchAction: "none",
                overflow: "hidden",
                background: "#000",
                userSelect: "none",
                WebkitUserSelect: "none",
                WebkitTouchCallout: "none",
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
