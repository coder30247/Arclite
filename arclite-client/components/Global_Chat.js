import { useEffect, useState, useRef } from "react";
import { useStore } from "zustand";
import Socket_Store from "../states/Socket_Store";
import User_Store from "../states/User_Store";
import { FixedSizeList } from "react-window";

export default function Global_Chat() {
    const username = useStore(User_Store, (state) => state.username);
    const socket = useStore(Socket_Store, (state) => state.socket);
    const [input_message, set_input_message] = useState("");
    const [message_list, set_message_list] = useState([]);
    const [is_connected, set_is_connected] = useState(false);
    const list_ref = useRef(null);

    useEffect(() => {
        if (!socket) return;

        const handleConnect = () => set_is_connected(true);
        const handleDisconnect = () => set_is_connected(false);
        const handleError = (err) => {
            console.error("Socket error:", err);
            set_is_connected(false);
        };
        const handleBroadcast = (data) => {
            set_message_list((prev) => {
                const updated = [...prev, data];
                if (list_ref.current) {
                    list_ref.current.scrollToItem(updated.length - 1, "end");
                }
                return updated;
            });
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleError);
        socket.on("global_chat:broadcast", handleBroadcast);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleError);
            socket.off("global_chat:broadcast", handleBroadcast);
        };
    }, [socket]);

    const send_message = () => {
        if (input_message.trim() && is_connected) {
            socket.emit("global_chat:send", {
                username,
                message: input_message,
            });
            set_input_message("");
        }
    };

    const Message_Row = ({ index, style }) => {
        const msg = message_list[index];
        return (
            <div
                key={`${msg.firebase_uid || index}_${msg.timestamp || index}`}
                style={style}
                className="mb-1"
            >
                <span className="font-bold">{msg.sender}</span>: {msg.message}
            </div>
        );
    };

    return (
        <div className="fixed right-4 top-4 w-80 bg-white shadow-xl rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">
                Global Chat
            </h3>

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
                    placeholder="Type a message..."
                    disabled={!is_connected}
                />
                <button
                    onClick={send_message}
                    className="px-2 py-1 bg-blue-500 text-white rounded"
                    disabled={!is_connected}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
