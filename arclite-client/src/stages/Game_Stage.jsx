import { Initialize_Socket } from "../lib/Socket";

export default function Game_Stage() {
    const socket = Initialize_Socket();

    return (
        <div>
            <h1>Game Stage</h1>
            <p>Play the Game</p>
        </div>
    );
}
