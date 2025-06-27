export function preload_players(scene) {
    // Load player-related assets
    scene.load.image(
        "player",
        "https://labs.phaser.io/assets/sprites/phaser-dude.png"
    );
}

export function setup_players(scene, players, your_id, sprite_map, platforms) {
    let index = 0;

    players.forEach((player) => {
        const x = 200 + index * 50;
        const y = 450;

        const sprite = scene.physics.add.sprite(x, y, "player");

        sprite.setCollideWorldBounds(true);
        scene.physics.add.collider(sprite, platforms);

        sprite_map.current.set(player.firebase_uid, sprite);

        if (player.firebase_uid === your_id) {
            scene.player = sprite;
            scene.cursors = scene.input.keyboard.createCursorKeys();
        }
        index++;
    });

    scene.cursors = scene.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        right: Phaser.Input.Keyboard.KeyCodes.D,
    });
}

export function player_movement(scene, socket, room_id) {
    const speed = 200;
    if (scene.player) {
        scene.player.setVelocityX(0);
        if (scene.cursors.left.isDown) {
            scene.player.setVelocityX(-speed);
        } else if (scene.cursors.right.isDown) {
            scene.player.setVelocityX(speed);
        }
        if (scene.cursors.up.isDown && scene.player.body.touching.down) {
            scene.player.setVelocityY(-400);
        }

        const { x, y } = scene.player;
        socket.emit("player:update_position", { room_id, x, y });
    }
}
