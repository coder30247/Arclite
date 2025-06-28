import Phaser from "phaser";
import { Bullet } from "./Bullet";

export function preload_bullets(scene) {
    scene.load.image(
        "bullet",
        "https://labs.phaser.io/assets/sprites/bullet.png"
    );
}

export function setup_bullets(scene) {
    scene.can_shoot = true;
    scene.bullet_counter = 0;

    // Create a bullet physics group
    scene.bullet_group = scene.physics.add.group();
}

export function spawn_bullet(scene, bullet_id, x, y, c_x, c_y, shooter_id) {
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

    scene.bullet_group.add(bullet); // Add to group for physics

    const dx = c_x - x;
    const dy = c_y - y;
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    const v_x = (dx / magnitude) * bullet.speed;
    const v_y = (dy / magnitude) * bullet.speed;

    bullet.enableBody(true, x, y, true, true);
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body.setAllowGravity(false); // No gravity
    bullet.setScale(0.5);
    bullet.setVelocity(v_x, v_y);

    scene.time.delayedCall(bullet.lifetime, () => {
        bullet.destroy();
    });

    return bullet;
}

export function shoot_bullets(scene, socket, room_id) {
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
            your_id
        );
    }
}

export function sync_bullets(scene, socket, room_id) {
    scene.bullet_group.getChildren().forEach((bullet) => {
        socket.emit("bullet:update", {
            bullet_id: bullet.bullet_id,
            x: bullet.x,
            y: bullet.y,
            room_id,
        });
    });
}
