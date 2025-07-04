import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useStore } from "zustand";
import Socket_Store from "../../states/Socket_Store.js";
import Lobby_Store from "../../states/Lobby_Store.js";
import User_Store from "../../states/User_Store.js";
import Auth_Store from "../../states/Auth_Store.js";

import Lobby_Chat from "../../components/Lobby_Chat.js";
import Host_Options from "../../components/Host_Options.js"; // ✅ New import

export default function Lobby() {
    const router = useRouter();
    const { lobby_id } = router.query;
    const socket = useStore(Socket_Store, (state) => state.socket);

    const host_id = useStore(Lobby_Store, (state) => state.host_id);
    const players = useStore(Lobby_Store, (state) => state.players);
    const set_host_id = useStore(Lobby_Store, (state) => state.set_host_id);
    const set_players = useStore(Lobby_Store, (state) => state.set_players);

    const is_host = useStore(User_Store, (state) => state.is_host);
    const set_is_host = useStore(User_Store, (state) => state.set_is_host);
    const player_uid = useStore(Auth_Store, (state) => state.firebase_uid);

    const [is_exiting, set_is_exiting] = useState(false);
    const [is_connected, set_is_connected] = useState(!!socket);

    useEffect(() => {
        if (!socket || !lobby_id) {
            set_is_connected(false);
            return;
        }

        console.log(`Joining lobby: ${lobby_id}`);

        socket.on("connect", () => set_is_connected(true));
        socket.on("disconnect", () => set_is_connected(false));
        socket.on("connect_error", () => set_is_connected(false));

        socket.on("update_lobby", ({ host_id, players }) => {
            console.log(`Host updated: ${host_id}`);
            console.log(
                `Received lobby update: players=${JSON.stringify(players)}`
            );
            set_players(players);
            set_host_id(host_id);
            if (host_id === socket.id) {
                console.log(`You are now the host of lobby: ${lobby_id}`);
                set_is_host(true);
            }
        });

        socket.on("game_started", () => {
            console.log(`Game started in lobby: ${lobby_id}`);
            router.push(`/game/${lobby_id}`);
        });

        socket.on("error", (message) => {
            console.error(`Lobby error: ${message}`);
            router.push("/");
            alert(message);
        });

        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("connect_error");
            socket.off("update_lobby");
            socket.off("error");
            socket.off("game_started");

            if (socket && lobby_id && is_exiting) {
                socket.emit("leave_lobby", { lobby_id });
            }
        };
    }, [socket, lobby_id, set_host_id, set_players, router]);

    const handle_exit = () => {
        console.log(`Exiting lobby: ${lobby_id}`);
        set_is_exiting(true);
        if (socket && lobby_id) {
            socket.emit("leave_lobby", { lobby_id });
        }
        socket.on("left_lobby", () => {
            console.log(`Left lobby: ${lobby_id}`);
            router.push("/");
        });
    };

    return (
        <div className="flex flex-col items-center p-6 min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold text-blue-600">
                Lobby: {lobby_id}
            </h1>
            <h2 className="text-xl font-semibold mt-4">Players in Lobby</h2>
            <ul className="list-disc pl-6 mt-2">
                {players.map((player) => (
                    <li key={player.firebase_uid} className="text-gray-700">
                        {player.name}{" "}
                        {player.firebase_uid === host_id ? "(Host)" : ""}
                        {player.firebase_uid === player_uid ? " (You)" : ""}
                        {player.is_ready ? "Player ready" : "Player not ready"}
                    </li>
                ))}
            </ul>
            <button
                onClick={handle_exit}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
            >
                Exit Lobby
            </button>
            {is_host && <Host_Options />} {/* ✅ host-only controls */}
            <Lobby_Chat is_connected={is_connected} />
        </div>
    );
}
