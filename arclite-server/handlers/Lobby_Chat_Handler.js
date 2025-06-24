export function lobby_chat_handler(io, socket, player_manager, lobby_manager) {
    socket.on("lobby_chat:send", ({ lobby_id, username, message }) => {
        const firebase_uid = socket.firebase_uid;


        if (
            !firebase_uid ||
            typeof lobby_id !== "string" ||
            typeof message !== "string" ||
            !message.trim()
        ) {
            socket.emit("error", "Invalid lobby chat input");
            return;
        }

        const player = player_manager.get_player(firebase_uid);
        const lobby = lobby_manager.get_lobby(lobby_id);

        if (!player || !lobby || !lobby.has_player(firebase_uid)) {
            socket.emit("error", "Not in this lobby");
            return;
        }

        const trimmed_msg = message.trim();
        player.update_name(username);

        // 📢 Send message only to clients in this lobby
        io.to(lobby_id).emit("lobby_chat:broadcast", {
            message: trimmed_msg,
            sender: player.name,
            timestamp: Date.now(),
        });
    });
}
