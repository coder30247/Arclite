import Phaser from "phaser";
import { Bullet } from "./Bullet";

export function preload_bullets(scene) {
    scene.load.image(
        "bullet",
        "https://labs.phaser.io/assets/sprites/bullet.png"
    );
}

export function setup_bullets(scene) {
    // Reserved for future bullet pool setup if needed
    scene.can_shoot = true;
    scene.bullet_counter = 0;
}

export function spawn_bullet(
    scene,
    bullet_id,
    x,
    y,
    c_x,
    c_y,
    shooter_id,
    bullet_map
) {
    const bullet = new Bullet(scene, x, y);
    if (!bullet) {
        console.error("❌ Failed to create bullet instance");
        return null;
    }

    bullet.init({
        bullet_id,
        speed: 400,
        damage: 20,
        lifetime: 2000,
        shooter_id,
        direction: { x: c_x, y: c_y },
    });

    bullet_map.set(bullet_id, bullet);

    const dx = c_x - x;
    const dy = c_y - y;
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    const v_x = (dx / magnitude) * bullet.speed;
    const v_y = (dy / magnitude) * bullet.speed;

    bullet.enableBody(true, x, y, true, true);
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body.setAllowGravity(false);
    bullet.setScale(0.5);
    bullet.setVelocity(v_x, v_y);

    scene.time.delayedCall(bullet.lifetime, () => {
        bullet.destroy();
        bullet_map.delete(bullet_id);
    });

    return bullet;
}

export function shoot_bullets(scene, socket, room_id, bullet_map) {
    const shooter = scene.player;
    const your_id = shooter?.firebase_uid;
    if (!shooter || !scene.can_shoot) return;

    const pointer = scene.input.activePointer;
    if (pointer.isDown) {
        scene.can_shoot = false;
        scene.time.delayedCall(300, () => (scene.can_shoot = true));

        const bullet_id = `${your_id}_${Date.now()}_${scene.bullet_counter++}`;
        const world_point = scene.cameras.main.getWorldPoint(
            pointer.x,
            pointer.y
        );

        socket.emit("bullet:spawn", {
            bullet_id,
            shooter_id: your_id,
            x: shooter.x,
            y: shooter.y,
            c_x: world_point.x,
            c_y: world_point.y,
            room_id,
        });

        spawn_bullet(
            scene,
            bullet_id,
            shooter.x,
            shooter.y,
            world_point.x,
            world_point.y,
            your_id,
            bullet_map
        );
    }
}

export function sync_bullets(bullet_map, socket, room_id) {
    bullet_map.forEach((bullet, bullet_id) => {
        socket.emit("bullet:update", {
            bullet_id,
            x: bullet.x,
            y: bullet.y,
            room_id,
        });
    });
}
