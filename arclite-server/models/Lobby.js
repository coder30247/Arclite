export default class Lobby {
    constructor(lobby_id, host_player, max_players = 8, name = "") {
        this.lobby_id = lobby_id; // unique lobby identifier
        this.name = name ? name.trim() : `lobby-${lobby_id}`; // lobby display name
        this.host_id = host_player.firebase_uid; // host player id
        this.max_players = max_players; // maximum player limit
        this.players = new Map(); // map of player id to player object
        this.game_state = "lobby"; // state: lobby, in_game, finished
        this.add_player(host_player);
    }

    add_player(player) {
        if (this.players.size >= this.max_players) {
            throw new Error("Lobby is full");
        }
        if (this.players.has(player.firebase_uid)) {
            throw new Error("Player already in lobby");
        }
        this.players.set(player.firebase_uid, player);
    }

    remove_player(player_id) {
        const player = this.players.get(player_id);
        if (!player) {
            throw new Error(`Player with ID ${player_id} not found in lobby`);
        }
        this.players.delete(player_id);
        if (player.firebase_uid === this.host_id) {
            this.assign_new_host();
        }
    }

    assign_new_host() {
        const new_host = this.get_player_list()[0];
        if (new_host) {
            this.host_id = new_host.firebase_uid;
        }
    }

    is_empty() {
        return this.players.size === 0;
    }

    get_player_list() {
        return Array.from(this.players.values());
    }

    has_player(firebase_uid) {
        return this.players.has(firebase_uid);
    }

    set_game_state(state) {
        const valid_states = ["lobby", "in_game", "finished"];
        if (!valid_states.includes(state)) {
            throw new Error(`Invalid game state: ${state}`);
        }
        this.game_state = state;
    }
}
