// 音效管理器
class SoundManager {
    private static instance: SoundManager;
    private sounds: Map<string, HTMLAudioElement>;

    private constructor() {
        this.sounds = new Map();
        this.initSounds();
    }

    private initSounds() {
        // 初始化音效
        const shotSound = new Audio("/assets/shot.mp3");
        const enemyDeadSound = new Audio("/assets/enemy-dead.mp3");

        // 预加载音效
        shotSound.load();
        enemyDeadSound.load();

        // 存储音效
        this.sounds.set("shot", shotSound);
        this.sounds.set("enemyDead", enemyDeadSound);
    }

    public static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    public playSound(soundName: string) {
        const sound = this.sounds.get(soundName);
        if (sound) {
            // 克隆音效节点以支持重叠播放
            const soundClone = sound.cloneNode() as HTMLAudioElement;
            soundClone.volume = 0.3; // 设置音量
            soundClone.play().catch(console.error);
        }
    }
}

export const soundManager = SoundManager.getInstance();

