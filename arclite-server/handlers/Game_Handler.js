export function game_handler(io, socket, player_manager, lobby_manager) {
    socket.on("start_game", ({ lobby_id }) => {
        const firebase_uid = socket.firebase_uid;

        if (!firebase_uid) {
            console.log(`❌ start_game without auth: ${socket.id}`);
            socket.emit("error", "Unauthorized");
            return;
        }

        if (!lobby_id || typeof lobby_id !== "string") {
            socket.emit("error", "Invalid lobby ID");
            return;
        }

        const player = player_manager.get_player(firebase_uid);
        if (!player) {
            console.log(
                `❌ start_game failed — player not found: ${firebase_uid}`
            );
            socket.emit("error", "Player not found");
            return;
        }

        const lobby = lobby_manager.get_lobby(lobby_id);
        if (!lobby) {
            socket.emit("error", "Lobby not found");
            return;
        }

        if (lobby.host_id !== firebase_uid) {
            socket.emit("error", "Only host can start the game");
            return;
        }

        if (lobby.is_empty()) {
            socket.emit("error", "Cannot start an empty lobby");
            return;
        }

        // Notify all players in the lobby
        io.to(lobby_id).emit("game_started");
        console.log(`🎮 Game started in lobby: ${lobby_id}`);
    });

    socket.on("player:update_position", ({ room_id, x, y }) => {
        // Broadcast the updated position to all other players in the room
        socket.to(room_id).emit("player:position_update", {
            firebase_uid: socket.firebase_uid,
            x,
            y,
        });
    });

    socket.on("bullet:spawn", (data) => {
        socket.to(data.room_id).emit("bullet:spawn", data);
    });

    socket.on("player:hit", ({ shooter_id, victim_id, damage, room_id }) => {
        io.to(room_id).emit("player:hit", { shooter_id, victim_id, damage });
        console.log(`🎯 Player ${victim_id} hit by bullet from ${shooter_id}`);
    });
}
