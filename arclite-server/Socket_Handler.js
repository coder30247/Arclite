// server/Socket_Handler.js
import Player_Manager from "./managers/Player_Manager.js";
import Lobby_Manager from "./managers/Lobby_Manager.js";
import Auth_Handler from "./handlers/Auth_Handler.js";
import {
    cleanup_disconnect_timeouts,
} from "./handlers/Auth_Handler.js";

export function socket_handler(io) {
    const player_manager = new Player_Manager();
    const lobby_manager = new Lobby_Manager();

    io.on("connection", (socket) => {
        Auth_Handler(io, socket, player_manager, lobby_manager);
        socket.on("ping_check", (cb) => cb());
    });

    // Clean up timeouts on server shutdown
    process.on("SIGINT", () => {
        console.log("🧹 Cleaning up disconnect timeouts...");
        cleanup_disconnect_timeouts();
        process.exit(0);
    });

    process.on("SIGTERM", () => {
        console.log("🧹 Cleaning up disconnect timeouts...");
        cleanup_disconnect_timeouts();
        process.exit(0);
    });
}
