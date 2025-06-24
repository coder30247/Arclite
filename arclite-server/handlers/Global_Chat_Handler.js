export function global_chat_handler(io, socket, player_manager) {
    socket.on("global_chat:send", ({ username, message }) => {
        const firebase_uid = socket.firebase_uid;

        if (!firebase_uid || typeof message !== "string" || !message.trim()) {
            socket.emit("error", "Invalid global chat message");
            return;
        }

        const player = player_manager.get_player(firebase_uid);
        if (!player) {
            socket.emit("error", "Player not found");
            return;
        }

        player.update_name(username);

        const trimmed_msg = message.trim();

        // 🌐 Broadcast to all connected clients
        io.emit("global_chat:broadcast", {
            message: trimmed_msg,
            sender: player.name,
            timestamp: Date.now(),
        });
    });
}
