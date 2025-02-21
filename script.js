// script.js

const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');

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

// Initialize Three.js scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Create sparkles
let sparkles = [];
function createSparkles(x, y) {
  const geometry = new THREE.SphereGeometry(0.05, 8, 8);
  const material = new THREE.MeshBasicMaterial({ color: 0xffd700 }); // Gold color for sparkles

  for (let i = 0; i < 10; i++) {
    const sparkle = new THREE.Mesh(geometry, material);
    sparkle.position.set(x, y, -2); // Position in front of the camera
    scene.add(sparkle);
    sparkles.push(sparkle);
  }
}

// Animate sparkles
function animateSparkles() {
  sparkles.forEach((sparkle, index) => {
    sparkle.position.y += 0.01; // Move up
    sparkle.position.x += (Math.random() - 0.5) * 0.02; // Random horizontal movement
    sparkle.position.z += (Math.random() - 0.5) * 0.02; // Random depth movement

    if (sparkle.position.y > 1) {
      scene.remove(sparkle); // Remove sparkle when it goes off-screen
      sparkles.splice(index, 1);
    }
  });
}

// Render loop
function render() {
  requestAnimationFrame(render);
  animateSparkles();
  renderer.render(scene, camera);
}
render();

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });

      // Detect if the index finger is shown
      if (landmarks[8].y < landmarks[6].y) { // Index fingertip above the base knuckle
        const x = (landmarks[8].x - 0.5) * 2; // Normalize coordinates
        const y = (landmarks[8].y - 0.5) * -2;
        createSparkles(x, y);
      }
    }
  }
  canvasCtx.restore();
}

startCamera();

async function startCamera() {
  const constraints = { video: { facingMode: 'user' } };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = stream;

    videoElement.onloadedmetadata = () => {
      const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      if (screenWidth / screenHeight > aspectRatio) {
        canvasElement.width = screenHeight * aspectRatio;
        canvasElement.height = screenHeight;
      } else {
        canvasElement.width = screenWidth;
        canvasElement.height = screenWidth / aspectRatio;
      }

      const camera = new Camera(videoElement, {
        onFrame: async () => {
          await hands.send({ image: videoElement });
        },
        width: canvasElement.width,
        height: canvasElement.height,
      });

      camera.start();
    };
  } catch (error) {
    console.error('Error starting camera:', error);
    alert(`Failed to start camera: ${error.message}`);
  }
}

window.addEventListener('resize', () => {
  const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  if (screenWidth / screenHeight > aspectRatio) {
    canvasElement.width = screenHeight * aspectRatio;
    canvasElement.height = screenHeight;
  } else {
    canvasElement.width = screenWidth;
    canvasElement.height = screenWidth / aspectRatio;
  }
});
