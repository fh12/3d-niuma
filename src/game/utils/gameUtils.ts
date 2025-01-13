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
    private bossDeadSound: HTMLAudioElement;
    private bossSoundEffect: HTMLAudioElement;
    private backgroundMusic: HTMLAudioElement;

    constructor() {
        // 初始化所有音频元素
        this.shootSound = new Audio("/sounds/shot.mp3");
        this.bossDeadSound = new Audio("/sounds/boss-dead.mp3");
        this.bossSoundEffect = new Audio("/sounds/boss-sound.mp3");
        this.backgroundMusic = new Audio("/sounds/music.mp3");

        // 设置背景音乐循环播放
        this.backgroundMusic.loop = true;
        // 设置背景音乐音量
        this.backgroundMusic.volume = 0.5;
    }

    // 播放射击音效
    playShootSound() {
        this.shootSound.currentTime = 0;
        this.shootSound.play().catch(() => {});
    }

    // 播放Boss死亡音效
    playBossDeadSound() {
        this.bossDeadSound.currentTime = 0;
        this.bossDeadSound.play().catch(() => {});
    }

    // 播放Boss音效
    playBossSound() {
        this.bossSoundEffect.currentTime = 0;
        this.bossSoundEffect.play().catch(() => {});
    }

    // 开始播放背景音乐
    startBackgroundMusic() {
        this.backgroundMusic.play().catch(() => {});
    }

    // 暂停背景音乐
    pauseBackgroundMusic() {
        this.backgroundMusic.pause();
    }

    // 清理所有音频
    cleanup() {
        this.shootSound.pause();
        this.bossDeadSound.pause();
        this.bossSoundEffect.pause();
        this.backgroundMusic.pause();

        this.shootSound.currentTime = 0;
        this.bossDeadSound.currentTime = 0;
        this.bossSoundEffect.currentTime = 0;
        this.backgroundMusic.currentTime = 0;
    }
}

