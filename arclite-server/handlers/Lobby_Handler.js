export default function Lobby_Handler(
    io,
    socket,
    player_manager,
    lobby_manager
) {
    socket.on("create_lobby", ({ lobby_id, username }) => {
        const firebase_uid = socket.data?.firebase_uid;

        if (!firebase_uid) {
            socket.emit("error", "unauthorized");
            return;
        }

        const player = player_manager.get_player(firebase_uid);
        if (!player) {
            socket.emit("error", "player_not_found");
            return;
        }

        player.update_name(username);

        if (!lobby_id || typeof lobby_id !== "string") {
            socket.emit("error", "invalid_lobby_id");
            return;
        }

        if (lobby_manager.lobby_exists(lobby_id)) {
            socket.emit("error", "lobby_id_taken");
            return;
        }

        lobby_manager.create_lobby({
            lobby_id,
            host_player: player,
            max_players: 4,
        });

        socket.join(lobby_id);
        socket.data.lobby_id = lobby_id;

        socket.emit("lobby_created", { lobby_id, firebase_uid });
        console.log(`🏠 lobby created: ${lobby_id} by ${firebase_uid}`);
    });

    socket.on("join_lobby", ({ lobby_id, username }) => {
        const firebase_uid = socket.data?.firebase_uid;

        if (!firebase_uid) {
            socket.emit("error", "unauthorized");
            return;
        }

        const player = player_manager.get_player(firebase_uid);
        if (!player) {
            socket.emit("error", "player_not_found");
            return;
        }

        const lobby = lobby_manager.get_lobby(lobby_id);
        if (!lobby) {
            socket.emit("error", "lobby_not_found");
            return;
        }

        if (lobby.has_player(firebase_uid)) {
            socket.emit("error", "already_in_lobby");
            return;
        }

        player.update_name(username);
        lobby_manager.add_player_to_lobby(lobby_id, player);

        socket.join(lobby_id);
        socket.data.lobby_id = lobby_id;

        socket.emit("joined_lobby", {
            lobby_id,
            players: lobby.get_player_list(),
            host_uid: lobby.host_uid,
        });

        io.to(lobby_id).emit("update_lobby", {
            players: lobby.get_player_list(),
            host_uid: lobby.host_uid,
        });

        console.log(`➕ ${firebase_uid} joined lobby ${lobby_id}`);
    });

    socket.on("leave_lobby", ({ lobby_id }) => {
        const firebase_uid = socket.data?.firebase_uid;

        if (!firebase_uid) {
            socket.emit("error", "unauthorized");
            return;
        }

        const player = player_manager.get_player(firebase_uid);
        if (!player) {
            socket.emit("error", "player_not_found");
            return;
        }

        const lobby = lobby_manager.get_lobby(lobby_id);
        if (!lobby || !lobby.has_player(firebase_uid)) {
            socket.emit("error", "not_in_lobby");
            return;
        }

        lobby_manager.remove_player_from_lobby(lobby_id, player);
        socket.leave(lobby_id);
        delete socket.data.lobby_id;

        io.to(lobby_id).emit("player:remove", { firebase_uid });

        if (lobby.is_empty()) {
            lobby_manager.delete_lobby(lobby_id);
            console.log(`🗑️ deleted empty lobby: ${lobby_id}`);
        } else {
            io.to(lobby_id).emit("update_lobby", {
                host_uid: lobby.host_uid,
                players: lobby.get_player_list(),
            });
        }

        socket.emit("left_lobby", { lobby_id });
        console.log(`👋 ${firebase_uid} left lobby ${lobby_id}`);
    });
}
