import { useRouter } from "next/router";
import { useStore } from "zustand";
import { useState } from "react";
import Socket_Store from "../states/Socket_Store";
import Lobby_Store from "../states/Lobby_Store";
import Auth_Store from "../states/Auth_Store";

export default function Host_Options() {
    const router = useRouter();
    const { lobby_id } = router.query;
    const socket = useStore(Socket_Store, (state) => state.socket);
    
    const firebase_uid = useStore(Auth_Store, (state) => state.firebase_uid);
    const players = useStore(Lobby_Store, (state) => state.players);

    const [is_starting_game, set_is_starting_game] = useState(false);
    const [kicking_map, set_kicking_map] = useState({});

    const start_game = () => {
        if (!socket || !lobby_id) return;
        set_is_starting_game(true);
        console.log(`Starting game in lobby: ${lobby_id}`);
        socket.emit("start_game", { lobby_id });
    };

    const kick_player = (target_socket_id) => {
        if (!socket || !lobby_id) return;

        set_kicking_map((prev) => ({ ...prev, [target_socket_id]: true }));
        console.log(`Kicking player: ${target_socket_id}`);

        socket.emit("kick_player", {
            lobby_id,
            socket_id: target_socket_id,
        });

        setTimeout(() => {
            set_kicking_map((prev) => ({ ...prev, [target_socket_id]: false }));
        }, 2000);
    };

    return (
        <div className="mt-4 p-4 border rounded-xl bg-white shadow-sm w-full max-w-md">
            <h2 className="text-lg font-semibold text-purple-600 mb-2">
                Host Options
            </h2>

            <button
                onClick={start_game}
                disabled={is_starting_game}
                className="w-full px-4 py-2 mb-4 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed"
            >
                {is_starting_game ? "Starting..." : "Start Game"}
            </button>

            <div>
                <h3 className="font-medium text-gray-700 mb-1">Kick Players</h3>
                <ul className="space-y-1">
                    {players.map((player) => {
                        const is_self = player.firebase_uid === firebase_uid;
                        if (is_self) return null;

                        return (
                            <li
                                key={player.firebase_uid}
                                className="flex justify-between items-center bg-gray-100 p-2 rounded"
                            >
                                <span className="text-sm text-gray-800">
                                    {player.name}
                                </span>
                                <button
                                    onClick={() =>
                                        kick_player(player.socket_id)
                                    }
                                    disabled={kicking_map[player.socket_id]}
                                    className="text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:bg-red-300"
                                >
                                    {kicking_map[player.socket_id]
                                        ? "Kicking..."
                                        : "Kick"}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
