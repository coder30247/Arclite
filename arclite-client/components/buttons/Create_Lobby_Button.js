import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Socket_Store from "../../states/Socket_Store.js";
import User_Store from "../../states/User_Store.js";
import Lobby_Store from "../../states/Lobby_Store.js";

export default function Create_Lobby_Button() {
    const [error, set_error] = useState(null);
    const router = useRouter();
    const socket = Socket_Store((state) => state.socket);
    const username = User_Store((state) => state.username);
    const set_host_id = Lobby_Store((state) => state.set_host_id);
    const set_lobby_id = Lobby_Store((state) => state.set_lobby_id);
    const set_players = Lobby_Store((state) => state.set_players);

    useEffect(() => {
        console.log("Create_Lobby_Button state:", {
            username,
            socket: !!socket,
        });
    }, [username, socket]);

    const generate_id = () => {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let id = "";
        for (let i = 0; i < 6; i++) {
            id += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        return id;
    };

    const handle_create_lobby = () => {
        if (!username) {
            set_error("Username is required");
            return;
        }
        if (!socket) {
            set_error("Not connected to server");
            return;
        }
        set_error(null);
        const lobby_id = generate_id();
        console.log(
            `Creating lobby with lobby_id: ${lobby_id}, username: ${username}`
        );
        socket.emit("create_lobby", { lobby_id, username });

        socket.on("lobby_created", ({ lobby_id, firebase_uid }) => {
            console.log(`Lobby created: ${lobby_id}, for user: ${firebase_uid}`);
            set_lobby_id(lobby_id);
            set_host_id(firebase_uid); // Set the host ID
            set_players([{ firebase_uid: firebase_uid, name: username, is_host: true }]); // Add only the host
            router.push(`/lobby/${lobby_id}`);
        });

        socket.on("error", (message) => {
            console.error(`Lobby creation error: ${message}`);
            set_error(message);
        });
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <button
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-blue-300"
                onClick={handle_create_lobby}
                disabled={!username || !socket}
            >
                Create Lobby
            </button>
            {error && <p className="text-red-500">{error}</p>}
        </div>
    );
}
