import { useState } from "react";
import { useRouter } from "next/router";
import Socket_Store from "../../states/Socket_Store.js";
import User_Store from "../../states/User_Store.js";
import Lobby_Store from "../../states/Lobby_Store.js";

export default function Join_Lobby_Button() {
    const [lobby_id_input, set_lobby_id_input] = useState("");
    const socket = Socket_Store((state) => state.socket);
    const username = User_Store((state) => state.username);
    const set_lobby_id = Lobby_Store((state) => state.set_lobby_id);
    const set_players = Lobby_Store((state) => state.set_players);
    const set_host_id = Lobby_Store((state) => state.set_host_id)
    const router = useRouter();

    const handle_join_lobby = () => {
        if (lobby_id_input.length === 6) {
            socket.emit("join_lobby", {
                lobby_id: lobby_id_input,
                username: username,
            });
            socket.on("joined_lobby", ({ lobby_id, host_id, players }) => {
                set_lobby_id(lobby_id);
                set_players(players);
                set_host_id(host_id);
                router.push(`/lobby/${lobby_id}`);
            });
            socket.on("error", (message) => {
                alert(`Error: ${message}`);
            });
        } else {
            alert("Room ID must be exactly 6 characters.");
        }
    };

    return (
        <div className="w-full">
            <input
                type="text"
                value={lobby_id_input}
                onChange={(e) =>
                    set_lobby_id_input(e.target.value.toUpperCase())
                }
                placeholder="Enter Room ID"
                className="w-full p-2 border border-gray-300 rounded mb-2 uppercase tracking-widest text-center text-lg"
                maxLength={6}
                autoComplete="off"
            />
            <button
                onClick={handle_join_lobby}
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition duration-200"
            >
                Join Room
            </button>
        </div>
    );
}
