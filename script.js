import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcccccc);

// --- Camera Setup (Orthogonal for Isometric View) ---
const aspectRatio = window.innerWidth / window.innerHeight;
let frustumSize = 25;

const camera = new THREE.OrthographicCamera(
    frustumSize * aspectRatio / -2,
    frustumSize * aspectRatio / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1,
    1000
);

camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);

// --- Renderer Setup ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// --- OrbitControls Setup for Touch ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

controls.enableRotate = false; // Keep rotation disabled for fixed isometric view
controls.enablePan = true;
controls.enableZoom = true;

// Define touch actions for OrbitControls
controls.touches = {
    ONE: THREE.TOUCH.PAN,    // One-finger drag to pan
    TWO: THREE.TOUCH.DOLLY,  // Two-finger pinch/spread to zoom (dolly)
    THREE: THREE.TOUCH.PAN   // Optional: Three-finger drag could also pan or do something else
};

// You can also adjust mouse button assignments, though they'll be less relevant for mobile-first.
// Still good practice to keep them reasonable for potential desktop testing.
controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN // You could set this to null if you want to disable right-click on desktop
};

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.bottom = -15;
scene.add(directionalLight);

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
const planeGeometry = new THREE.PlaneGeometry(floorWidth, floorHeight);
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
const ruinImageUrls = [
    'https://weat-ctrl.github.io/TheAwakeningGOB/ruins/Blue-gray_ruins2.png',
    'https://weat-ctrl.github.io/TheAwakeningGOB/ruins/Blue-gray_ruins3.png',
    'https://weat-ctrl.github.io/TheAwakeningGOB/ruins/Brown_ruins2.png',
    'https://weat-ctrl.github.io/TheAwakeningGOB/ruins/White_ruins3.png',
    'https://weat-ctrl.github.io/TheAwakeningGOB/ruins/Yellow_ruins2.png',
    'https://weat-ctrl.github.io/TheAwakeningGOB/ruins/Yellow_ruins3.png',
];

const baseRuinWidth = 2.5;
const baseRuinHeight = 3.5;

function addRuin(textureUrl, width, height, positionX, positionZ, rotationY = 0) {
    const ruinMap = textureLoader.load(textureUrl);

    ruinMap.encoding = THREE.sRGBEncoding;
    ruinMap.flipY = false;

    const ruinMaterial = new THREE.MeshStandardMaterial({
        map: ruinMap,
        transparent: true,
        alphaTest: 0.5,
        side: THREE.DoubleSide
    });

    const ruinGeometry = new THREE.PlaneGeometry(width, height);
    const ruin = new THREE.Mesh(ruinGeometry, ruinMaterial);

    ruin.position.set(positionX, height / 2, positionZ);
    ruin.rotation.y = rotationY;

    ruin.castShadow = true;
    ruin.receiveShadow = true;

    scene.add(ruin);
    return ruin;
}

const numberOfRuins = 8;
const padding = 2;
const maxAttempts = 50;

const minX = -(floorWidth / 2) + padding;
const maxX = (floorWidth / 2) - padding;
const minZ = -(floorHeight / 2) + padding;
const maxZ = (floorHeight / 2) - padding;

for (let i = 0; i < numberOfRuins; i++) {
    const randomImageUrl = ruinImageUrls[Math.floor(Math.random() * ruinImageUrls.length)];
    const randomScale = 0.8 + Math.random() * 0.4;
    const currentRuinWidth = baseRuinWidth * randomScale;
    const currentRuinHeight = baseRuinHeight * randomScale;

    let placed = false;
    let attempts = 0;

    while (!placed && attempts < maxAttempts) {
        const randomX = minX + Math.random() * (maxX - minX);
        const randomZ = minZ + Math.random() * (maxZ - minZ);
        const randomRotationY = Math.random() * Math.PI * 2;

        let overlaps = false;
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
    controls.update(); // Important: Update controls in the animation loop
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
