const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');

// Initialize the hand landmarker
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 1, // Detect only one hand
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

hands.onResults(onResults);

// Process the video stream
function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });
    }
  }
  canvasCtx.restore();
}

// Start the front camera
async function startCamera() {
  const constraints = {
    video: {
      facingMode: 'user', // Use the front camera
      width: window.innerWidth, // Match screen width
      height: window.innerHeight, // Match screen height
    },
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = stream;

    // Resize canvas to match video dimensions
    videoElement.onloadedmetadata = () => {
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;

      const camera = new Camera(videoElement, {
        onFrame: async () => {
          await hands.send({ image: videoElement });
        },
        width: videoElement.videoWidth,
        height: videoElement.videoHeight,
      });

      camera.start();
    };
  } catch (error) {
    console.error('Error starting camera:', error);
    alert(`Failed to start camera: ${error.message}`);
  }
}

startCamera();

// Handle window resizing
window.addEventListener('resize', () => {
  canvasElement.width = window.innerWidth;
  canvasElement.height = window.innerHeight;
});
