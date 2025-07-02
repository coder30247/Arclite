export function reduce_health(scene, victim_id, damage) {
    const victim = scene.player_group
        .getChildren()
        .find((s) => s.firebase_uid === victim_id);

    if (!victim || !victim.active || typeof victim.health !== "number") return;

    victim.health -= damage;

    if (victim.health <= 0 && victim.alive !== false) {
        victim.health = 0;
        victim.alive = false;

        victim.setTint(0xff0000);
        victim.setAlpha(0.5);

        scene.player_group.remove(victim, true);
        victim.destroy();

        console.log(`Player ${victim_id} has been defeated.`);
    }
}
