// 音频资源URL
export const AUDIO_URLS = {
    shot: "/game/assets/sounds/shot.mp3",
    bossDead: "/game/assets/sounds/boss-dead.mp3",
    bossSound: "/game/assets/sounds/boss-sound.mp3",
    music: "/game/assets/sounds/music.mp3",
};

// 音频上下文
const audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)();

// 音频缓存
interface AudioResource {
    buffer: AudioBuffer;
    source?: AudioBufferSourceNode;
    gainNode: GainNode;
}

const audioCache: { [key: string]: AudioResource } = {};
const loadingPromises: { [key: string]: Promise<void> } = {};

// 使用 fetch 加载音频
async function loadAudioFile(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load audio: ${response.statusText}`);
    }
    return response.arrayBuffer();
}

// 解码音频数据
async function decodeAudioData(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
        audioContext.decodeAudioData(arrayBuffer, resolve, reject);
    });
}

// 加载单个音频
async function loadSingleAudio(url: string): Promise<void> {
    if (!loadingPromises[url]) {
        loadingPromises[url] = new Promise(async (resolve, reject) => {
            try {
                // 如果已经加载完成，直接返回
                if (audioCache[url]?.buffer) {
                    resolve();
                    return;
                }

                // 加载并解码音频文件
                const arrayBuffer = await loadAudioFile(url);
                const audioBuffer = await decodeAudioData(arrayBuffer);

                // 创建增益节点用于音量控制
                const gainNode = audioContext.createGain();
                gainNode.connect(audioContext.destination);

                audioCache[url] = {
                    buffer: audioBuffer,
                    gainNode,
                };

                resolve();
            } catch (error) {
                console.error(`Error loading audio ${url}:`, error);
                reject(error);
            }
        });
    }
    return loadingPromises[url];
}

// 播放音频
function playAudio(url: string, volume = 1, loop = false) {
    const resource = audioCache[url];
    if (!resource) {
        console.warn(`Audio ${url} not loaded`);
        return;
    }

    // 停止之前的播放
    if (resource.source) {
        resource.source.stop();
    }

    // 创建新的音源
    const source = audioContext.createBufferSource();
    source.buffer = resource.buffer;
    source.loop = loop;

    // 设置音量
    resource.gainNode.gain.value = volume;

    // 连接节点
    source.connect(resource.gainNode);

    // 开始播放
    source.start(0);
    resource.source = source;

    return source;
}

// 停止音频
function stopAudio(url: string) {
    const resource = audioCache[url];
    if (resource?.source) {
        resource.source.stop();
        resource.source = undefined;
    }
}

// 设置音量
function setVolume(url: string, volume: number) {
    const resource = audioCache[url];
    if (resource) {
        resource.gainNode.gain.value = volume;
    }
}

// 导出音频控制接口
export const sounds = {
    shot: {
        play: (volume = 1) => playAudio(AUDIO_URLS.shot, volume),
        stop: () => stopAudio(AUDIO_URLS.shot),
        setVolume: (volume: number) => setVolume(AUDIO_URLS.shot, volume),
    },
    bossDead: {
        play: (volume = 1) => playAudio(AUDIO_URLS.bossDead, volume),
        stop: () => stopAudio(AUDIO_URLS.bossDead),
        setVolume: (volume: number) => setVolume(AUDIO_URLS.bossDead, volume),
    },
    bossSound: {
        play: (volume = 1) => playAudio(AUDIO_URLS.bossSound, volume),
        stop: () => stopAudio(AUDIO_URLS.bossSound),
        setVolume: (volume: number) => setVolume(AUDIO_URLS.bossSound, volume),
    },
    music: {
        play: (volume = 1) => playAudio(AUDIO_URLS.music, volume, true), // 背景音乐默认循环
        stop: () => stopAudio(AUDIO_URLS.music),
        setVolume: (volume: number) => setVolume(AUDIO_URLS.music, volume),
    },
};

// 预加载所有音频
export function preloadSounds(): Promise<void[]> {
    const audioUrls = Object.values(AUDIO_URLS);
    return Promise.all(audioUrls.map((url) => loadSingleAudio(url)));
}
