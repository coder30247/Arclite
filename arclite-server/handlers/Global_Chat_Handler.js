export default function Global_Chat_Handler(io, socket, player_manager) {
    socket.on("global_chat:send", ({ username, message }) => {
        const firebase_uid = socket.data?.firebase_uid;

        if (!firebase_uid || typeof message !== "string" || !message.trim()) {
            socket.emit("error", "invalid_global_chat_message");
            return;
        }

        const player = player_manager.get_player(firebase_uid);
        if (!player) {
            socket.emit("error", "player_not_found");
            return;
        }

        player.update_name(username);

        const trimmed_message = message.trim();

        io.emit("global_chat:broadcast", {
            message: trimmed_message,
            sender: player.name,
            timestamp: Date.now(),
        });
    });
}
