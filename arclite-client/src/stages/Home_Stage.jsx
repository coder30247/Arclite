import { useEffect } from "react";
import { Initialize_Socket } from "../lib/Socket";

import User_Store from "../stores/User_Store";
import Lobby_Store from "../stores/Lobby_Store";
import Stage_Store from "../stores/Stage_Store";

export default function Home_Stage() {
    const socket = Initialize_Socket();

    const username = User_Store((state) => state.username);
    const set_username = User_Store((state) => state.set_username);

    const lobby_id = Lobby_Store((state) => state.lobby_id);
    const set_lobby_id = Lobby_Store((state) => state.set_lobby_id);

    const set_stage = Stage_Store((state) => state.set_stage);

    socket.on("lobby_created", () => {
        set_stage("lobby");
    });

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
                    socket.emit("create_lobby", { name: "User" });
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

                    socket.emit("join_lobby", { lobby_id: lobby_id });
                }}
            >
                Join Lobby
            </button>
        </div>
    );
}
