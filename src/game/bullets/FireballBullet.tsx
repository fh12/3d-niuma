import * as THREE from "three";
import { BaseBullet, BaseBulletProps, BulletProperties } from "./BaseBullet";
import { BulletType } from "../Monster";

// 火球子弹的特定属性
const fireballProperties: BulletProperties = {
    speed: 15,
    damage: 2,
    size: 1.0,
    color: "#ff0000",
    collisionRadius: 1.5,
    cooldown: 500,
    lifetime: 3000,
    geometry: new THREE.SphereGeometry(1.0, 16, 16),
    material: new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.8,
        toneMapped: false,
    }),
};

export function FireballBullet(props: Omit<BaseBulletProps, "type">) {
    return (
        <>
            {/* 内部火球 */}
            <BaseBullet
                {...props}
                type={BulletType.FIREBALL}
                properties={fireballProperties}
            />
            {/* 外部发光效果 */}
            <BaseBullet
                {...props}
                type={BulletType.FIREBALL}
                properties={{
                    ...fireballProperties,
                    geometry: new THREE.SphereGeometry(1.3, 16, 16),
                    material: new THREE.MeshBasicMaterial({
                        color: 0xff2200,
                        transparent: true,
                        opacity: 0.4,
                        toneMapped: false,
                        side: THREE.DoubleSide,
                        blending: THREE.AdditiveBlending,
                    }),
                }}
            />
        </>
    );
}
