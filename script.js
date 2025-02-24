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

// Variables
let hitCount = 0;
const maxHits = 5;
let pigeonEntity;
let smokeParticles;

// Wait for A-Frame scene to load
document.querySelector('a-scene').addEventListener('loaded', () => {
  pigeonEntity = document.getElementById('pigeon');
  setupSmokeEffect();

  // Get user's location and place the pigeon
  getUserLocation();
});

// Get user's location using Geolocation API
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        placePigeon(latitude, longitude);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location. Please enable location services.');
      }
    );
  } else {
    alert('Geolocation is not supported by your browser.');
  }
}

// Place the pigeon at the user's location
function placePigeon(latitude, longitude) {
  pigeonEntity.setAttribute('gps-entity-place', {
    latitude: latitude,
    longitude: longitude,
  });
  console.log(`Pigeon placed at: ${latitude}, ${longitude}`);
}

// Set up Three.js smoke effect
function setupSmokeEffect() {
  const scene = document.querySelector('a-scene').object3D;
  const textureLoader = new THREE.TextureLoader();
  const smokeTexture = textureLoader.load('https://raw.githubusercontent.com/Weat-ctrl/TheAwakeningGOB/smoke.png');

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

// Detect peace sign gesture
function isPeaceSign(landmarks) {
  // Logic to detect peace sign (e.g., index and middle fingers extended, others folded)
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

// Handle hand landmarks
hands.onResults((results) => {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    if (isPeaceSign(landmarks)) {
      hitPigeon();
    }
  }
});

// Hit the pigeon
function hitPigeon() {
  if (hitCount >= maxHits) return;

  hitCount++;
  console.log(`Hit count: ${hitCount}`);

  // Play HitReact animation
  pigeonEntity.setAttribute('animation-mixer', { clip: 'HitReact', loop: 'once' });

  // Add smoke effect
  addSmokeEffect();

  // On fifth hit, play Death animation and remove pigeon
  if (hitCount === maxHits) {
    setTimeout(() => {
      pigeonEntity.setAttribute('animation-mixer', { clip: 'Death', loop: 'once' });
      setTimeout(() => {
        pigeonEntity.setAttribute('visible', false);
      }, 2000); // Wait for Death animation to finish
    }, 1000); // Wait for HitReact animation to finish
  }
}

// Add smoke effect
function addSmokeEffect() {
  const smokePosition = pigeonEntity.object3D.position.clone();
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

// Start camera and hand tracking
async function startCamera() {
  const constraints = { video: { facingMode: 'user' } };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  const videoElement = document.createElement('video');
  videoElement.srcObject = stream;
  videoElement.play();

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480,
  });
  camera.start();
}

startCamera();
