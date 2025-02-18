// Initialize variables
let handLandmarker;
let video;
let canvas;
let canvasCtx;

// Initialize the Hand Landmarker
async function initializeHandLandmarker() {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
    });
}

// Start the webcam and process frames
async function startWebcam() {
    video = document.getElementById("webcam");
    canvas = document.getElementById("output_canvas");
    canvasCtx = canvas.getContext("2d");

    // Get user media (webcam)
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (error) {
        console.error("Error accessing the webcam:", error);
        alert("Unable to access the webcam. Please ensure your camera is connected and permissions are granted.");
        return;
    }

    // Wait for the video to load
    video.addEventListener("loadeddata", () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        processFrame();
    });
}

// Process each video frame
async function processFrame() {
    if (!handLandmarker || !video.videoWidth || !video.videoHeight) {
        requestAnimationFrame(processFrame);
        return;
    }

    // Detect hand landmarks
    const results = handLandmarker.detectForVideo(video, Date.now());

    // Draw landmarks on the canvas
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    if (results.landmarks) {
        for (const landmarks of results.landmarks) {
            drawLandmarks(landmarks);
        }
    }

    // Request the next frame
    requestAnimationFrame(processFrame);
}

// Draw landmarks on the canvas
function drawLandmarks(landmarks) {
    canvasCtx.fillStyle = "#FF0000";
    for (const landmark of landmarks) {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        canvasCtx.beginPath();
        canvasCtx.arc(x, y, 5, 0, 2 * Math.PI);
        canvasCtx.fill();
    }
}

// Initialize everything
(async function main() {
    await initializeHandLandmarker();
    await startWebcam();
})();
