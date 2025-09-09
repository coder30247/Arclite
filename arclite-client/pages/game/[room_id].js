// pages/game/[room_id].js
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useStore } from "zustand";
import { useEffect } from "react";

import Ping from "../../components/Ping.js"; // adjust the path
import Block_Routing from "../../lib/Block_Routing.js";

import Socket_Store from "../../states/Socket_Store.js";
import Auth_Store from "../../states/Auth_Store.js";
import Lobby_Store from "../../states/Lobby_Store.js";
import { Initialize_Socket } from "../../lib/Initialize_Socket.js";

const Game_Canvas = dynamic(() => import("../../components/Game_Canvas"), {
    ssr: false, // This avoids trying to render Phaser on the server
});

export default function Game_Page() {
    const { room_id } = useRouter().query;
    Block_Routing();

    const socket = useStore(Socket_Store, (state) => state.socket);
    const firebase_uid = useStore(Auth_Store, (state) => state.firebase_uid);
    const lobby_id = useStore(Lobby_Store, (state) => state.lobby_id);

    const ping = Ping();
    const is_lobby_hydrated = Lobby_Store.persist.hasHydrated();
    const is_auth_hydrated = Auth_Store.persist.hasHydrated();
    const is_ready =
        useRouter().isReady && is_lobby_hydrated && is_auth_hydrated;

    useEffect(() => {
        if (!is_ready) return; // ⬅️ GUARD: wait for router
        if (!socket) {
            console.log(
                `Socket not initialized. Initializing now... UID: ${firebase_uid}`
            );
            Initialize_Socket();
            return;
        }
        if (!lobby_id) {
            console.warn("No lobby_id in query, redirecting...");
            router.push("/");
            return;
        }
    }, [socket, lobby_id, firebase_uid, is_ready]);

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
