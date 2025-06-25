import Phaser from "phaser";

let bullets;
let shoot_key;
let can_shoot = true;
const shoot_cooldown = 300;

let your_id;
let socket;
let room_id;

const bullet_map = new Map(); // key: bullet_id, value: bullet sprite
let bullet_counter = 0;

export function preload_bullets(scene) {
    scene.load.image(
        "bullet",
        "https://labs.phaser.io/assets/sprites/bullet.png"
    );
}

export function setup_bullets(scene, socket, your_id, room_id) {
    bullets = scene.physics.add.group({
        classType: Phaser.Physics.Arcade.Image,
        maxSize: 50,
        runChildUpdate: false,
    });

    shoot_key = scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
    );


    // Listen for remote bullet spawn
    socket.on("bullet:spawn", ({ bullet_id, shooter_id, x, y, direction }) => {
        const bullet = spawn_bullet(scene, bullet_id, x, y, direction);
        bullet_map.set(bullet_id, bullet);
    });

    // Listen for bullet position updates
    socket.on("bullet:update", ({ bullet_id, x, y }) => {
        const bullet = bullet_map.get(bullet_id);
        if (bullet) bullet.setPosition(x, y);
    });
}

export function spawn_bullet(scene, bullet_id, x, y, direction) {
    const bullet = bullets.get(x, y, "bullet");
    if (!bullet) return;

    const offset = direction === "left" ? -20 : 20;
    const velocity = direction === "left" ? -400 : 400;

    bullet.enableBody(true, x + offset, y, true, true);
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body.setAllowGravity(false);
    bullet.setScale(0.5);
    bullet.setVelocityX(velocity);

    scene.time.delayedCall(2000, () => {
        bullets.killAndHide(bullet);
        bullet.body.enable = false;
        bullet_map.delete(bullet_id);
    });

    return bullet;
}

export function update_bullets(scene, socket, room_id, last_direction_faced) {
    const shooter = scene.player;
    if (!shooter || !can_shoot) return;

    const vx = shooter.body.velocity.x;
    if (vx < 0) last_direction_faced.current = "left";
    else if (vx > 0) last_direction_faced.current = "right";

    if (Phaser.Input.Keyboard.JustDown(shoot_key)) {
        can_shoot = false;
        setTimeout(() => (can_shoot = true), shoot_cooldown);

        const direction = last_direction_faced.current;
        const bullet_id = `${your_id}_${Date.now()}_${bullet_counter++}`;

        // Emit spawn info
        socket.emit("bullet:spawn", {
            bullet_id,
            shooter_id: your_id,
            direction,
            x: shooter.x,
            y: shooter.y,
            room_id,
        });

        const bullet = spawn_bullet(
            scene,
            bullet_id,
            shooter.x,
            shooter.y,
            direction
        );
        bullet_map.set(bullet_id, bullet);
    }

    // Host sends position updates
    bullet_map.forEach((bullet, bullet_id) => {
        if (bullet.active && bullet.visible) {
            socket.emit("bullet:update", {
                bullet_id,
                x: bullet.x,
                y: bullet.y,
                room_id,
            });
        }
    });
}
