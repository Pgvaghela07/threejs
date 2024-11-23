import './style.css'
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import gsap from 'gsap';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 6.5;

// Load HDRI environment map
new RGBELoader()
  .load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/shanghai_bund_1k.hdr', function(texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    // scene.background = texture;
  });

// Load GLTF Model
const loader = new GLTFLoader();
let model;

loader.load(
  './DamagedHelmet.gltf',
  function (gltf) {
    model = gltf.scene;
    scene.add(model);
   
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    console.error('An error happened:', error);
  }
);

const renderer = new THREE.WebGLRenderer({ 
  canvas: document.querySelector('#canvas'),
  antialias: true,
  alpha: true,
 });

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

// Setup post-processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.00085;
composer.addPass(rgbShiftPass);

window.addEventListener("mousemove", (e) => {
  const targetX = (e.clientX / window.innerWidth - 0.5) * (Math.PI) * 0.3;
  const targetY = (e.clientY / window.innerHeight - 0.5) * (Math.PI) * 0.3;
  
  if (model) {
    gsap.to(model.rotation, {
      x: targetY,
      y: targetX,
      duration: 0.9,
      ease: "power2.out"
    });
  }
});

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  composer.setSize(window.innerWidth, window.innerHeight);
  camera.updateProjectionMatrix();
});

// Add OrbitControls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.05;

function animate() {
  window.requestAnimationFrame(animate);
  composer.render(); // Use composer instead of renderer
}
animate();