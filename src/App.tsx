import { useState } from "react";
import { Scene } from "./game/Scene";

export default function App() {
    const [userId, setUserId] = useState<number | undefined>();

    const handleGameStart = (newUserId: number) => {
        setUserId(newUserId);
    };

    return <Scene userId={userId} onStart={handleGameStart} />;
}

