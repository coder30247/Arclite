import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Socket_Store from "../../states/Socket_Store.js";
import User_Store from "../../states/User_Store.js";
import Lobby_Store from "../../states/Lobby_Store.js";
import Auth_Store from "../../states/Auth_Store.js";

export default function Create_Lobby_Button() {
    const [error, set_error] = useState(null);
    const [is_creating, set_is_creating] = useState(false); // ⬅️ Added state
    
    const router = useRouter();
    const socket = Socket_Store((state) => state.socket);
    const username = User_Store((state) => state.username);
    const set_host_id = Lobby_Store((state) => state.set_host_id);
    const set_lobby_id = Lobby_Store((state) => state.set_lobby_id);
    const set_players = Lobby_Store((state) => state.set_players);
    const set_is_host = User_Store((state) => state.set_is_host);
    const set_firebase_uid = Auth_Store((state) => state.set_firebase_uid);

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
        if (is_creating) return; // ⬅️ Prevent duplicate click

        if (!username) {
            set_error("Username is required");
            return;
        }
        if (!socket) {
            set_error("Not connected to server");
            return;
        }

        set_error(null);
        set_is_creating(true); // ⬅️ Lock the button

        const lobby_id = generate_id();
        console.log(
            `Creating lobby with lobby_id: ${lobby_id}, username: ${username}`
        );
        socket.emit("create_lobby", { lobby_id, username });

        const handleSuccess = ({ lobby_id, firebase_uid }) => {
            console.log(
                `Lobby created: ${lobby_id}, for user: ${firebase_uid}`
            );
            set_lobby_id(lobby_id);
            set_host_id(firebase_uid);
            set_firebase_uid(firebase_uid); // Store Firebase UID
            set_is_host(true);

            set_players([
                {
                    firebase_uid: firebase_uid,
                    name: username,
                    is_host: true,
                    is_ready: false,
                },
            ]);
            router.push(`/lobby/${lobby_id}`);
        };

        const handleError = (message) => {
            console.error(`Lobby creation error: ${message}`);
            set_error(message);
            set_is_creating(false); // ⬅️ Re-enable button on failure
        };

        socket.once("lobby_created", handleSuccess);
        socket.once("error", handleError);
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <button
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition transform hover:scale-105 shadow-lg"
                onClick={handle_create_lobby}
                disabled={!username || !socket || is_creating}
            >
                {is_creating ? "Creating..." : "Create Lobby"}
            </button>
            {error && <p className="text-red-500">{error}</p>}
        </div>
    );
}
