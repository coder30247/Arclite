// server/managers/Lobby_Manager.js
import Lobby from "../models/Lobby.js";
export default class Lobby_Manager {
    constructor() {
        this.lobbies = new Map(); // map of lobby id to lobby instance
    }

    is_valid_lobby_id(lobby_id) {
        return typeof lobby_id === "string" && /^[A-Z]{6}$/.test(lobby_id);
    }

    create_lobby(lobby_id, host_player, max_players, lobby_name) {
        if (!this.is_valid_lobby_id(lobby_id)) {
            throw new Error("Invalid lobby ID");
        }
        // Validate that lobby_id doesn't already exist
        if (this.has_lobby(lobby_id)) {
            throw new Error(`Lobby with ID ${lobby_id} already exists`);
        }

        // Validate that max_players is a positive number
        if (typeof max_players !== "number" || max_players <= 0) {
            throw new Error("Max players must be a positive number");
        }

        // Create and store the new lobby
        const lobby = new Lobby(lobby_id, host_player, max_players, lobby_name);
        this.lobbies.set(lobby_id, lobby);
        return lobby;
    }

    get_lobby(lobby_id) {
        return this.lobbies.get(lobby_id);
    }

    remove_lobby(lobby_id) {
        return this.lobbies.delete(lobby_id);
    }

    has_lobby(lobby_id) {
        return this.lobbies.has(lobby_id);
    }

    get_all_lobbies() {
        return Array.from(this.lobbies.values());
    }

    get_lobby_count() {
        return this.lobbies.size;
    }

    clear_all() {
        this.lobbies.clear();
    }

    add_player_to_lobby(lobby_id, player) {
        const lobby = this.get_lobby(lobby_id);
        if (!lobby) {
            throw new Error(`Lobby with ID ${lobby_id} does not exist`);
        }

        lobby.add_player(player);
        return lobby;
    }

    remove_player_from_lobby(lobby_id, firebase_uid) {
        const lobby = this.get_lobby(lobby_id);
        if (!lobby) {
            throw new Error(`Lobby with ID ${lobby_id} does not exist`);
        }

        lobby.remove_player(firebase_uid);

        // If lobby is now empty after removal, consider removing the lobby entirely
        if (lobby.is_empty()) {
            this.remove_lobby(lobby_id);
            return null;
        }

        return lobby;
    }
}
