import * as THREE from "three";
import { BaseBullet, BaseBulletProps, BulletProperties } from "./BaseBullet";
import { BulletType } from "../Monster";

// 火焰环子弹的特定属性
const flameRingProperties: BulletProperties = {
    speed: 15,
    damage: 1,
    size: 1.0,
    color: "#ff6600",
    collisionRadius: 2.5,
    cooldown: 500,
    lifetime: 3000,
    geometry: new THREE.TorusGeometry(2, 0.3, 8, 32),
    material: new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.7,
    }),
};

export function FlameRingBullet(props: Omit<BaseBulletProps, "type">) {
    return (
        <BaseBullet
            {...props}
            type={BulletType.FLAME_RING}
            properties={flameRingProperties}
        />
    );
}
