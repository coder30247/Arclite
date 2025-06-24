import { useEffect, useRef } from "react";
import Lobby_Store from "../states/Lobby_Store.js";
import Auth_Store from "../states/Auth_Store.js";
import Socket_Store from "../states/Socket_Store.js";

import {
    spawn_bullet,
    update_bullets,
    preload_bullets,
} from "../lib/Bullet_System.js";

import { preload_map, create_map } from "../lib/Map_System.js";

import {
    preload_players,
    create_players,
    update_players_movement,
} from "../lib/Player_System.js";

import Phaser from "phaser";

export default function Game_Canvas({ room_id }) {
    const game_container_ref = useRef(null);
    const players = Lobby_Store((state) => state.players);
    const your_id = Auth_Store((state) => state.firebase_uid);
    const socket = Socket_Store((state) => state.socket);
    const sprite_map = useRef(new Map());
    const sprite_positions = useRef(new Map());

    useEffect(() => {
        if (!room_id || !game_container_ref.current) return;

        socket.on("player:position_update", ({ firebase_uid, x, y }) => {
            sprite_positions.current.set(firebase_uid, { x, y });
        });
        socket.on("bullet:spawn", ({ x, y, direction }) => {
            spawn_bullet(game.scene.scenes[0], x, y, direction);
        });

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
                    checkCollision: {
                        up: true,
                        down: true,
                        left: true,
                        right: true,
                    },
                },
            },

            scene: {
                preload,
                create,
                update,
            },
        };

        let game = new Phaser.Game(config);

        function preload() {
            preload_map(this);
            preload_players(this);
            preload_bullets(this);
        }

        function create() {
            const platforms = create_map(this);
            create_players(this, players, your_id, sprite_map, platforms);

            this.physics.world.on("worldbounds", (body) => {
                body.gameObject.emit("worldbounds", body);
            });
        }

        function update() {
            update_players_movement(
                this,
                socket,
                room_id,
                your_id,
                sprite_map,
                sprite_positions
            );
            update_bullets(this, socket, room_id, your_id);
        }

        return () => {
            game.destroy(true);
        };
    }, [room_id]);

    return <div ref={game_container_ref} />;
}
