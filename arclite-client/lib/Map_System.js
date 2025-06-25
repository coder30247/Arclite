export function create_map(scene) {
    // Create static platforms group
    const platforms = scene.physics.add.staticGroup();

    // Create ground platform
    platforms.create(400, 580, "ground").setScale(2).refreshBody();

    return platforms;
}

export function preload_map(scene) {
    // Load map-related assets
    scene.load.image(
        "ground",
        "https://labs.phaser.io/assets/sprites/platform.png"
    );
}
