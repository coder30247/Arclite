import { useRouter } from "next/router";
import { useEffect, useState } from "react"; // Add useState
import { useStore } from "zustand"; // Add useStore for reactive socket
import Socket_Store from "../../states/Socket_Store.js";
import Lobby_Store from "../../states/Lobby_Store.js";
import Lobby_Chat from "../../components/Lobby_Chat.js";
import Global_Chat from "../../components/Global_Chat.js";

export default function Lobby() {
    const router = useRouter();
    const { lobby_id } = router.query;
    const socket = useStore(Socket_Store, (state) => state.socket); // Reactive socket
    const host_id = useStore(Lobby_Store, (state) => state.host_id);
    const players = useStore(Lobby_Store, (state) => state.players);
    const set_host_id = useStore(Lobby_Store, (state) => state.set_host_id);
    const set_players = useStore(Lobby_Store, (state) => state.set_players);

    const [is_exiting, set_is_exiting] = useState(false); // Track exit state
    const [is_connected, set_is_connected] = useState(!!socket); // Track connection

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
            if (socket && lobby_id && is_exiting) {
                socket.emit("leave_lobby", { lobby_id });
            }
        };
    }, [socket, lobby_id, set_host_id, set_players, router]);

    const handle_exit = () => {
        console.log(`Exiting lobby: ${lobby_id}`);
        set_is_exiting(true); // Set exit state
        if (socket && lobby_id) {
            socket.emit("leave_lobby", { lobby_id });
        }
        socket.on("left_lobby", () => {
            console.log(`Left lobby: ${lobby_id}`);
            router.push("/");
        });
    };

    const handle_start_game = () => {
        console.log(`Starting game in lobby: ${lobby_id}`);
        if (socket && lobby_id) {
            socket.emit("start_game", { lobby_id });
        }
    };

    return (
        <div className="flex flex-col items-center p-6 min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold text-blue-600">
                Lobby: {lobby_id}
            </h1>
            <p className="text-gray-600">Host ID: {host_id}</p>
            <h2 className="text-xl font-semibold mt-4">Players in Lobby</h2>
            <ul className="list-disc pl-6 mt-2">
                {players.map((player) => (
                    <li key={player.firebase_uid} className="text-gray-700">
                        {player.name}{" "}
                        {player.firebase_uid === host_id ? "(Host)" : ""}
                        {player.socket_id === socket.id ? " (You)" : ""}
                        {player.is_ready ? " (Ready)" : ""}
                    </li>
                ))}
            </ul>
            <button
                onClick={handle_exit}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
            >
                Exit Lobby
            </button>
            <button
                onClick={handle_start_game}
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
            >
                Start Game
            </button>

            <Lobby_Chat is_connected={is_connected} />
            <Global_Chat />
        </div>
    );
}
