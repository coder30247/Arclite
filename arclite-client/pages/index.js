import Login_Gate from "../components/Login_Gate.js";
import Create_Lobby_Button from "../components/buttons/Create_Lobby_Button.js";
import Join_Lobby_Button from "../components/buttons/Join_Lobby_Button.js";
import Logout_Button from "../components/buttons/Logout_Button.js";

import User_Store from "../states/User_Store.js";
import Global_Chat from "../components/Global_Chat";

function Home_Content() {
    const username = User_Store((state) => state.username);
    const set_username = User_Store((state) => state.set_username);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">

            <h1 className="text-5xl font-extrabold text-cyan-400 drop-shadow-lg mb-4">
                Arclite
            </h1>
            <h2 className="text-2xl font-medium text-gray-300 mb-8 tracking-wide">
                Welcome,{" "}
                <span className="text-white">{username || "Player"}</span>!
            </h2>

            <input
                type="text"
                placeholder="Enter your name"
                className="w-full max-w-xs mb-6 px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                onChange={(e) => set_username(e.target.value.trim())}
            />

            <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                <Create_Lobby_Button />
                <Join_Lobby_Button />
                <Logout_Button />
            </div>
        </div>
    );
}

export default function Home() {
    return (
        <Login_Gate>
            <Home_Content />
            <Global_Chat />
        </Login_Gate>
    );
}
