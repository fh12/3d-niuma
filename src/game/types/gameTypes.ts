import * as THREE from "three";
import { BulletType } from "../Monster";

// 声明 NodeJS 类型
declare global {
    namespace NodeJS {
        interface Timeout {}
    }
}

// 子弹接口
export interface BulletData {
    id: number;
    position: [number, number, number];
    direction: THREE.Vector3;
    target: { id: number; position: [number, number, number] } | null;
    type?: BulletType;
}

// 怪物接口
export interface Monster {
    id: number;
    position: [number, number, number];
}

// 游戏状态接口
export interface GameState {
    monstersCount: number;
    playerHealth: number;
    score: number;
}

// 游戏配置接口
export interface GameConfig {
    TOUCH_THROTTLE: number;
    MIN_SPAWN_INTERVAL: number;
    SPAWN_DELAY_AFTER_EVENT: number;
    SHOOT_COOLDOWN: number;
    AUTO_AIM_RANGE: number;
    VIEW_ANGLE: number;
}

// 礼物类型枚举
export enum GiftType {
    HEALTH_BOOST = "HEALTH_BOOST", // 恢复生命值
    DAMAGE_BOOST = "DAMAGE_BOOST", // 增加攻击力
    SPEED_BOOST = "SPEED_BOOST", // 增加移动速度
    SHIELD = "SHIELD", // 临时护盾
}

// 礼物接口
export interface Gift {
    id: number;
    position: [number, number, number];
    type: GiftType;
    active: boolean;
}

