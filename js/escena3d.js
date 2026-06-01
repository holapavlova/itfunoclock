import * as THREE from './vendors/three.module.min.js';
import { OrbitControls } from './vendors/OrbitControls.js';
import { GLTFLoader } from './vendors/GLTFLoader.js';

let renderer, scene, camera, controls, loader;
let modeloBase = null, modeloManecillas = null, grupoAddons = null;
let manecillaHoras = null, manecillaMinutos = null;

const RADIO_ADDONS = 1.25;

export function initEscena(container) {
  // Escena
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xF5F0E8);

  // Cámara
  camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 8);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // Iluminación
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(5, 10, 5);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const rimLight = new THREE.DirectionalLight(0xffeedd, 0.4);
  rimLight.position.set(-4, -2, -4);
  scene.add(rimLight);

  // OrbitControls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.minDistance = 4;
  controls.maxDistance = 16;
  controls.maxPolarAngle = Math.PI / 1.5;

  // GLTFLoader
  loader = new GLTFLoader();

  // Grupo de add-ons
  grupoAddons = new THREE.Group();
  scene.add(grupoAddons);

  // Cubo provisional (se muestra antes de cargar cualquier modelo)
  mostrarCuboDemo();

  // Resize
  window.addEventListener('resize', () => onResize(container));

  // Loop
  animate();

  return renderer;
}

// ── Cubo de demo mientras no hay modelos GLB ──────────────────────
function mostrarCuboDemo() {
  const geo = new THREE.BoxGeometry(1.4, 1.4, 0.25);
  const mat = new THREE.MeshStandardMaterial({ color: 0xF5B800, roughness: 0.4, metalness: 0.1 });
  const cubo = new THREE.Mesh(geo, mat);
  cubo.name = 'cubo-demo';
  cubo.castShadow = true;
  scene.add(cubo);
}

function quitarCuboDemo() {
  const cubo = scene.getObjectByName('cubo-demo');
  if (cubo) {
    cubo.geometry.dispose();
    cubo.material.dispose();
    scene.remove(cubo);
  }
}

// ── Carga de modelos ──────────────────────────────────────────────
export function cargarBase(rutaGlb, onProgress) {
  return new Promise((resolve, reject) => {
    loader.load(
      rutaGlb,
      (gltf) => {
        if (modeloBase) {
          modeloBase.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
          scene.remove(modeloBase);
        }
        quitarCuboDemo();
        modeloBase = gltf.scene;
        centrarYEscalar(modeloBase, 2.2);
        modeloBase.traverse(o => { if (o.isMesh) o.castShadow = true; });
        scene.add(modeloBase);
        resolve(modeloBase);
      },
      onProgress,
      reject
    );
  });
}

export function cargarManecillas(rutaGlb, onProgress) {
  return new Promise((resolve, reject) => {
    loader.load(
      rutaGlb,
      (gltf) => {
        if (modeloManecillas) {
          modeloManecillas.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
          scene.remove(modeloManecillas);
          manecillaHoras = null;
          manecillaMinutos = null;
        }
        modeloManecillas = gltf.scene;
        centrarYEscalar(modeloManecillas, 2.2);

        // Detectar manecillas por nombre en el GLB
        modeloManecillas.traverse(o => {
          if (o.isMesh) {
            const n = o.name.toLowerCase();
            if (n.includes('hora') || n.includes('hour') || n.includes('short')) manecillaHoras = o;
            if (n.includes('minuto') || n.includes('minute') || n.includes('long')) manecillaMinutos = o;
          }
        });

        // Si el modelo no tiene nombres reconocibles, asignar por índice
        if (!manecillaHoras || !manecillaMinutos) {
          const meshes = [];
          modeloManecillas.traverse(o => { if (o.isMesh) meshes.push(o); });
          if (meshes.length >= 2) {
            manecillaHoras   = meshes[0];
            manecillaMinutos = meshes[1];
          }
        }

        scene.add(modeloManecillas);
        resolve(modeloManecillas);
      },
      onProgress,
      reject
    );
  });
}

// ── Add-ons (geometrías primitivas) ──────────────────────────────
export function actualizarAddons(tipoAddon) {
  // Limpiar add-ons anteriores
  while (grupoAddons.children.length) {
    const o = grupoAddons.children[0];
    o.geometry?.dispose();
    o.material?.dispose();
    grupoAddons.remove(o);
  }

  if (!tipoAddon) return;

  const mat = new THREE.MeshStandardMaterial({ color: 0x1A1A1A, roughness: 0.5, metalness: 0.05 });

  for (let i = 0; i < 12; i++) {
    // Ángulo: 12 en arriba (=90°), avanzar en sentido horario
    const angulo = (Math.PI / 2) - (i * (Math.PI * 2) / 12);
    const x = Math.cos(angulo) * RADIO_ADDONS;
    const y = Math.sin(angulo) * RADIO_ADDONS;

    let geo;
    if (tipoAddon.tipo === 'primitiva') {
      // Emojis → esfera pequeña con color
      const colores = [0xFF2D00, 0xF5B800, 0x1A6EFF, 0x00AA44, 0xFF4DA6];
      const color = colores[i % colores.length];
      const matColor = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.1 });
      geo = new THREE.SphereGeometry(0.14, 16, 16);
      const mesh = new THREE.Mesh(geo, matColor);
      mesh.position.set(x, y, 0.15);
      grupoAddons.add(mesh);
      continue;
    }

    // Tipo texto → cilindro como placeholder por cada número
    // (TextGeometry requiere FontLoader — se puede añadir en fase 2)
    const valor = tipoAddon.valores?.[i] ?? (i + 1).toString();
    geo = crearPlaceholderTexto(valor, tipoAddon.id);
    const mesh = new THREE.Mesh(geo, mat.clone());
    mesh.position.set(x, y, 0.15);
    grupoAddons.add(mesh);
  }
}

function crearPlaceholderTexto(valor, addonId) {
  // Distinguir visualmente cada estilo de addon con formas distintas
  if (addonId === 'addon-arabigos') {
    // Cilindro plano
    return new THREE.CylinderGeometry(0.13, 0.13, 0.06, 32);
  } else if (addonId === 'addon-romanos') {
    // Caja fina rectangular
    return new THREE.BoxGeometry(0.22, 0.08, 0.06);
  } else if (addonId === 'addon-letras') {
    // Octaedro pequeño
    return new THREE.OctahedronGeometry(0.12, 0);
  }
  return new THREE.CylinderGeometry(0.12, 0.12, 0.05, 32);
}

// ── Animación de manecillas ──────────────────────────────────────
function actualizarManecillas() {
  if (!manecillaHoras && !manecillaMinutos) return;

  const now = new Date();
  const segundos = now.getSeconds() + now.getMilliseconds() / 1000;
  const minutos  = now.getMinutes() + segundos / 60;
  const horas    = (now.getHours() % 12) + minutos / 60;

  const anguloMinutos = (minutos / 60) * Math.PI * 2;
  const anguloHoras   = (horas / 12) * Math.PI * 2;

  if (manecillaMinutos) manecillaMinutos.rotation.z = -anguloMinutos;
  if (manecillaHoras)   manecillaHoras.rotation.z   = -anguloHoras;
}

// ── Loop de animación ────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  actualizarManecillas();
  renderer.render(scene, camera);
}

// ── Helpers ──────────────────────────────────────────────────────
function centrarYEscalar(objeto, tamanoObjetivo) {
  // Los modelos GLB suelen estar en orientación Y-up (tumbados).
  // Rotamos -90° en X para que la cara del reloj mire hacia la cámara.
  objeto.rotation.x = -Math.PI / 2;

  const box = new THREE.Box3().setFromObject(objeto);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const escala = tamanoObjetivo / maxDim;
  objeto.scale.setScalar(escala);

  box.setFromObject(objeto);
  const center = new THREE.Vector3();
  box.getCenter(center);
  objeto.position.sub(center);
}

function onResize(container) {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

export function capturarCanvas() {
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL('image/png');
}
