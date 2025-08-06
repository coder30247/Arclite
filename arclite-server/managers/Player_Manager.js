// server/managers/Player_Manager.js
import Player from "../models/Player.js";

export default class Player_Manager {
    constructor() {
        this.players = new Map(); // map of firebase uid to player instance
    }

    add_player({ firebase_uid, name }) {
        if (this.players.has(firebase_uid)) {
            throw new Error(`Player with ID ${firebase_uid} already exists`);
        }
        const player = new Player({ firebase_uid, name });
        this.players.set(firebase_uid, player);
        return player;
    }

    get_player(firebase_uid) {
        return this.players.get(firebase_uid);
    }

    remove_player(firebase_uid) {
        return this.players.delete(firebase_uid);
    }


    get_all_players() {
        return Array.from(this.players.values());
    }

    clear_all() {
        this.players.clear();
    }

    // Additional utility methods
    get_player_count() {
        return this.players.size;
    }

    update_player_name(firebase_uid, new_name) {
        const player = this.get_player(firebase_uid);
        if (player) {
            player.update_name(new_name);
            return true;
        }
        return false;
    }
}
