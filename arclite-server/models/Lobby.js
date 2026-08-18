// server/models/Lobby.js
export default class Lobby {
    constructor(lobby_id, host_player, max_players = 4, lobby_name = "") {
        this.lobby_id = lobby_id; // unique lobby identifier
        this.host_uid = host_player.firebase_uid; // host player id
        this.max_players = max_players; // maximum player limit
        this.players = new Map(); // map of player's firebase_uid to player object
        this.state = "lobby"; // state: lobby, game

        this.lobby_name = lobby_name ? lobby_name.trim() : `lobby-${lobby_id}`; // lobby display name

        this.add_player(host_player); // add host player to the lobby
    }

    // Adding a player to the lobby
    add_player(player) {
        if (this.players.size >= this.max_players) {
            throw new Error("Lobby is full");
        }
        if (this.players.has(player.firebase_uid)) {
            throw new Error("Player already in lobby");
        }
        this.players.set(player.firebase_uid, player);
    }

    // Removing a player from the lobby
    remove_player(firebase_uid) {
        // Validate that player exists in the lobby
        if (!this.players.has(firebase_uid)) {
            throw new Error(
                `Cannot remove player ${firebase_uid}: player not found in lobby ${this.lobby_id}`,
            );
        }
        // Remove the player from the lobby
        this.players.delete(firebase_uid);

        // If the removed player was the host and there are still players in the lobby,
        // assign a new host to the first available player
        if (this.host_uid === firebase_uid && !this.is_empty()) {
            const next_player_uid = this.players.keys().next().value;
            this.host_uid = next_player_uid;
        }
    }

    // Transferring host privileges to another player in the lobby
    transfer_host(new_host_uid) {
        if (!this.players.has(new_host_uid)) {
            throw new Error("New host must be a player in the lobby");
        }
        this.host_uid = new_host_uid;
    }

    get_player(firebase_uid) {
        return this.players.get(firebase_uid);
    }

    has_player(firebase_uid) {
        return this.players.has(firebase_uid);
    }

    is_full() {
        return this.get_player_count() >= this.max_players;
    }

    is_empty() {
        return this.players.size === 0;
    }

    get_all_players() {
        return Array.from(this.players.values());
    }

    get_player_count() {
        return this.players.size;
    }

    start_game() {
        this.state = "game";
    }

    stop_game() {
        this.state = "lobby";
    }

    update_lobby(lobby_name, max_players) {
        if (lobby_name !== undefined) {
            this.lobby_name = lobby_name.trim() || `lobby-${this.lobby_id}`;
        }

        if (max_players !== undefined) {
            // Validate that max_players is a positive number
            if (typeof max_players !== "number" || max_players <= 0) {
                throw new Error("Max players must be a positive number");
            }

            // Validate that new max_players doesn't conflict with current player count
            if (max_players < this.get_player_count()) {
                throw new Error(
                    `Cannot set max players to ${max_players}: lobby currently has ${this.get_player_count()} players`,
                );
            }

            this.max_players = max_players;
        }
    }
}
