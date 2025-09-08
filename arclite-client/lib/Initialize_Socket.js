// lib/Initialize_Socket.js
import { io } from "socket.io-client";

import Socket_Store from "../states/Socket_Store.js";
import Auth_Store from "../states/Auth_Store.js";
import Lobby_Store from "../states/Lobby_Store.js";
import User_Store from "../states/User_Store.js";

export function Initialize_Socket() {
    // ✅ Get values directly — no hooks!
    const { socket, set_socket, set_connected } = Socket_Store.getState();
    const { firebase_uid } = Auth_Store.getState();
    const { username } = User_Store.getState();
    const { lobby_id } = Lobby_Store.getState();

    // Prevent duplicate sockets
    if (socket) return socket;

    // In your socket initialization, add:
    const new_socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER, {
        transports: ["websocket"], // Force WebSocket only
        upgrade: false, // Don't upgrade from polling
        reconnection: true, // Enable reconnection
        reconnectionAttempts: 5, // Limit attempts
        reconnectionDelay: 1000, // Delay between attempts
        timeout: 10000, // Connection timeout
    });

    // Listeners
    new_socket.on("connect", () => {
        console.log("Socket connected:", new_socket.id);
        // Send auth to server
        new_socket.emit("auth", { firebase_uid, username, lobby_id });
        set_connected(true);
    });

    new_socket.on("disconnect", (reason) => {
        console.log(`Socket disconnected: ${reason}`);
        set_connected(false);
        set_socket(null);
    });

    new_socket.on("error", (message) => {
        console.error(`Socket error: ${message}`);
    });

    new_socket.on("connect_error", (error) => {
        console.error(`Socket connect error: ${error.message}`);
    });

    set_socket(new_socket);
}
