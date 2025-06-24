export default class Player {
    constructor({ firebase_uid, name, socket_id }) {
        this.firebase_uid = firebase_uid; // firebase uid
        this.name = name;
        this.socket_id = socket_id;
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

    update_socket_id(new_socket_id) {
        this.socket_id = new_socket_id;
    }
}
