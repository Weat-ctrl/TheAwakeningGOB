// Corrected imports using the importmap definitions
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcccccc); // Light grey background

// --- Camera Setup (Orthographic for Isometric View) ---
const aspectRatio = window.innerWidth / window.innerHeight;
let frustumSize = 25; // Adjusted to see more of the floor initially

const camera = new THREE.OrthographicCamera(
    frustumSize * aspectRatio / -2,
    frustumSize * aspectRatio / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1, // Near clipping plane
    1000 // Far clipping plane
);
camera.position.set(10, 10, 10); // Initial position for an isometric view
camera.lookAt(0, 0, 0); // Point towards the origin

// --- Renderer Setup ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
document.body.appendChild(renderer.domElement); // This line works because script.js is loaded after body

// --- OrbitControls Setup for Touch & Mouse ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Animate controls smoothly
controls.dampingFactor = 0.1;

controls.enableRotate = false; // Disable rotation for a fixed isometric angle
controls.enablePan = true;    // Enable panning (moving the camera sideways)
controls.enableZoom = true;   // Enable zooming (scroll wheel / pinch)

// Define touch actions for OrbitControls
controls.touches = {
    ONE: THREE.TOUCH.PAN,    // One-finger drag to pan
    TWO: THREE.TOUCH.DOLLY,  // Two-finger pinch/spread to zoom (dolly)
    THREE: THREE.TOUCH.PAN   // Optional: Three-finger drag could also pan
};

// Define mouse button actions for desktop testing
controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,     // Left click to pan
    MIDDLE: THREE.MOUSE.DOLLY, // Middle click/scroll to zoom
    RIGHT: THREE.MOUSE.PAN     // Right click to pan (instead of rotate)
};

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft overall light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Primary light source
directionalLight.position.set(5, 10, 7.5); // Position of the light source
directionalLight.castShadow = true; // Enable shadow casting for this light
// Configure shadow properties for the directional light
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.bottom = -15;
scene.add(directionalLight);

// Optional: Helper for directional light shadow camera (uncomment to debug shadow boundaries)
// const helper = new THREE.CameraHelper( directionalLight.shadow.camera );
// scene.add( helper );

// --- Loading Manager (for loading screen) ---
const loadingManager = new THREE.LoadingManager();

const loadingScreen = document.getElementById('loading-screen');
const loadingProgressBar = document.getElementById('loading-progress');
const loadedItemsSpan = document.getElementById('loaded-items');
const totalItemsSpan = document.getElementById('total-items');

loadingManager.onStart = function ( url, itemsLoaded, itemsTotal ) {
	console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    loadingScreen.style.display = 'flex'; // Ensure loading screen is visible
    loadedItemsSpan.textContent = itemsLoaded;
    totalItemsSpan.textContent = itemsTotal;
};

loadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
	console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    const progress = (itemsLoaded / itemsTotal) * 100;
    loadingProgressBar.style.width = progress + '%';
    loadedItemsSpan.textContent = itemsLoaded;
    totalItemsSpan.textContent = itemsTotal;
};

// This function is now the start point for our animation loop
loadingManager.onLoad = function ( ) {
	console.log( 'Loading Complete! Starting animation loop.' );
    // Animate the loading screen fading out
    loadingScreen.style.transition = 'opacity 1s ease-out';
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none'; // Hide after transition
    }, 1000);

    animate(); // Start the main animation loop here
};

loadingManager.onError = function ( url ) {
	console.error( 'There was an error loading ' + url );
};

// --- Load Textures (using the loadingManager) ---
const textureLoader = new THREE.TextureLoader(loadingManager); // Pass the manager here

const floorTextureUrl = 'https://weat-ctrl.github.io/TheAwakeningGOB/floor/floor.png';
const normalMapUrl = 'https://weat-ctrl.github.io/TheAwakeningGOB/floor/NormalMap.png';
const aoMapUrl = 'https://weat-ctrl.github.io/TheAwakeningGOB/floor/AmbientOcclusionMap.png';

const floorTexture = textureLoader.load(floorTextureUrl);
const normalMap = textureLoader.load(normalMapUrl);
const aoMap = textureLoader.load(aoMapUrl);

// Explicitly set flipY to false for floor textures for consistency
floorTexture.flipY = false;
normalMap.flipY = false;
aoMap.flipY = false;

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
const planeGeometry = new THREE.PlaneGeometry(floorWidth, floorHeight);
const planeMaterial = new THREE.MeshStandardMaterial({
    map: floorTexture,
    normalMap: normalMap,
    aoMap: aoMap,
    aoMapIntensity: 1.0,
    side: THREE.DoubleSide
});

const floor = new THREE.Mesh(planeGeometry, planeMaterial);
floor.rotation.x = -Math.PI / 2; // Rotate to lay flat on the XZ plane
floor.receiveShadow = true; // Allow the floor to receive shadows
scene.add(floor);

// --- 2.5D Ruins Setup ---
const ruinImageUrls = [
    'https://weat-ctrl.github.io/TheAwakeningGOB/ruins/Blue-gray_ruins2.png',
    'https://weat-ctrl.github.io/TheAwakeningGOB/ruins/Blue-gray_ruins3.png',
    'https://weat-ctrl.github.io/TheAwakeningGOB/ruins/Brown_ruins2.png',
    'https://weat-ctrl.github.io/TheAwakeningGOB/ruins/White_ruins3.png',
    'https://weat-ctrl.github.io/TheAwakeningGOB/ruins/Yellow_ruins2.png',
    'https://weat-ctrl.github.io/TheAwakeningGOB/ruins/Yellow_ruins3.png',
];

const baseRuinWidth = 2.5; // Base dimensions for the ruins (adjust as needed)
const baseRuinHeight = 3.5;

function addRuin(textureUrl, width, height, positionX, positionZ, rotationY = 0) {
    const ruinMap = textureLoader.load(textureUrl);

    // No need for ruinMap.flipY = false if we're rotating the geometry
    // ruinMap.flipY = false; // <--- REMOVED THIS LINE
    ruinMap.encoding = THREE.sRGBEncoding;

    const ruinMaterial = new THREE.MeshStandardMaterial({
        map: ruinMap,
        transparent: true,
        alphaTest: 0.5,    // Crucial for correct transparency sorting and shadow rendering
        side: THREE.DoubleSide // Allow viewing from both sides, if needed
    });

    const ruinGeometry = new THREE.PlaneGeometry(width, height);
    ruinGeometry.rotateY(Math.PI); // <--- ADDED THIS LINE to flip the geometry 180 degrees

    const ruin = new THREE.Mesh(ruinGeometry, ruinMaterial);

    ruin.position.set(positionX, height / 2, positionZ); // Y is half height to sit on floor
    ruin.rotation.y = rotationY; // This rotation is applied ON TOP of the geometry's 180-degree flip

    ruin.castShadow = true;
    ruin.receiveShadow = true;

    scene.add(ruin);
    return ruin;
}

// --- Ruin Placement with Basic Collision Detection ---
const numberOfRuins = 8;
const padding = 2; // Keep ruins away from the floor edges by this amount
const minSeparationDistance = 3.0; // Minimum distance between ruin centers to avoid overlap
const maxAttempts = 50; // To prevent infinite loops if placement is too constrained

// Define the area where ruins can be placed
const minX = -(floorWidth / 2) + padding;
const maxX = (floorWidth / 2) - padding;
const minZ = -(floorHeight / 2) + padding;
const maxZ = (floorHeight / 2) - padding;

const placedRuins = []; // Store placed ruin objects for simple collision detection

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

        let overlaps = false;
        for (const existingRuin of placedRuins) {
            const dx = randomX - existingRuin.x;
            const dz = randomZ - existingRuin.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            // Check if distance is less than the sum of half widths (a rough circle collision)
            // Use a slightly larger minimum separation to ensure more open space
            if (distance < minSeparationDistance) { // Using a fixed minimum separation
                overlaps = true;
                break;
            }
        }

        if (!overlaps) {
            addRuin(randomImageUrl, currentRuinWidth, currentRuinHeight, randomX, randomZ, randomRotationY);
            placedRuins.push({ x: randomX, z: randomZ, width: currentRuinWidth, height: currentRuinHeight });
            placed = true;
        }
        attempts++;
    }

    if (!placed) {
        console.warn(`Could not place ruin ${i + 1} after ${maxAttempts} attempts. Consider increasing space or attempts.`);
    }
}


// --- Test Characters for Front/Behind Demonstration ---
function addCharacter(x, z, materialColor) {
    const characterGeometry = new THREE.PlaneGeometry(1, 2); // Example character size
    const characterMaterial = new THREE.MeshStandardMaterial({ color: materialColor });
    const character = new THREE.Mesh(characterGeometry, characterMaterial);
    character.position.set(x, 1, z); // Y is half height to sit on floor
    character.castShadow = true;
    character.receiveShadow = true;
    scene.add(character);
    return character;
}

// Add test characters to demonstrate depth sorting relative to ruins
// You'll need to manually adjust their Z positions to test against specific ruin placements
addCharacter(0, -2, 0xff0000); // Red character at (0, -2)
addCharacter(2, 0, 0x0000ff);  // Blue character at (2, 0)
addCharacter(-3, 1, 0x00ff00); // Green character at (-3, 1)


// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update OrbitControls in the animation loop
    renderer.render(scene, camera);
}


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
