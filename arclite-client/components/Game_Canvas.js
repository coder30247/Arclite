import { useEffect, useRef } from "react";
import Lobby_Store from "../states/Lobby_Store.js";
import Auth_Store from "../states/Auth_Store.js";
import Socket_Store from "../states/Socket_Store.js";

import { preload_map, create_map } from "../lib/Map_System.js";
import {
    preload_players,
    setup_players,
    player_movement,
} from "../lib/Player_System.js";

import {
    preload_bullets,
    setup_bullets,
    update_bullets,
    spawn_bullet,
    get_bullets,
} from "../lib/Bullet_System.js";

import Phaser from "phaser";

export default function Game_Canvas({ room_id }) {
    const game_container_ref = useRef(null);
    const players = Lobby_Store((state) => state.players);
    const your_id = Auth_Store((state) => state.firebase_uid);
    const socket = Socket_Store((state) => state.socket);
    const sprite_map = useRef(new Map());
    const last_direction_faced = useRef("right");

    useEffect(() => {
        if (!room_id || !game_container_ref.current) return;

        let game;

        // Listen for remote bullet spawn

        const config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            backgroundColor: "#1e1e1e",
            parent: game_container_ref.current,
            physics: {
                default: "arcade",
                arcade: {
                    gravity: { y: 600 },
                    debug: true,
                },
            },
            scene: {
                preload,
                create,
                update,
            },
        };

        game = new Phaser.Game(config);

        function preload() {
            preload_map(this);
            preload_players(this);
            preload_bullets(this);
        }

        function create() {
            const platforms = create_map(this);
            setup_players(this, players, your_id, sprite_map, platforms);
            setup_bullets(this, socket, your_id, room_id);

            socket.on("player:position_update", ({ firebase_uid, x, y }) => {
                const sprite = sprite_map.current.get(firebase_uid);
                if (sprite) {
                    sprite.setPosition(x, y);
                }
            });

            socket.on(
                "bullet:spawn",
                ({ bullet_id, shooter_id, x, y, c_x, c_y }) => {
                    // Spawn the bullet directly
                    spawn_bullet(this, bullet_id, x, y, c_x, c_y, shooter_id);
                }
            );

            socket.on("bullet:update", ({ bullet_id, x, y }) => {
                // Find the bullet and update its position
                get_bullets()
                    .getChildren()
                    .forEach((bullet) => {
                        if (bullet.bullet_id === bullet_id) {
                            bullet.setPosition(x, y);
                        }
                    });
            });
        }

        function update() {
            player_movement(this, socket, room_id);

            update_bullets(this, socket, room_id, last_direction_faced);
        }

        return () => {
            socket.off("player:position_update");
            socket.off("bullet:spawn");
            // Clean up Phaser game instance
            game.destroy(true);
        };
    }, [room_id]);

    return <div ref={game_container_ref} />;
}
