// server/handlers/Auth_Handler.js
import Player_Manager from "../managers/Player_Manager.js";
import Lobby_Manager from "../managers/Lobby_Manager.js";
import { lobby_handler } from "./Lobby_Handler.js";
import { global_chat_handler } from "./Global_Chat_Handler.js";
import { lobby_chat_handler } from "./Lobby_Chat_Handler.js";
import { game_handler } from "./Game_Handler.js";

// Store pending disconnect timeouts
const disconnect_timeouts = new Map(); // Map of firebase_uid -> timeout_id

export function auth_handler(io, socket, player_manager, lobby_manager) {
    const user_agent = socket.handshake.headers["user-agent"] || "";
    if (user_agent.includes("node-XMLHttpRequest")) {
        console.log(`🚫 blocked bot: ${socket.id}`);
        socket.disconnect(true);
        return;
    }
    console.log(`🔌 connected: ${socket.id}`);

    const auth_timeout = setTimeout(() => {
        if (!socket.firebase_uid) {
            console.log(`⏳ auth timeout: ${socket.id}`);
            socket.disconnect(true);
        }
    }, 5000);

    socket.on("auth", ({ firebase_uid, username }) => {
        clearTimeout(auth_timeout);
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
        socket.firebase_uid = firebase_uid;

        // Clear any pending disconnect for this user (reconnection)
        if (disconnect_timeouts.has(firebase_uid)) {
            clearTimeout(disconnect_timeouts.get(firebase_uid));
            disconnect_timeouts.delete(firebase_uid);
            console.log(`🔁 cleared disconnect timeout for: ${firebase_uid}`);
        }

        const existing = player_manager.get_player(firebase_uid);
        if (existing) {
            console.log(`🔁 reconnected: ${firebase_uid}`);
        } else {
            player_manager.add_player({
                firebase_uid: firebase_uid,
                name: username,
                socket_id: socket.id,
            });
            console.log(`✅ new player: ${firebase_uid}`);
        }
        // Register other event handlers only after authentication
        lobby_handler(io, socket, player_manager, lobby_manager);
        global_chat_handler(io, socket, player_manager);
        lobby_chat_handler(io, socket, player_manager, lobby_manager);
        game_handler(io, socket, player_manager, lobby_manager);
    });

    socket.on("disconnect", () => {
        const firebase_uid = socket.firebase_uid;
        if (!firebase_uid) {
            console.log(`⚠️ Unknown disconnect: ${socket.id}`);
            return;
        }

        // Set a 30-second timeout before actually removing the player
        const timeout_id = setTimeout(() => {
            // Remove from disconnect_timeouts
            disconnect_timeouts.delete(firebase_uid);

            // Check if player still exists (might have reconnected)
            const player = player_manager.get_player(firebase_uid);
            if (!player) {
                console.log(
                    `⚠️ Disconnect cleanup — player not found: ${firebase_uid}`
                );
                return;
            }

            console.log(`⏰ Grace period expired for: ${firebase_uid}`);

            const lobby_id = socket.lobby_id;
            if (lobby_id) {
                const lobby = lobby_manager.get_lobby(lobby_id);
                if (lobby && lobby.has_player(firebase_uid)) {
                    lobby_manager.remove_player_from_lobby(lobby_id, player);
                    console.log(
                        `👋 ${firebase_uid} removed from lobby ${lobby_id} (grace period expired)`
                    );
                    // Notify other players in the lobby
                    io.to(lobby_id).emit("player:remove", {
                        firebase_uid: firebase_uid,
                    });
                    if (lobby.is_empty()) {
                        lobby_manager.delete_lobby(lobby_id);
                        console.log(`🗑️ Deleted empty lobby: ${lobby_id}`);
                    } else {
                        io.to(lobby_id).emit("update_lobby", {
                            host_id: lobby.host_id,
                            players: lobby.get_player_list(),
                        });
                    }
                }
            }

            player_manager.remove_player(firebase_uid);
            console.log(
                `🔌 Disconnected: ${firebase_uid} from players list (grace period expired)`
            );
        }, 30000); // 30 seconds grace period

        // Store the timeout
        disconnect_timeouts.set(firebase_uid, timeout_id);
        console.log(
            `⏳ Disconnect scheduled for ${firebase_uid} in 30 seconds`
        );
    });
}

// Optional: Export function to clean up timeouts on server shutdown
export function cleanup_disconnect_timeouts() {
    for (const timeout_id of disconnect_timeouts.values()) {
        clearTimeout(timeout_id);
    }
    disconnect_timeouts.clear();
}
