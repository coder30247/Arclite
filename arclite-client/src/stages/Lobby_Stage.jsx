import { Initialize_Socket } from "../lib/Socket";
import Lobby_Store from "../stores/Lobby_Store";
import Stage_Store from "../stores/Stage_Store";

import { useEffect } from "react";

export default function Lobby_Stage() {
    const socket = Initialize_Socket();

    // TODO: Find a way to reconnect to the lobby if the user refreshes the page or loses connection,
    // right now the socket alone reconnects but in the server state is lost.
    // i think it can be fixed keeping a timeout in the server to keep the lobby alive

    const lobby_id = Lobby_Store((state) => state.lobby_id);
    const players = Lobby_Store((state) => state.players);
    const set_players = Lobby_Store((state) => state.set_players);
    const update_lobby = Lobby_Store((state) => state.update_lobby);
    const reset_lobby = Lobby_Store((state) => state.reset_lobby);

    const set_stage = Stage_Store((state) => state.set_stage);
    useEffect(() => {
        const handle_lobby_update = ({ lobby_data }) => {
            update_lobby(lobby_data);
            console.log(
                "Lobby Update recevied:",
                lobby_data.players,
                lobby_data.host_uid,
                lobby_data.max_players,
            );
        };

        socket.on("lobby:update", handle_lobby_update);
        return () => {
            socket.off("lobby:update", handle_lobby_update);
        };
    }, [socket, update_lobby]);
    return (
        <div className="lobby-stage">
            <h1>Lobby Stage</h1>
            {socket ? (
                <p>Socket connected: {socket.id}</p>
            ) : (
                <p>Socket not connected</p>
            )}
            <p>Lobby ID: {lobby_id}</p>
            <h2>Players in Lobby:</h2>
            {players.length === 0 ? (
                <p>No players in lobby.</p>
            ) : (
                <ul>
                    {players.map((player) => (
                        <li key={player.firebase_uid}>{player.username}</li>
                    ))}
                </ul>
            )}

            <button
                onClick={() => {
                    socket.emit("lobby:exit");
                    set_stage("home");
                    reset_lobby();
                }}
            >
                Exit Lobby
            </button>
        </div>
    );
}
