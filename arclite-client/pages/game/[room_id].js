// pages/game/[room_id].js
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import Ping from "../../components/Ping.js"; // adjust the path

import { useStore } from "zustand";
import Socket_Store from "../../states/Socket_Store.js";

const Game_Canvas = dynamic(() => import("../../components/Game_Canvas"), {
    ssr: false, // This avoids trying to render Phaser on the server
});

export default function Game_Page() {
    const { room_id } = useRouter().query;

    // Ensure the socket is initialized before using it
    const socket = useStore(Socket_Store, (state) => state.socket);
    const ping = Ping(socket);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            {ping !== null && (
                <p
                    className={`text-sm mt-1 ${
                        ping < 80
                            ? "text-green-600"
                            : ping < 150
                            ? "text-yellow-600"
                            : "text-red-600"
                    }`}
                >
                    ping: {ping} ms
                </p>
            )}

            <Game_Canvas room_id={room_id} />
        </div>
    );
}
