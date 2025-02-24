// script.js

document.addEventListener("DOMContentLoaded", () => {
  // Initialize MobileConsole
  mobileConsole.init();

  const pigeon = document.getElementById("pigeon");

  // Initial animation
  pigeon.setAttribute("animation-mixer", "clip: Flying_Idle");

  // Function to play HitReact animation
  function playHitReact() {
    pigeon.setAttribute("animation-mixer", "clip: HitReact; loop: once");
  }

  // Function to play Death animation
  function playDeath() {
    pigeon.setAttribute("animation-mixer", "clip: Death; loop: once");
    setTimeout(() => {
      pigeon.parentNode.removeChild(pigeon); // Remove the pigeon
    }, 1000); // Adjust the timeout to match the length of the Death animation
  }

  // Count hits
  let hitCount = 0;

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
  function createBlueFlame() {
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Blue color for flame
    const flame = new THREE.Mesh(geometry, material);
    
    flame.position.set(0, 0, -2); // Position in front of the camera
    scene.add(flame);
    sparkles.push(flame); // Reuse the sparkles array for flames
    
    // Animate flame
    function animateFlame() {
      flame.position.y += 0.02; // Move up
      flame.position.x += (Math.random() - 0.5) * 0.04; // Random horizontal movement
      flame.position.z += (Math.random() - 0.5) * 0.04; // Random depth movement

      if (flame.position.y > 1) {
        scene.remove(flame); // Remove flame when it goes off-screen
      }
    }

    render();
  }

  // Render loop
  function render() {
    requestAnimationFrame(render);
    animateSparkles();
    renderer.render(scene, camera);
  }
  render();

  // Detect peace sign gesture and play animations
  function onResults(results) {
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        if (isPeaceSign(landmarks)) {
          hitCount++;
          playHitReact();

          if (hitCount >= 5) {
            playDeath();
          }

          // Create and animate the blue flame (Three.js code here)
          createBlueFlame();
        }
      }
    }
  }

  // Get user's location and update AR.js entity
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }

  function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    pigeon.setAttribute("gps-entity-place", `latitude: ${latitude}; longitude: ${longitude}`);
  }

  function showError(error) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        console.error("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        console.error("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        console.error("The request to get user location timed out.");
        break;
      case error.UNKNOWN_ERROR:
        console.error("An unknown error occurred.");
        break;
    }
  }

  getLocation();
});
