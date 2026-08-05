import { player_manager } from "../core/Managers.js";
import { lobby_manager } from "../core/Managers.js";

const disconnected_players = new Map();

function generate_lobby_id() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let lobby_id = "";

    for (let i = 0; i < 6; i++) {
        lobby_id += characters.charAt(
            Math.floor(Math.random() * characters.length),
        );
    }

    return lobby_id;
}

export function socket_handler(io) {
    // Middleware to authenticate socket connections
    io.use((socket, next) => {
        const { firebase_uid } = socket.handshake.auth;

        if (!firebase_uid) {
            return next(new Error("Authentication failed"));
        }

        // TODO: You might want to validate the firebase_uid here, e.g., check against a database or Firebase Admin SDK.
        // but for now, we'll just accept any non-empty string.

        socket.data.firebase_uid = firebase_uid;
        console.log(
            `🔑 Authenticated socket: ${socket.id} with firebase_uid: ${firebase_uid}`,
        );

        next(); // Allow the connection
    });

    io.on("connection", (socket) => {
        console.log(`🔌 connected: ${socket.id}`);

        if (disconnected_players.has(socket.data.firebase_uid)) {
            // Clear the pending removal timeout
            clearTimeout(disconnected_players.get(socket.data.firebase_uid));
            disconnected_players.delete(socket.data.firebase_uid);
            console.log(
                `Player ${socket.data.firebase_uid} reconnected before timeout`,
            );
        } else {
            player_manager.add_player({
                firebase_uid: socket.data.firebase_uid,
                username: socket.data.username,
            });
        }
        socket.on("lobby:create", () => {
            const lobby_id = generate_lobby_id();
            const host_player = player_manager.get_player(
                socket.data.firebase_uid,
            );
            lobby_manager.create_lobby(lobby_id, host_player, 4, "");
            socket.join(lobby_id);
            socket.data.lobby_id = lobby_id;
            console.log(
                `Lobby created: ${lobby_id} by player ${host_player.firebase_uid}`,
            );
            socket.emit("lobby:ready", { lobby_id });
        });

        socket.on("lobby:join", ({ lobby_id }) => {
            const player = player_manager.get_player(socket.data.firebase_uid);
            lobby_manager.add_player_to_lobby(lobby_id, player);
            socket.join(lobby_id);
            socket.data.lobby_id = lobby_id;
            console.log(
                `Player ${player.firebase_uid} joined lobby ${lobby_id}`,
            );
            socket.emit("lobby:ready", { lobby_id });
        });

        socket.on("disconnect", (reason) => {
            console.log("Player disconnected", socket.id, reason);
            // Set a timeout to remove the player after 30 seconds
            const timeout = setTimeout(() => {
                if (socket.data.lobby_id) {
                    lobby_manager.remove_player_from_lobby(
                        socket.data.lobby_id,
                        socket.data.firebase_uid,
                    );
                }
                player_manager.remove_player(socket.data.firebase_uid);
                disconnected_players.delete(socket.data.firebase_uid);
                console.log(
                    `Player ${socket.data.firebase_uid} removed after timeout`,
                );
            }, 30000); // 30 seconds

            // Store the timeout reference so we can clear it if the player reconnects
            disconnected_players.set(socket.data.firebase_uid, timeout);
        });
    });
}
