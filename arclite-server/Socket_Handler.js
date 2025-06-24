import Player_Manager from "./managers/Player_Manager.js";
import Lobby_Manager from "./managers/Lobby_Manager.js";
import { auth_handler } from "./handlers/Auth_Handler.js";

export function socket_handler(io) {
    const player_manager = new Player_Manager();
    const lobby_manager = new Lobby_Manager();

    io.on("connection", (socket) => {
        auth_handler(io, socket, player_manager, lobby_manager);
    });
}
