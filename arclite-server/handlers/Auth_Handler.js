// handlers/Auth_Handler.js

import Player_Manager from "../managers/Player_Manager.js";
import Lobby_Manager from "../managers/Lobby_Manager.js";
import Lobby_Handler from "./Lobby_Handler.js";
import Global_Chat_Handler from "./Global_Chat_Handler.js";
import Lobby_Chat_Handler from "./Lobby_Chat_Handler.js";
import Game_Handler from "./Game_Handler.js";

const disconnect_timeouts_map = new Map(); // firebase_uid -> timeout_id

export default function Auth_Handler(
    io,
    socket,
    player_manager,
    lobby_manager
) {
    console.log(`🔌 connected: ${socket.id}`);

    const auth_timeout_id = setTimeout(() => {
        if (!socket.data?.firebase_uid) {
            console.log(`⏳ auth timeout: ${socket.id}`);
            socket.disconnect(true);
        }
    }, 5000);

    socket.on("auth", ({ firebase_uid, username, lobby_id }) => {
        clearTimeout(auth_timeout_id);

        if (
            !firebase_uid ||
            !username ||
            typeof firebase_uid !== "string" ||
            typeof username !== "string"
        ) {
            console.log(`🚫 invalid auth from ${socket.id}`);
            socket.disconnect(true);
            return;
        }

        socket.data.firebase_uid = firebase_uid;
        socket.data.username = username;
        socket.data.lobby_id = lobby_id || null;

        // Clear pending disconnect (reconnection)
        if (disconnect_timeouts_map.has(firebase_uid)) {
            clearTimeout(disconnect_timeouts_map.get(firebase_uid));
            disconnect_timeouts_map.delete(firebase_uid);
            console.log(`🔁 cleared disconnect timeout for: ${firebase_uid}`);
        }

        const existing_player = player_manager.get_player(firebase_uid);
        if (existing_player) {
            console.log(`🔁 reconnected: ${firebase_uid}`);

            // if the player was in a lobby, rejoin the socket room
            if (socket.data.lobby_id) {
                socket.join(socket.data.lobby_id);
                console.log(
                    `🔁 re-joined lobby: ${socket.data.lobby_id} for ${firebase_uid}`
                );
                const lobby = lobby_manager.get_lobby(socket.data.lobby_id);
                if (lobby) {
                    io.to(socket.data.lobby_id).emit("update_lobby", {
                        host_uid: lobby.host_uid,
                        players: lobby.get_player_list(),
                    });
                }
            }
        } else {
            player_manager.add_player({
                firebase_uid,
                name: username,
                socket_id: socket.id,
            });
            console.log(`✅ new player: ${firebase_uid}`);
        }

        // Register handlers
        Lobby_Handler(io, socket, player_manager, lobby_manager);
        Global_Chat_Handler(io, socket, player_manager);
        Lobby_Chat_Handler(io, socket, player_manager, lobby_manager);
        Game_Handler(io, socket, player_manager, lobby_manager);

        // ✅ Handle explicit logout
        socket.on("logout", () => {
            const firebase_uid = socket.data?.firebase_uid;
            player_manager.remove_player(firebase_uid);
            socket.data.logout = true; // Mark as logged out
            socket.disconnect(true);
        });
    });

    socket.on("disconnect", () => {
        const firebase_uid = socket.data?.firebase_uid;
        if (!firebase_uid) return;

        if (socket.data.logout) {
            console.log(`👋 ${firebase_uid} logged out`);
            return; // Already handled in "logout" event
        }

        const timeout_id = setTimeout(() => {
            disconnect_timeouts_map.delete(firebase_uid);

            const player = player_manager.get_player(firebase_uid);
            if (!player) {
                console.log(
                    `⚠️ player not found during disconnect cleanup: ${firebase_uid}`
                );
                return;
            }

            const lobby_id = socket.data?.lobby_id;
            const lobby = lobby_id ? lobby_manager.get_lobby(lobby_id) : null;

            if (lobby && lobby.has_player(firebase_uid)) {
                lobby_manager.remove_player_from_lobby(lobby_id, player);
                console.log(
                    `👋 ${firebase_uid} removed from lobby ${lobby_id} (grace expired)`
                );

                io.to(lobby_id).emit("player:remove", { firebase_uid });

                if (lobby.is_empty()) {
                    lobby_manager.delete_lobby(lobby_id);
                    console.log(`🗑️ deleted empty lobby: ${lobby_id}`);
                } else {
                    io.to(lobby_id).emit("update_lobby", {
                        host_uid: lobby.host_uid,
                        players: lobby.get_player_list(),
                    });
                }
            }

            player_manager.remove_player(firebase_uid);
            console.log(`🔌 disconnected: ${firebase_uid} (grace expired)`);
        }, 30000);

        disconnect_timeouts_map.set(firebase_uid, timeout_id);
        console.log(
            `⏳ disconnect scheduled for ${firebase_uid} in 30 seconds`
        );
    });
}

export function cleanup_disconnect_timeouts() {
    for (const timeout_id of disconnect_timeouts_map.values()) {
        clearTimeout(timeout_id);
    }
    disconnect_timeouts_map.clear();
}
