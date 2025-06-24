import Player from "../models/Player.js";

export default class Player_Manager {
    constructor() {
        this.players = new Map(); // map of firebase uid to player instance
    }

    add_player({ firebase_uid, name, socket_id }) {
        if (this.players.has(firebase_uid)) {
            throw new Error(`Player with ID ${firebase_uid} already exists`);
        }
        const player = new Player({ firebase_uid, name, socket_id });
        this.players.set(firebase_uid, player);
        return player;
    }

    get_player(firebase_uid) {
        return this.players.get(firebase_uid);
    }

    remove_player(firebase_uid) {
        return this.players.delete(firebase_uid);
    }

    update_socket_id(firebase_uid, new_socket_id) {
        const player = this.get_player(firebase_uid);
        if (player) {
            player.update_socket_id(new_socket_id);
        }
    }

    get_all_players() {
        return Array.from(this.players.values());
    }

    clear_all() {
        this.players.clear();
    }
}
