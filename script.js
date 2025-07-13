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
document.body.appendChild(renderer.domElement);

// --- Lighting ---
// Ambient light to provide overall illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Softer white light
scene.add(ambientLight);

// Directional light to cast shadows and define direction
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5); // Position of the light source
directionalLight.castShadow = true; // Enable shadow casting for this light
scene.add(directionalLight);

// --- Load Textures ---
const textureLoader = new THREE.TextureLoader();

const floorTextureUrl = 'https://weat-ctrl.github.io/TheAwakeningGOB/floor/floor.png';
const normalMapUrl = 'https://weat-ctrl.github.io/TheAwakeningGOB/floor/NormalMap.png';
const specularMapUrl = 'https://weat-ctrl.github.io/TheAwakeningGOB/floor/SpecularMap.png';
const aoMapUrl = 'https://weat-ctrl.github.io/TheAwakeningGOB/floor/AmbientOcclusionMap.png';

const floorTexture = textureLoader.load(floorTextureUrl);
const normalMap = textureLoader.load(normalMapUrl);
const specularMap = textureLoader.load(specularMapUrl);
const aoMap = textureLoader.load(aoMapUrl);

// Optional: Repeat textures if your plane is larger than the texture resolution
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
specularMap.wrapS = specularMap.wrapT = THREE.RepeatWrapping;
aoMap.wrapS = aoMap.wrapT = THREE.RepeatWrapping;

const repeatX = 5; // How many times to repeat the texture along X
const repeatY = 5; // How many times to repeat the texture along Y
floorTexture.repeat.set(repeatX, repeatY);
normalMap.repeat.set(repeatX, repeatY);
specularMap.repeat.set(repeatX, repeatY);
aoMap.repeat.set(repeatX, repeatY);


// --- Floor Plane ---
const planeGeometry = new THREE.PlaneGeometry(20, 20); // Adjust size as needed
const planeMaterial = new THREE.MeshStandardMaterial({
    map: floorTexture,
    normalMap: normalMap,
    specularMap: specularMap, // For MeshStandardMaterial, specularMap can be used like roughnessMap or metalnessMap depending on desired effect and other maps. However, it's often better to use a dedicated roughness/metalness map if available.
    aoMap: aoMap,
    aoMapIntensity: 1.0, // Adjust intensity of ambient occlusion
    side: THREE.DoubleSide // Ensure both sides of the plane are visible
});

const floor = new THREE.Mesh(planeGeometry, planeMaterial);
floor.rotation.x = -Math.PI / 2; // Rotate to lay flat on the XZ plane
floor.receiveShadow = true; // Allow the floor to receive shadows
scene.add(floor);

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
