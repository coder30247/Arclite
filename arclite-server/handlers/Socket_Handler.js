import { player_manager } from "../core/Managers.js";
import { lobby_manager } from "../core/Managers.js";

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
        player_manager.add_player({
            firebase_uid: socket.data.firebase_uid,
            username: socket.data.username,
        });

        socket.on("join_lobby", ({ lobby_id }) => {
            const player = player_manager.get_player(socket.data.firebase_uid);
        });

        socket.on("disconnect", (reason) => {
            console.log("Player disconnected", socket.id, reason);
            player_manager.remove_player(socket.data.firebase_uid);
        });
    });
}
