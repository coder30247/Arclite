import Lobby from "../models/Lobby.js";
export default class Lobby_Manager {
    constructor() {
        this.lobbies = new Map(); // map of lobby id to lobby instance
    }

    create_lobby({ lobby_id, host_player, max_players = 8, name = "" }) {
        if (this.lobbies.has(lobby_id)) {
            throw new Error(`Lobby with ID ${lobby_id} already exists`);
        }
        const lobby = new Lobby(lobby_id, host_player, max_players, name);
        this.lobbies.set(lobby_id, lobby);
        return lobby;
    }

    get_lobby(lobby_id) {
        return this.lobbies.get(lobby_id);
    }

    delete_lobby(lobby_id) {
        this.lobbies.delete(lobby_id);
    }

    add_player_to_lobby(lobby_id, player) {
        const lobby = this.get_lobby(lobby_id);
        if (!lobby) {
            throw new Error(`Lobby ${lobby_id} not found`);
        }
        lobby.add_player(player);
        return lobby;
    }

    remove_player_from_lobby(lobby_id, player) {
        const lobby = this.get_lobby(lobby_id);
        if (!lobby) {
            throw new Error(`Lobby ${lobby_id} not found`);
        }
        lobby.remove_player(player.firebase_uid);
    }

    get_all_lobbies() {
        return Array.from(this.lobbies.values());
    }

    lobby_exists(lobby_id) {
        return this.lobbies.has(lobby_id);
    }
}
