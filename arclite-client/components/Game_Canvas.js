import { useEffect, useRef } from "react";
import Lobby_Store from "../states/Lobby_Store.js";
import Auth_Store from "../states/Auth_Store.js";
import Socket_Store from "../states/Socket_Store.js";

import { preload_map, create_map } from "../lib/Map_System.js";
import {
    preload_players,
    create_players,
    update_players_movement,
} from "../lib/Player_System.js";

import {
    preload_bullets,
    setup_bullets,
    update_bullets,
    spawn_bullet,
} from "../lib/Bullet_System.js";

import Phaser from "phaser";

export default function Game_Canvas({ room_id }) {
    const game_container_ref = useRef(null);
    const players = Lobby_Store((state) => state.players);
    const your_id = Auth_Store((state) => state.firebase_uid);
    const socket = Socket_Store((state) => state.socket);
    const sprite_map = useRef(new Map());
    const sprite_positions = useRef(new Map());
    const last_direction_faced = useRef("right");

    useEffect(() => {
        if (!room_id || !game_container_ref.current) return;

        let game;

        const handle_position_update = ({ firebase_uid, x, y }) => {
            sprite_positions.current.set(firebase_uid, { x, y });
        };

        socket.on("player:position_update", handle_position_update);

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
            create_players(this, players, your_id, sprite_map, platforms);

            setup_bullets(this, socket, your_id, room_id);
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

            update_bullets(this, socket, room_id, last_direction_faced);
        }

        return () => {
            socket.off("player:position_update", handle_position_update);
            game.destroy(true);
        };
    }, [room_id]);

    return <div ref={game_container_ref} />;
}
