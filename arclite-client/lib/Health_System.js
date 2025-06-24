// lib/Health_System.js

const player_health = new Map();

export function init_player_health(firebase_uid, max_hp = 100) {
    player_health.set(firebase_uid, {
        current: max_hp,
        max: max_hp,
    });
}

export function apply_damage(firebase_uid, amount) {
    if (!player_health.has(firebase_uid)) return null;

    const health = player_health.get(firebase_uid);
    health.current -= amount;

    if (health.current <= 0) {
        health.current = 0;
        return "dead";
    }

    return "alive";
}

export function get_health(firebase_uid) {
    return player_health.get(firebase_uid) || { current: 0, max: 100 };
}

export function reset_health(firebase_uid) {
    if (player_health.has(firebase_uid)) {
        const max = player_health.get(firebase_uid).max;
        player_health.set(firebase_uid, { current: max, max });
    }
}
