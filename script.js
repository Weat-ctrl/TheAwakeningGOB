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
    },
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = stream;

    // Wait for the video to load
    videoElement.onloadedmetadata = () => {
      // Set canvas size to match the video's aspect ratio
      const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      if (screenWidth / screenHeight > aspectRatio) {
        // Screen is wider than the video
        canvasElement.width = screenHeight * aspectRatio;
        canvasElement.height = screenHeight;
      } else {
        // Screen is taller than the video
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

startCamera();

// Handle window resizing
window.addEventListener('resize', () => {
  const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  if (screenWidth / screenHeight > aspectRatio) {
    // Screen is wider than the video
    canvasElement.width = screenHeight * aspectRatio;
    canvasElement.height = screenHeight;
  } else {
    // Screen is taller than the video
    canvasElement.width = screenWidth;
    canvasElement.height = screenWidth / aspectRatio;
  }
});
