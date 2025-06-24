import Phaser from "phaser";
import Bullet from "./Bullet.js"; // <-- use the new class

export function preload_bullets(scene) {
    scene.load.image(
        "bullet",
        "https://labs.phaser.io/assets/sprites/bullet.png"
    );
}

export function spawn_bullet(scene, x, y, direction, speed = 400) {
    const bullet = new Bullet(scene, x, y, direction, speed);

    // Create group if needed, and add bullet to it
    if (!scene.bullets) {
        scene.bullets = scene.physics.add.group();
    }

    scene.bullets.add(bullet);

    return bullet;
}

export function update_bullets(scene, socket, room_id, your_id) {
    if (
        scene.player &&
        Phaser.Input.Keyboard.JustDown(scene.input.keyboard.addKey("SPACE"))
    ) {
        const { x, y } = scene.player;
        const direction = scene.player.flipX ? -1 : 1;

        socket.emit("bullet:fire", {
            room_id,
            x,
            y,
            direction,
            shooter_id: your_id,
        });

        spawn_bullet(scene, x, y, direction);
    }
}
