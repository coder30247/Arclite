import Phaser from "phaser";

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    bullet_id;
    speed;
    damage;
    lifetime;
    shooter_id;

    constructor(scene, x, y) {
        super(scene, x, y, "bullet"); // Only call this — NO custom args
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }

    // Use this to initialize bullet props
    init({ bullet_id, speed, damage, lifetime, shooter_id, direction }) {
        this.bullet_id = bullet_id;
        this.speed = speed;
        this.damage = damage;
        this.lifetime = lifetime;
        this.shooter_id = shooter_id;
        this.direction = direction;
        // Optional: safely reset physics body
        if (this.body) {
            this.body.reset(this.x, this.y);
        }
    }
}
