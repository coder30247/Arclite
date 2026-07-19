import { useEffect } from "react";
import { Initialize_Socket } from "../lib/Socket";

export default function Home_Stage() {
    const socket = Initialize_Socket();

    return (
        <div>
            <h1>Home Stage</h1>
            <p>Welcome to the home stage!</p>
            {socket ? (
                <p>Socket connected: {socket.id}</p>
            ) : (
                <p>Socket not connected</p>
            )}
            {socket.connected ? (
                <p>Socket is connected</p>
            ) : (
                <p>Socket is not connected</p>
            )}
        </div>
    );
}
