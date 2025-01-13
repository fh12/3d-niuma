import * as THREE from "three";
import { BaseBullet, BaseBulletProps, BulletProperties } from "./BaseBullet";
import { BulletType } from "../Monster";

// 光束波子弹的特定属性
const beamProperties: BulletProperties = {
    speed: 45,
    damage: 10,
    size: 1.0,
    color: "#ff0000",
    collisionRadius: 2.5,
    cooldown: 500,
    lifetime: 3000,
    geometry: new THREE.CylinderGeometry(0.2, 0.2, 4, 8),
    material: new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.7,
    }),
};

export function BeamBullet(props: Omit<BaseBulletProps, "type">) {
    return (
        <BaseBullet
            {...props}
            type={BulletType.BEAM}
            properties={beamProperties}
        />
    );
}
