// lib/Bullet.js
import Phaser from "phaser";

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, direction, speed = 400) {
        super(scene, x, y, "bullet");

        // Add to scene and physics world
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Physics settings
        this.setVelocityX(speed * direction);
        this.setVelocityY(0);
        this.setCollideWorldBounds(true);
        this.setBounce(1);
        this.setDepth(1);

        // ✅ Correctly disable gravity
        this.body.setAllowGravity(false);

        // ✅ Enable individual bullet to destroy on world bounds
        this.body.onWorldBounds = true;

        // Attach destruction once
        this.once("worldbounds", () => {
            this.destroy();
        });
    }
}
