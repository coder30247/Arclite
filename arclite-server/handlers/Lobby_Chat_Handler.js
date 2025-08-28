export default function Lobby_Chat_Handler(
    io,
    socket,
    player_manager,
    lobby_manager
) {
    socket.on("lobby_chat:send", ({ lobby_id, username, message }) => {
        const firebase_uid = socket.data?.firebase_uid;

        if (
            !firebase_uid ||
            typeof lobby_id !== "string" ||
            typeof message !== "string" ||
            !message.trim()
        ) {
            socket.emit("error", "invalid_lobby_chat_input");
            return;
        }

        const player = player_manager.get_player(firebase_uid);
        const lobby = lobby_manager.get_lobby(lobby_id);

        if (!player || !lobby || !lobby.has_player(firebase_uid)) {
            socket.emit("error", "not_in_lobby");
            return;
        }

        const trimmed_message = message.trim();
        player.update_name(username);

        io.to(lobby_id).emit("lobby_chat:broadcast", {
            message: trimmed_message,
            sender: player.name,
            timestamp: Date.now(),
        });
    });
}
