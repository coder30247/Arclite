// lib/Initialize_Socket.js
import { io } from "socket.io-client";
import Socket_Store from "../states/Socket_Store.js";

export function Initialize_Socket({ firebase_uid, username }) {
    const { socket, set_socket, set_connected } = Socket_Store.getState();

    // Prevent duplicate sockets
    if (socket) return socket;

    const new_socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER, {
        autoConnect: true,
        reconnection: true,
    });

    // listeners
    new_socket.on("connect", () => {
        console.log("Socket connected:", new_socket.id);

        // send auth event once connected
        new_socket.emit("auth", { firebase_uid, username });

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
