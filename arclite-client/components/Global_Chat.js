import { useEffect, useState, useRef } from "react";
import { useStore } from "zustand";
import Socket_Store from "../states/Socket_Store";
import User_Store from "../states/User_Store";
import { FixedSizeList } from "react-window";
import { debounce } from "lodash";

export default function Global_Chat() {
    const username = useStore(User_Store, (state) => state.username);
    const socket = useStore(Socket_Store, (state) => state.socket);
    const [input_message, set_input_message] = useState("");
    const [message_list, set_message_list] = useState([]);
    const [is_connected, set_is_connected] = useState(false);
    const list_ref = useRef(null);

    const append_message = debounce((data) => {
        set_message_list((prev) => {
            const updated = [...prev, data];
            list_ref.current?.scrollToItem(updated.length, "end");
            return updated;
        });
    }, 100);

    useEffect(() => {
        if (!socket) return;

        socket.on("connect", () => set_is_connected(true));
        socket.on("disconnect", () => set_is_connected(false));
        socket.on("connect_error", (error) => {
            console.error("Socket error:", error);
            set_is_connected(false);
        });

        socket.on("global_chat:broadcast", (data) => {
            append_message(data); // { id, sender, message, timestamp }
        });

        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("connect_error");
            socket.off("global_chat:broadcast");
            socket.off("global_chat:players");
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

    const Message_Row = ({ index, style }) => (
        <div
            key={message_list[index].firebase_uid}
            style={style}
            className="mb-1"
        >
            <span className="font-bold">{message_list[index].sender}</span>:{" "}
            {message_list[index].message}
        </div>
    );

    return (
        <div className="fixed right-4 top-4 w-80 bg-white shadow-xl rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">
                Global Chat
            </h3>

            <div className="h-48 overflow-y-auto border border-gray-300 rounded mb-2 p-2 text-sm">
                <FixedSizeList
                    ref={list_ref}
                    height={192} // Match h-48 (48 * 4 = 192px)
                    width="100%"
                    itemCount={message_list.length}
                    itemSize={24} // Adjust if message height varies
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
