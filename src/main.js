import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene, camera, and renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10; // Move the camera back so it can see the cubes

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

// OrbitControls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth camera movement
controls.dampingFactor = 0.05;

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
    cube.userData.message = messages[i]; // Store a message for each cube
    scene.add(cube);
    cubes.push(cube);
}

console.log('Cubes created:', cubes); // Debugging: Log cubes to the console

// Animation variables
let animate = true;

// Animation loop
function animateScene() {
    if (animate) {
        requestAnimationFrame(animateScene);

        // Animate cubes
        cubes.forEach(cube => {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
        });

        controls.update();
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
