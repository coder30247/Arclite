// server/models/Player.js
export default class Player {
    constructor({ firebase_uid, name }) {
        this.firebase_uid = firebase_uid; // firebase uid
        this.name = name;
        this.is_ready = false;
    }

    update_name(new_name) {
        this.name = new_name;
    }

    mark_ready() {
        this.is_ready = true;
    }

    mark_not_ready() {
        this.is_ready = false;
    }

}
