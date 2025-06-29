export function create_map(scene) {
    // Create static platforms group
    scene.platforms = scene.physics.add.staticGroup();
    scene.platforms.create(400, 580, "ground").setScale(2).refreshBody();
}

export function preload_map(scene) {
    // Load map-related assets
    scene.load.image(
        "ground",
        "https://labs.phaser.io/assets/sprites/platform.png"
    );
}
