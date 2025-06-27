import Phaser from "phaser";
import { Bullet } from "./Bullet";

let bullets;
let can_shoot = true;
let bullet_counter = 0;

export function preload_bullets(scene) {
    scene.load.image(
        "bullet",
        "https://labs.phaser.io/assets/sprites/bullet.png"
    );
}

export function setup_bullets(scene) {
    bullets = scene.physics.add.group({
        classType: Bullet,
        maxSize: 50,
        runChildUpdate: false,
    });
}

export function spawn_bullet(scene, bullet_id, x, y, c_x, c_y, shooter_id) {
    const bullet = bullets.get(x, y, "bullet");

    if (!bullet) return;

    // Initialize bullet properties
    bullet.init({
        bullet_id,
        speed: 400,
        damage: 20,
        lifetime: 2000,
        shooter_id,
        direction: { x: c_x, y: c_y },
    });

    // Calculate normalized velocity vector
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

    // Auto-destroy bullet after lifetime
    scene.time.delayedCall(bullet.lifetime, () => {
        bullets.killAndHide(bullet);
        bullet.body.enable = false;
    });

    return bullet;
}

export function update_bullets(scene, socket, room_id) {
    const shooter = scene.player;
    const your_id = shooter.firebase_uid;
    if (!shooter || !can_shoot) return;

    const pointer = scene.input.activePointer;
    if (pointer.isDown) {
        can_shoot = false;
        setTimeout(() => (can_shoot = true), 300);

        const bullet_id = `${your_id}_${Date.now()}_${bullet_counter++}`;
        const world_point = scene.cameras.main.getWorldPoint(
            pointer.x,
            pointer.y
        );

        // Emit bullet spawn to server
        socket.emit("bullet:spawn", {
            bullet_id,
            shooter_id: your_id,
            x: shooter.x,
            y: shooter.y,
            c_x: world_point.x,
            c_y: world_point.y,
            room_id,
        });

        // Spawn locally
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

    // Emit position updates for active bullets
    bullets.getChildren().forEach((bullet) => {
        if (bullet.active && bullet.visible) {
            socket.emit("bullet:update", {
                bullet_id: bullet.bullet_id,
                x: bullet.x,
                y: bullet.y,
                room_id,
            });
        }
    });
}

// Optional: access to group
export function get_bullets() {
    return bullets;
}
