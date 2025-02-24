// Set up Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Variables
let pigeonModel;
let videoTexture;
let hitCount = 0;
const maxHits = 5;
let smokeParticles;

// UI Elements
const hitCounter = document.getElementById('hit-counter');
const resetButton = document.getElementById('reset-button');

// Load the pigeon model
const gltfLoader = new THREE.GLTFLoader();
gltfLoader.load('https://raw.githubusercontent.com/Weat-ctrl/TheAwakeningGOB/Pigeon.gltf', (gltf) => {
  pigeonModel = gltf.scene;
  pigeonModel.scale.set(0.1, 0.1, 0.1); // Adjust scale
  pigeonModel.position.set(0, 0, -2); // Position the model
  scene.add(pigeonModel);

  // Set up animations
  const animations = gltf.animations;
  const mixer = new THREE.AnimationMixer(pigeonModel);
  const flyingIdleAction = mixer.clipAction(animations.find((clip) => clip.name === 'Flying_Idle'));
  const hitReactAction = mixer.clipAction(animations.find((clip) => clip.name === 'HitReact'));
  const deathAction = mixer.clipAction(animations.find((clip) => clip.name === 'Death'));

  flyingIdleAction.play(); // Start with Flying_Idle animation

  // Store animations for later use
  pigeonModel.userData = { mixer, flyingIdleAction, hitReactAction, deathAction };
});

// Set up Three.js smoke effect
function setupSmokeEffect() {
  const textureLoader = new THREE.TextureLoader();
  const smokeTexture = textureLoader.load('https://raw.githubusercontent.com/Weat-ctrl/TheAwakeningGOB/smoke.png'); // Update path to smoke texture

  const smokeGeometry = new THREE.BufferGeometry();
  const smokeMaterial = new THREE.PointsMaterial({
    size: 0.1,
    map: smokeTexture,
    transparent: true,
    opacity: 0.5,
    color: 0x00aaff, // Blue color
  });

  smokeParticles = new THREE.Points(smokeGeometry, smokeMaterial);
  scene.add(smokeParticles);
}

// Access the front camera using WebRTC
async function startFrontCamera() {
  const constraints = { video: { facingMode: 'user' } }; // Use 'environment' for rear camera
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  const video = document.createElement('video');
  video.srcObject = stream;
  video.play();

  // Create a texture from the video feed
  videoTexture = new THREE.VideoTexture(video);
  const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
  const videoGeometry = new THREE.PlaneGeometry(16, 9); // Adjust aspect ratio as needed
  const videoMesh = new THREE.Mesh(videoGeometry, videoMaterial);
  videoMesh.position.set(0, 0, -5); // Position the video feed
  scene.add(videoMesh);

  // Initialize MediaPipe Hands
  const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  hands.onResults(onResults);

  // Start processing the video feed
  const camera = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: 640,
    height: 480,
  });
  camera.start();
}

// Handle hand landmarks
function onResults(results) {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    if (isPeaceSign(landmarks)) {
      hitPigeon();
    }
  }
}

// Detect peace sign gesture
function isPeaceSign(landmarks) {
  const indexFinger = landmarks[8];
  const middleFinger = landmarks[12];
  const ringFinger = landmarks[16];
  const pinkyFinger = landmarks[20];

  return (
    indexFinger.y < middleFinger.y && // Index and middle fingers are up
    ringFinger.y > middleFinger.y && // Ring and pinky fingers are down
    pinkyFinger.y > middleFinger.y
  );
}

// Hit the pigeon
function hitPigeon() {
  if (hitCount >= maxHits) return;

  hitCount++;
  hitCounter.textContent = `Hits: ${hitCount}`; // Update hit counter

  // Play HitReact animation
  const { mixer, hitReactAction } = pigeonModel.userData;
  hitReactAction.reset().play();

  // Add smoke effect
  addSmokeEffect();

  // On fifth hit, play Death animation and remove pigeon
  if (hitCount === maxHits) {
    setTimeout(() => {
      const { deathAction } = pigeonModel.userData;
      deathAction.reset().play();
      setTimeout(() => {
        pigeonModel.visible = false;
      }, 2000); // Wait for Death animation to finish
    }, 1000); // Wait for HitReact animation to finish
  }
}

// Add smoke effect
function addSmokeEffect() {
  const smokePosition = pigeonModel.position.clone();
  smokePosition.y += 0.5; // Adjust height

  const vertices = [];
  for (let i = 0; i < 100; i++) {
    vertices.push(
      smokePosition.x + (Math.random() - 0.5) * 0.5,
      smokePosition.y + Math.random() * 0.5,
      smokePosition.z + (Math.random() - 0.5) * 0.5
    );
  }

  smokeParticles.geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
}

// Reset the game
resetButton.addEventListener('click', () => {
  hitCount = 0;
  hitCounter.textContent = `Hits: ${hitCount}`;
  pigeonModel.visible = true;
  const { flyingIdleAction } = pigeonModel.userData;
  flyingIdleAction.reset().play();
});

// Render loop
function animate() {
  requestAnimationFrame(animate);

  // Update animations
  if (pigeonModel && pigeonModel.userData.mixer) {
    pigeonModel.userData.mixer.update(0.0167); // Update animations (delta time in seconds)
  }

  // Render the scene
  renderer.render(scene, camera);
}

// Start the front camera and animation
startFrontCamera();
setupSmokeEffect();
animate();

// Handle window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
