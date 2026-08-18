// server/models/Player.js
export default class Player {
    constructor({ firebase_uid, username }) {
        this.firebase_uid = firebase_uid; // firebase uid
        this.username = username;
    }

    update_username(new_name) {
        this.username = new_name;
    }
}
