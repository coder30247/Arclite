import { io } from "socket.io-client";
import Auth_Store from "../stores/Auth_Store.jsx";

let socket = null;

export function Initialize_Socket() {
    if (!socket) {
        const { firebase_uid } = Auth_Store.getState();

        if (!firebase_uid) {
            throw new Error("Cannot initialize socket before authentication.");
        }

        socket = io(import.meta.env.VITE_SOCKET_SERVER, {
            transports: ["websocket"],
            upgrade: false,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000,
            auth: {
                firebase_uid,
            },
        });
    }

    return socket;
}

export function Destroy_Socket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
