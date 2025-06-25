export function preload_players(scene) {
    // Load player-related assets
    scene.load.image(
        "player",
        "https://labs.phaser.io/assets/sprites/phaser-dude.png"
    );
}

export function create_players(scene, players, your_id, sprite_map, platforms) {
    let index = 0;

    players.forEach((player) => {
        const x = 200 + index * 50;
        const y = 450;

        const sprite = scene.physics.add.sprite(x, y, "player");
        sprite.setBounce(0.2);
        sprite.setCollideWorldBounds(true);
        scene.physics.add.collider(sprite, platforms);

        // Initialize custom props
        sprite.health = 100;
        sprite.player_id = player.firebase_uid;

        sprite_map.current.set(player.firebase_uid, sprite);

        if (player.firebase_uid === your_id) {
            scene.player = sprite;
            scene.cursors = scene.input.keyboard.createCursorKeys();

            // 💚 Health Text
            scene.health_text = scene.add.text(16, 16, "HP: 100", {
                fontSize: "18px",
                fill: "#ffffff",
            });
            scene.health_text.setScrollFactor(0);

            // 📶 Ping Text
            scene.ping_text = scene.add.text(700, 16, "Ping: ...", {
                fontSize: "16px",
                fill: "#00ff00",
            });
            scene.ping_text.setScrollFactor(0);
        }

        index++;
    });
}

export function update_players_movement(
    scene,
    socket,
    room_id,
    your_id,
    sprite_map,
    sprite_positions
) {
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

    sprite_positions.current.forEach((pos, firebase_uid) => {
        if (firebase_uid !== your_id) {
            const sprite = sprite_map.current.get(firebase_uid);
            if (sprite) {
                sprite.setPosition(pos.x, pos.y);
            }
        }
    });
}
