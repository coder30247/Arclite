import { useEffect } from "react";
import { Initialize_Socket, destroy_socket } from "../lib/Socket";
import { sign_out } from "../lib/Firebase";

import User_Store from "../stores/User_Store";
import Lobby_Store from "../stores/Lobby_Store";
import Stage_Store from "../stores/Stage_Store";
import Auth_Store from "../stores/Auth_Store";

export default function Home_Stage() {
    const socket = Initialize_Socket();

    const reset_auth = Auth_Store((state) => state.reset_auth);

    const username = User_Store((state) => state.username);
    const set_username = User_Store((state) => state.set_username);
    const reset_user = User_Store((state) => state.reset_user);

    const lobby_id = Lobby_Store((state) => state.lobby_id);
    const set_lobby_id = Lobby_Store((state) => state.set_lobby_id);

    const players = Lobby_Store((state) => state.players);
    const set_players = Lobby_Store((state) => state.set_players);

    const set_lobby = Lobby_Store((state) => state.set_lobby);

    const set_stage = Stage_Store((state) => state.set_stage);

    useEffect(() => {
        const handle_lobby = ({ lobby_data }) => {
            set_lobby(lobby_data);
            console.log(
                "Lobby ready:",
                lobby_data.lobby_id,
                lobby_data.players,
                lobby_data.host_uid,
                lobby_data.max_players,
            );
            set_stage("lobby");
        };

        socket.on("lobby:ready", handle_lobby);

        return () => {
            socket.off("lobby:ready", handle_lobby);
        };
    }, [socket, set_stage, lobby_id, players]);

    return (
        <div>
            <h1>Home Stage</h1>
            <p>Welcome to the home stage!</p>
            <input
                type="text"
                value={username}
                onChange={(e) => set_username(e.target.value)}
                placeholder="Enter username"
            />
            <p>Current username: {username}</p>

            <button
                onClick={() => {
                    socket.emit("user:update", { username });
                }}
            >
                set username
            </button>

            <button
                onClick={() => {
                    socket.emit("lobby:create");
                }}
            >
                Create Lobby
            </button>
            <input
                value={lobby_id}
                onChange={(e) => {
                    set_lobby_id(
                        e.target.value
                            .replace(/[^a-zA-Z]/g, "")
                            .toUpperCase()
                            .slice(0, 6),
                    );
                }}
            />
            <button
                onClick={() => {
                    if (!/^[A-Z]{6}$/.test(lobby_id)) {
                        alert("Invalid Lobby ID");
                        return;
                    }

                    socket.emit("lobby:join", { lobby_id: lobby_id });
                }}
            >
                Join Lobby
            </button>

            <button
                onClick={() => {
                    socket.emit("user:logout");
                    destroy_socket();
                    set_stage("authentication");
                    sign_out();
                    reset_auth();
                    reset_user();
                }}
            >
                Logout
            </button>
        </div>
    );
}
