import * as THREE from 'https://unpkg.com/three@0.165.0/build/three.module.js';

// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcccccc); // Light grey background

// --- Camera Setup (Orthogonal for Isometric View) ---
const aspectRatio = window.innerWidth / window.innerHeight;
const frustumSize = 10; // Adjust this value to control the "zoom" level

const camera = new THREE.OrthographicCamera(
    frustumSize * aspectRatio / -2,
    frustumSize * aspectRatio / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1, // Near clipping plane
    1000 // Far clipping plane
);

// Position the camera for an isometric view
camera.position.set(10, 10, 10); // Adjust as needed
camera.lookAt(0, 0, 0); // Point towards the origin

// --- Renderer Setup ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
document.body.appendChild(renderer.domElement);

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048; // Increased for better shadow quality
directionalLight.shadow.mapSize.height = 2048; // Increased for better shadow quality
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -15; // Expand shadow camera frustum
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.bottom = -15;
scene.add(directionalLight);

// Helper for directional light shadow camera (useful for debugging shadow boundaries)
// const helper = new THREE.CameraHelper( directionalLight.shadow.camera );
// scene.add( helper );


// --- Load Textures ---
const textureLoader = new THREE.TextureLoader();

const floorTextureUrl = 'https://weat-ctrl.github.io/TheAwakeningGOB/floor/floor.png';
const normalMapUrl = 'https://weat-ctrl.github.io/TheAwakeningGOB/floor/NormalMap.png';
const aoMapUrl = 'https://weat-ctrl.github.io/TheAwakeningGOB/floor/AmbientOcclusionMap.png';

const floorTexture = textureLoader.load(floorTextureUrl);
const normalMap = textureLoader.load(normalMapUrl);
const aoMap = textureLoader.load(aoMapUrl);

floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
aoMap.wrapS = aoMap.wrapT = THREE.RepeatWrapping;

const repeatX = 5;
const repeatY = 5;
floorTexture.repeat.set(repeatX, repeatY);
normalMap.repeat.set(repeatX, repeatY);
aoMap.repeat.set(repeatX, repeatY);


// --- Floor Plane ---
const floorWidth = 20;
const floorHeight = 20;
const planeGeometry = new THREE.PlaneGeometry(floorWidth, floorHeight); // Adjust size as needed
const planeMaterial = new THREE.MeshStandardMaterial({
    map: floorTexture,
    normalMap: normalMap,
    aoMap: aoMap,
    aoMapIntensity: 1.0,
    side: THREE.DoubleSide
});

const floor = new THREE.Mesh(planeGeometry, planeMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);


// --- 2.5D Ruins Setup ---

// Array of your ruin image URLs
const ruinImageUrls = [
    'https://weat-ctrl.github.io/TheAwakeningGOB/ruins/Blue-gray_ruins2.png',
    'https://weat-ctrl.github.io/TheAwakeningGOB/ruins/Blue-gray_ruins3.png',
    'https://weat-ctrl.github.io/TheAwakeningGOB/ruins/Brown_ruins2.png',
    'https://weat-ctrl.github.io/TheAwakeningGOB/ruins/White_ruins3.png',
    'https://weat-ctrl.github.io/TheAwakeningGOB/ruins/Yellow_ruins2.png',
    'https://weat-ctrl.github.io/TheAwakeningGOB/ruins/Yellow_ruins3.png',
];

// Base dimensions for the ruins (adjust these as needed)
// These will be multiplied by a random scale factor
const baseRuinWidth = 2.5; // Example: 2.5 Three.js units wide
const baseRuinHeight = 3.5; // Example: 3.5 Three.js units tall

// Function to add a ruin element
function addRuin(textureUrl, width, height, positionX, positionZ, rotationY = 0) {
    const ruinMap = textureLoader.load(textureUrl);

    ruinMap.encoding = THREE.sRGBEncoding;
    ruinMap.flipY = false; // PNGs usually load with Y flipped, so flip back

    const ruinMaterial = new THREE.MeshStandardMaterial({
        map: ruinMap,
        transparent: true,
        alphaTest: 0.5,    // Crucial for correct transparency sorting and shadow rendering
        side: THREE.DoubleSide // Allow viewing from both sides, if needed
    });

    const ruinGeometry = new THREE.PlaneGeometry(width, height);
    const ruin = new THREE.Mesh(ruinGeometry, ruinMaterial);

    ruin.position.set(positionX, height / 2, positionZ); // Y is half height to sit on floor
    ruin.rotation.y = rotationY;

    ruin.castShadow = true;
    ruin.receiveShadow = true;

    scene.add(ruin);
    return ruin;
}

// Populate the scene with random ruins
const numberOfRuins = 8; // How many ruins you want to place
const padding = 2; // Keep ruins away from the floor edges by this amount
const maxAttempts = 50; // To prevent infinite loops if placement is too constrained

// Define the area where ruins can be placed
const minX = -(floorWidth / 2) + padding;
const maxX = (floorWidth / 2) - padding;
const minZ = -(floorHeight / 2) + padding;
const maxZ = (floorHeight / 2) - padding;

for (let i = 0; i < numberOfRuins; i++) {
    const randomImageUrl = ruinImageUrls[Math.floor(Math.random() * ruinImageUrls.length)];
    const randomScale = 0.8 + Math.random() * 0.4; // Scale between 0.8 and 1.2
    const currentRuinWidth = baseRuinWidth * randomScale;
    const currentRuinHeight = baseRuinHeight * randomScale;

    let placed = false;
    let attempts = 0;

    while (!placed && attempts < maxAttempts) {
        const randomX = minX + Math.random() * (maxX - minX);
        const randomZ = minZ + Math.random() * (maxZ - minZ);
        const randomRotationY = Math.random() * Math.PI * 2; // Full 360 degrees rotation

        // Simple check for overlap (very basic, doesn't account for true shape)
        // For better spacing, you'd need to store placed ruin positions/sizes and check against them.
        // For now, we'll just try to place it.
        const minimumSeparation = 2.5; // Minimum distance between ruin centers

        let overlaps = false;
        // In a real scenario, you'd loop through all already placed ruins and check distance.
        // For this simple example, we're relying more on the random attempts and visual adjustment.
        // If you need strict no-overlap, implement an array to store ruin positions and check distances.

        if (!overlaps) {
            addRuin(randomImageUrl, currentRuinWidth, currentRuinHeight, randomX, randomZ, randomRotationY);
            placed = true;
        }
        attempts++;
    }

    if (!placed) {
        console.warn(`Could not place ruin ${i + 1} after ${maxAttempts} attempts. Consider increasing space or attempts.`);
    }
}


// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// --- Handle Window Resizing ---
window.addEventListener('resize', () => {
    const newAspectRatio = window.innerWidth / window.innerHeight;
    camera.left = frustumSize * newAspectRatio / -2;
    camera.right = frustumSize * newAspectRatio / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
