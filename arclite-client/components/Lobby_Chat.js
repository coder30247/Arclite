import { useEffect, useState, useRef } from "react";
import { useStore } from "zustand";
import Socket_Store from "../states/Socket_Store";
import User_Store from "../states/User_Store";
import { useRouter } from "next/router";
import { FixedSizeList } from "react-window";
import { debounce } from "lodash";

export default function Lobby_Chat({ is_connected }) {
    const username = useStore(User_Store, (state) => state.username);
    const socket = useStore(Socket_Store, (state) => state.socket);
    const router = useRouter();
    const { lobby_id } = router.query;
    const [input_message, set_input_message] = useState("");
    const [message_list, set_message_list] = useState([]);
    const list_ref = useRef(null);

    useEffect(() => {
        if (!socket || !lobby_id) return;

        socket.on("lobby_chat:broadcast", (data) => {
            set_message_list((prev) => {
                const updated = [...prev, data];
                list_ref.current?.scrollToItem(updated.length, "end");
                return updated;
            });
        });

        return () => {
            socket.off("lobby_chat:broadcast");
        };
    }, [socket, lobby_id]);

    const send_message = () => {
        console.log("Sending message:", input_message, lobby_id, is_connected);

        if (input_message.trim() && lobby_id && is_connected) {
            socket.emit("lobby_chat:send", {
                lobby_id: lobby_id,
                username: username,
                message: input_message,
            });
            set_input_message("");
        }
    };

    const Message_Row = ({ index, style }) => (
        <div
            key={`${message_list[index].firebase_uid}_${message_list[index].timestamp}`}
            style={style}
            className="mb-1"
        >
            <span className="font-bold">{message_list[index].sender}</span>:{" "}
            {message_list[index].message}
        </div>
    );

    return (
        <div className="fixed left-4 bottom-4 w-80 bg-white shadow-xl rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-700 mb-2">
                Lobby Chat
            </h3>
            <div className="mb-2 text-sm text-gray-500">
                {is_connected ? "Connected" : "Disconnected"}
            </div>

            <div className="h-48 overflow-y-auto border border-gray-300 rounded mb-2 p-2 text-sm">
                <FixedSizeList
                    ref={list_ref}
                    height={192}
                    width="100%"
                    itemCount={message_list.length}
                    itemSize={24}
                >
                    {Message_Row}
                </FixedSizeList>
            </div>

            <div className="flex space-x-2">
                <input
                    value={input_message}
                    onChange={(e) => set_input_message(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send_message()}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded"
                    placeholder="Say something..."
                    disabled={!is_connected}
                />
                <button
                    onClick={send_message}
                    className="px-2 py-1 bg-green-500 text-white rounded"
                    disabled={!is_connected}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
