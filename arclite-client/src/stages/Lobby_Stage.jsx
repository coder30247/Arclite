import { Initialize_Socket } from "../lib/Socket";
import { useEffect } from "react";

export default function Lobby_Stage() {
    const socket = Initialize_Socket();

    return (
        <div className="lobby-stage">
            <h1>Lobby Stage</h1>
            {socket ? (
                <p>Socket connected: {socket.id}</p>
            ) : (
                <p>Socket not connected</p>
            )}
        </div>
    );
}
