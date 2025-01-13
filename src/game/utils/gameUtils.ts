import * as THREE from "three";

// 生成随机位置
export const generateRandomPosition = (): [number, number, number] => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 15; // 固定在15单位距离生成
    return [
        Math.cos(angle) * radius,
        1, // 将高度改为1，与玩家同高度
        Math.sin(angle) * radius,
    ];
};

// 计算摇杆位置
export function calculateJoystickPosition(
    touch: Touch,
    container: DOMRect,
    startPos: { x: number; y: number },
    maxRadius: number
) {
    // 计算相对于摇杆容器的触摸位置
    const touchX = touch.clientX - container.left;
    const touchY = touch.clientY - container.top;

    // 计算相对于摇杆中心的偏移
    const centerX = container.width / 2;
    const centerY = container.height / 2;
    const dx = touchX - centerX;
    const dy = touchY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 如果在最大半径内，直接返回当前位置
    if (distance <= maxRadius) {
        return {
            x: touchX,
            y: touchY,
        };
    }

    // 否则计算限制后的位置
    const angle = Math.atan2(dy, dx);
    return {
        x: centerX + Math.cos(angle) * maxRadius,
        y: centerY + Math.sin(angle) * maxRadius,
    };
}

// 音频工具
export class AudioManager {
    private shootSound: HTMLAudioElement;
    private powerUpSound: HTMLAudioElement;

    constructor() {
        this.shootSound = new Audio("/sounds/shoot.mp3");
        this.powerUpSound = new Audio("/sounds/powerup.mp3");
    }

    playShootSound() {
        this.shootSound.currentTime = 0;
        this.shootSound.play().catch(() => {});
    }

    playPowerUpSound() {
        this.powerUpSound.currentTime = 0;
        this.powerUpSound.play().catch(() => {});
    }

    cleanup() {
        this.shootSound.pause();
        this.powerUpSound.pause();
        this.shootSound.currentTime = 0;
        this.powerUpSound.currentTime = 0;
    }
}

