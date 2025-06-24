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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-blue-600">3Doodle</h1>
            <h2 className="text-2xl font-semibold text-gray-700">
                Welcome, {username}!
            </h2>

            <input
                type="text"
                placeholder="Enter your name"
                className="px-4 py-2 rounded border border-gray-300"
                onChange={(e) => set_username(e.target.value.trim())}
            />

            <Create_Lobby_Button />
            <Join_Lobby_Button />
            <Logout_Button />
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
