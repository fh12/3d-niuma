import { sounds } from "../assets/sounds";

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

// 音频管理器
export class AudioManager {
    private static instance: AudioManager;
    private backgroundMusicPlaying: boolean = false;

    private constructor() {}

    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    public playShootSound() {
        sounds.shot.play(0.5); // 设置适当的音量
    }

    public playBossDeadSound() {
        sounds.bossDead.play(0.7);
    }

    public playBossSound() {
        sounds.bossSound.play(0.6);
    }

    public startBackgroundMusic() {
        if (!this.backgroundMusicPlaying) {
            sounds.music.play(0.3); // 背景音乐音量较低
            this.backgroundMusicPlaying = true;
        }
    }

    public stopBackgroundMusic() {
        if (this.backgroundMusicPlaying) {
            sounds.music.stop();
            this.backgroundMusicPlaying = false;
        }
    }

    public setBackgroundMusicVolume(volume: number) {
        sounds.music.setVolume(volume);
    }

    public cleanup() {
        this.stopBackgroundMusic();
    }
}

