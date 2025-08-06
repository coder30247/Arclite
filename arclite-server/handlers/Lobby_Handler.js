// server/handlers/Lobby_Handler.js
export function lobby_handler(io, socket, player_manager, lobby_manager) {
    socket.on("create_lobby", ({ lobby_id, username }) => {
        const firebase_uid = socket.firebase_uid;

        if (!firebase_uid) {
            console.log(`❌ create_lobby without auth: ${socket.id}`);
            socket.emit("error", "Unauthorized");
            return;
        }

        const player = player_manager.get_player(firebase_uid);

        if (!player) {
            console.log(`❌ create_lobby failed — no player: ${firebase_uid}`);
            socket.emit("error", "Player not found");
            return;
        }
        player.update_name(username);

        if (!lobby_id || typeof lobby_id !== "string") {
            socket.emit("error", "Invalid lobby ID");
            return;
        }

        if (lobby_manager.lobby_exists(lobby_id)) {
            socket.emit("error", "Lobby ID already taken");
            return;
        }

        try {
            lobby_manager.create_lobby({
                lobby_id,
                host_player: player,
                max_players: 4,
            });

            console.log(`🏠 lobby created: ${lobby_id} by ${firebase_uid}`);

            socket.join(lobby_id);
            socket.lobby_id = lobby_id; // Store lobby ID in socket

            socket.emit("lobby_created", {
                lobby_id,
                firebase_uid: firebase_uid,
            });
        } catch (err) {
            console.log(`⚠️ lobby creation failed: ${err.message}`);
            socket.emit("error", err.message);
        }
    });

    socket.on("join_lobby", ({ lobby_id, username }) => {
        const firebase_uid = socket.firebase_uid;

        if (!firebase_uid) {
            console.log(`❌ join_lobby without auth: ${socket.id}`);
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
                `❌ join_lobby failed — player not found: ${firebase_uid}`
            );
            socket.emit("error", "Player not found");
            return;
        }

        const lobby = lobby_manager.get_lobby(lobby_id);
        if (!lobby) {
            socket.emit("error", "Lobby not found");
            return;
        }

        if (lobby.has_player(firebase_uid)) {
            socket.emit("error", "Already in lobby");
            return;
        }

        try {
            player.update_name(username);
            lobby_manager.add_player_to_lobby(lobby_id, player);
            socket.join(lobby_id);
            socket.lobby_id = lobby_id; // Store lobby ID in socket

            console.log(`➕ ${firebase_uid} joined lobby ${lobby_id}`);
            const host_id = lobby.host_id;

            // Notify the joining player
            socket.emit("joined_lobby", {
                lobby_id: lobby_id,
                players: lobby.get_player_list(),
                host_id: host_id,
            });

            io.to(lobby_id).emit("update_lobby", {
                players: lobby.get_player_list(),
                host_id: host_id,
            });
        } catch (err) {
            console.log(`⚠️ join_lobby failed: ${err.message}`);
            socket.emit("error", err.message);
        }
    });

    socket.on("leave_lobby", ({ lobby_id }) => {
        const firebase_uid = socket.firebase_uid;

        if (!firebase_uid) {
            console.log(`❌ leave_lobby without auth: ${socket.id}`);
            socket.emit("error", "Unauthorized");
            return;
        }

        if (!lobby_id || typeof lobby_id !== "string") {
            socket.emit("error", "Invalid lobby ID");
            return;
        }

        const player = player_manager.get_player(firebase_uid);
        if (!player) {
            socket.emit("error", "Player not found");
            return;
        }

        const lobby = lobby_manager.get_lobby(lobby_id);
        if (!lobby) {
            socket.emit("error", "Lobby not found");
            return;
        }

        if (!lobby.has_player(firebase_uid)) {
            socket.emit("error", "You are not in this lobby");
            return;
        }

        try {
            lobby_manager.remove_player_from_lobby(lobby_id, player);
            socket.leave(lobby_id);
            delete socket.lobby_id; // Clear lobby ID from socket
            console.log(`👋 ${firebase_uid} left lobby ${lobby_id}`);

            // Notify other players in the lobby
            io.to(lobby_id).emit("player:remove", {
                firebase_uid: firebase_uid,
            });

            if (lobby.is_empty()) {
                console.log(`🗑️ deleting empty lobby: ${lobby_id}`);
                lobby_manager.delete_lobby(lobby_id);
            } else {
                // Notify remaining members only if lobby still exists
                io.to(lobby_id).emit("update_lobby", {
                    host_id: lobby.host_id,
                    players: lobby.get_player_list(),
                });
            }
            // Notify the leaver
            socket.emit("left_lobby", { lobby_id });
        } catch (err) {
            console.log(`⚠️ leave_lobby failed: ${err.message}`);
            socket.emit("error", err.message);
        }
    });
}
