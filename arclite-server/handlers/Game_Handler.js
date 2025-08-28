export default function Game_Handler(
    io,
    socket,
    player_manager,
    lobby_manager
) {
    socket.on("start_game", ({ lobby_id }) => {
        const firebase_uid = socket.data?.firebase_uid;

        if (!firebase_uid) {
            console.log(`❌ start_game without auth: ${socket.id}`);
            socket.emit("error", "unauthorized");
            return;
        }

        if (!lobby_id || typeof lobby_id !== "string") {
            socket.emit("error", "invalid_lobby_id");
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

        if (lobby.host_uid !== firebase_uid) {
            socket.emit("error", "only_host_can_start_game");
            return;
        }

        if (lobby.is_empty()) {
            socket.emit("error", "cannot_start_empty_lobby");
            return;
        }

        io.to(lobby_id).emit("game_started");
        console.log(`🎮 game started in lobby: ${lobby_id}`);
    });

    socket.on("player:update_position", ({ room_id, x, y }) => {
        socket.to(room_id).emit("player:position_update", {
            firebase_uid: socket.data?.firebase_uid,
            x,
            y,
        });
    });

    socket.on("bullet:spawn", (data) => {
        socket.to(data.room_id).emit("bullet:spawn", data);
    });

    socket.on("player:hit", ({ shooter_id, victim_id, damage, room_id }) => {
        io.to(room_id).emit("player:hit", { shooter_id, victim_id, damage });
        console.log(`🎯 player ${victim_id} hit by bullet from ${shooter_id}`);
    });
}
