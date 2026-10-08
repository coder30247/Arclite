export default class Lobby_Player {
    constructor(player) {
        // Player Properties
        this.firebase_uid = player.firebase_uid;
        this.username = player.username;

        // Lobby-specific Properties for the player
        this.ready = false;
    }

    set_ready() {
        this.ready = true;
    }

    set_not_ready() {
        this.ready = false;
    }
}
