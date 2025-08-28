import Player_Manager from "../managers/Player_Manager.js";
import Lobby_Manager from "../managers/Lobby_Manager.js";
import Lobby_Handler from "./Lobby_Handler.js";
import Global_Chat_Handler from "./Global_Chat_Handler.js";
import Lobby_Chat_Handler from "./Lobby_Chat_Handler.js";
import Game_Handler from "./Game_Handler.js";

// store pending disconnect timeouts
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

    socket.on("auth", ({ firebase_uid, username }) => {
        clearTimeout(auth_timeout_id);
        console.log(`🔑 auth attempt from: ${socket.id} for firebase_id ${firebase_uid}`)

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

        // clear any pending disconnect for this user (reconnection)
        if (disconnect_timeouts_map.has(firebase_uid)) {
            clearTimeout(disconnect_timeouts_map.get(firebase_uid));
            disconnect_timeouts_map.delete(firebase_uid);
            console.log(`🔁 cleared disconnect timeout for: ${firebase_uid}`);
        }

        const existing_player = player_manager.get_player(firebase_uid);
        if (existing_player) {
            console.log(`🔁 reconnected: ${firebase_uid}`);
        } else {
            player_manager.add_player({
                firebase_uid,
                name: username,
                socket_id: socket.id,
            });
            console.log(`✅ new player: ${firebase_uid}`);
        }

        socket.data.firebase_uid = firebase_uid;

        // register event handlers only after authentication
        Lobby_Handler(io, socket, player_manager, lobby_manager);
        Global_Chat_Handler(io, socket, player_manager);
        Lobby_Chat_Handler(io, socket, player_manager, lobby_manager);
        Game_Handler(io, socket, player_manager, lobby_manager);
    });

    socket.on("disconnect", () => {
        const firebase_uid = socket.data?.firebase_uid;
        if (!firebase_uid) return;

        const timeout_id = setTimeout(() => {
            disconnect_timeouts_map.delete(firebase_uid);

            const player = player_manager.get_player(firebase_uid);
            if (!player) {
                console.log(
                    `⚠️ disconnect cleanup — player not found: ${firebase_uid}`
                );
                return;
            }

            console.log(`⏰ grace period expired for: ${firebase_uid}`);

            const lobby_id = socket.data?.lobby_id;
            if (lobby_id) {
                const lobby = lobby_manager.get_lobby(lobby_id);
                if (lobby && lobby.has_player(firebase_uid)) {
                    lobby_manager.remove_player_from_lobby(lobby_id, player);
                    console.log(
                        `👋 ${firebase_uid} removed from lobby ${lobby_id} (grace period expired)`
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
            }

            player_manager.remove_player(firebase_uid);
            console.log(
                `🔌 disconnected: ${firebase_uid} from players list (grace period expired)`
            );
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
