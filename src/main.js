import * as THREE from 'three';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';

// Scene, camera, and renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const INITIAL_CAMERA_POSITION = {
    x: 0,
    y: 0,
    z: 5
  };

// Add reset camera function
function resetCameraPosition() {
    camera.position.set(
      INITIAL_CAMERA_POSITION.x,
      INITIAL_CAMERA_POSITION.y,
      INITIAL_CAMERA_POSITION.z
    );
    camera.rotation.set( 0 ,0 ,0 );
  }
  resetCameraPosition(); // Call the function to reset the camera position
  // Add event listener for reset button
  document.getElementById('resetCamera').addEventListener('click', resetCameraPosition);
  
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

// FlyControls setup
const controls = new FlyControls(camera, renderer.domElement);
controls.movementSpeed = 10; // Default movement speed
controls.rollSpeed = Math.PI / 6; // Adjust roll speed
controls.autoForward = false; // Disable auto-forward
controls.dragToLook = true; // Enable drag-to-look

// Add a reference plane (wireframe)
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc, wireframe: true }); // Wireframe material
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // Rotate the plane to be horizontal
plane.position.y = -5; // Position the plane below the cubes
scene.add(plane);

// Create five cubes with different colors and messages
const geometry = new THREE.BoxGeometry();
const materials = [
    new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }), // Red
    new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }), // Green
    new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true }), // Blue
    new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true }), // Yellow
    new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true }), // Magenta
];

const messages = [
    "This is the red cube!",
    "This is the green cube!",
    "This is the blue cube!",
    "This is the yellow cube!",
    "This is the magenta cube!",
];

const cubes = [];
for (let i = 0; i < 5; i++) {
    const cube = new THREE.Mesh(geometry, materials[i]);
    cube.position.x = (i - 2) * 3; // Position cubes along the x-axis
    cube.position.y = 0; // Position cubes above the plane
    cube.userData.message = messages[i]; // Store a message for each cube
    scene.add(cube);
    cubes.push(cube);
}

console.log('Cubes created:', cubes); // Debugging: Log cubes to the console

// Add a legend for controls
const legend = document.createElement('div');
legend.style.position = 'absolute';
legend.style.top = '10px';
legend.style.left = '10px';
legend.style.color = 'white';
legend.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
legend.style.padding = '10px';
legend.style.fontFamily = 'Arial, sans-serif';
legend.innerHTML = `
    <strong>Controls:</strong><br>
    - Drag to look around<br>
    - W/A/S/D or Arrow Keys: Move<br>
    - Q/E: Roll left/right<br>
    - R/F: Move up/down<br>
    - Shift: Move faster<br>
`;
document.body.appendChild(legend);

// Add a display for camera coordinates
const coordinatesDisplay = document.createElement('div');
coordinatesDisplay.style.position = 'absolute';
coordinatesDisplay.style.top = '10px';
coordinatesDisplay.style.right = '10px';
coordinatesDisplay.style.color = 'white';
coordinatesDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
coordinatesDisplay.style.padding = '10px';
coordinatesDisplay.style.fontFamily = 'Arial, sans-serif';
coordinatesDisplay.innerHTML = `Camera Position: (${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)})`;
document.body.appendChild(coordinatesDisplay);

// Animation variables
let animate = true;

// Shift functionality for faster movement
let isShiftPressed = false;
window.addEventListener('keydown', (event) => {
    if (event.key === 'Shift') {
        controls.movementSpeed = 20; // Increase movement speed when Shift is pressed
        isShiftPressed = true;
    }
});
window.addEventListener('keyup', (event) => {
    if (event.key === 'Shift') {
        controls.movementSpeed = 10; // Reset movement speed when Shift is released
        isShiftPressed = false;
    }
});

// Animation loop
function animateScene() {
    if (animate) {
        requestAnimationFrame(animateScene);

        // Animate cubes
        cubes.forEach(cube => {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
        });

        controls.update(0.016); // Update FlyControls (delta time in seconds)

        // Update camera coordinates display
        coordinatesDisplay.innerHTML = `Camera Position: (${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)})`;

        renderer.render(scene, camera);
    }
}
animateScene();

// Raycaster setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Event listener for mouse click
window.addEventListener('click', (event) => {
    // Normalize mouse coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Find intersections
    const intersects = raycaster.intersectObjects(cubes);

    if (intersects.length > 0) {
        // If a cube is clicked
        const clickedCube = intersects[0].object;
        console.log('Cube clicked:', clickedCube); // Debugging: Log the clicked cube
        animate = false; // Pause animation

        // Show overlay with the cube's message
        const overlay = document.getElementById('overlay');
        const overlayText = document.getElementById('overlay-text');
        overlayText.textContent = clickedCube.userData.message; // Set the message
        overlay.style.display = 'block';
    }
});

// Event listener for close button
const closeButton = document.getElementById('close-button');
closeButton.addEventListener('click', () => {
    // Hide overlay
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'none';

    // Resume animation
    animate = true;
    animateScene();
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});