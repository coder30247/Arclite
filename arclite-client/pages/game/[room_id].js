// pages/game/[room_id].js
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

const Game_Canvas = dynamic(() => import("../../components/Game_Canvas"), {
    ssr: false, // This avoids trying to render Phaser on the server
});

export default function Game_Page() {
    const { room_id } = useRouter().query;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Game_Canvas room_id={room_id} />
        </div>
    );
}
