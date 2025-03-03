// Set up Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1).normalize();
scene.add(light);

// Variables
let paperPlane;
let obstacles = [];
let energySpheres = [];
let lives = 3;
let isGameOver = false;
let velocity = new THREE.Vector3(0, 0, -0.1);
const gravity = new THREE.Vector3(0, -0.005, 0);
const liftForce = new THREE.Vector3(0, 0.01, 0);
let isShieldActive = false;
let shieldEndTime = 0;

// Paper-style material
const paperMaterial = new THREE.MeshStandardMaterial({
  color: 0xf0f0f0, // Light gray for paper
  roughness: 0.8, // Matte finish
  metalness: 0, // Non-metallic
});

// Create the paper plane
function createPaperPlane() {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    0, 0.5, 0,  // Top vertex
    -0.5, -0.5, 0, // Bottom-left vertex
    0.5, -0.5, 0,  // Bottom-right vertex
  ]);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  const indices = new Uint16Array([0, 1, 2]);
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));

  paperPlane = new THREE.Mesh(geometry, paperMaterial);
  paperPlane.position.set(0, 0, 5); // Start position
  scene.add(paperPlane);
  console.log("Paper plane added to scene");
}

// Create procedural obstacles
function createObstacle() {
  const geometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 16);
  const obstacle = new THREE.Mesh(geometry, paperMaterial);
  obstacle.position.set(
    (Math.random() - 0.5) * 10, // Random X position
    (Math.random() - 0.5) * 10, // Random Y position
    -20 // Start behind the camera
  );
  obstacles.push(obstacle);
  scene.add(obstacle);
  console.log("Obstacle added to scene");
}

// Create energy spheres
function createEnergySphere() {
  const geometry = new THREE.SphereGeometry(0.5, 32, 32);
  const sphere = new THREE.Mesh(geometry, paperMaterial);
  sphere.position.set(
    (Math.random() - 0.5) * 10, // Random X position
    (Math.random() - 0.5) * 10, // Random Y position
    -20 // Start behind the camera
  );
  energySpheres.push(sphere);
  scene.add(sphere);
  console.log("Energy sphere added to scene");
}

// Initialize MediaPipe Gesture Recognizer
const gestureRecognizer = new GestureRecognizer({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/gesture_recognizer/${file}`,
});

gestureRecognizer.setOptions({
  maxNumHands: 1,
  modelComplexity: 0,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

gestureRecognizer.onResults((results) => {
  console.log("Gesture results:", results);
  onResults(results);
});

console.log("Gesture Recognizer initialized:", gestureRecognizer);

// Start the game
createPaperPlane();
for (let i = 0; i < 5; i++) {
  createObstacle();
  createEnergySphere();
}

// Render loop
function animate() {
  if (isGameOver) return;

  requestAnimationFrame(animate);

  // Update paper plane position
  paperPlane.position.add(velocity);

  // Render the scene
  renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
