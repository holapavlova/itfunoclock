import * as THREE from './vendors/three.module.min.js';
import { OrbitControls } from './vendors/OrbitControls.js';
import { GLTFLoader } from './vendors/GLTFLoader.js';

let renderer, scene, camera, controls, loader;
let modeloMaestro = null;

const BASES = ['base_01', 'base_02', 'base_03', 'base_04', 'base_05'];

const ESTILOS_MANECILLAS = {
  'manecillas_01': ['manecilla_hora_01', 'manecilla_minuto_01'],
  'manecillas_02': ['manecilla_hora_02', 'manecilla_minuto_02'],
  'manecillas_03': ['manecilla_hora_03', 'manecilla_minuto_03'],
};

const GRUPOS_HORA   = Object.values(ESTILOS_MANECILLAS).map(([h]) => h);
const GRUPOS_MINUTO = Object.values(ESTILOS_MANECILLAS).map(([, m]) => m);

const GRUPOS_ADDONS = [
  'slots_arabigos',
  'slots_romanos',
  'slots_dislexicos',
  'slots_emojis',
  'slots_letras',
];

// ── Init ─────────────────────────────────────────────────────────
export function initEscena(container) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xF5F0E8);

  camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 8);

  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
  keyLight.position.set(3, 5, 5);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
  fillLight.position.set(-3, 2, 3);
  scene.add(fillLight);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.minDistance = 4;
  controls.maxDistance = 16;
  controls.maxPolarAngle = Math.PI / 1.5;

  loader = new GLTFLoader();

  window.addEventListener('resize', () => onResize(container));
  animate();

  return renderer;
}

// ── Carga del modelo maestro ──────────────────────────────────────
export function cargarModeloMaestro(ruta, onProgress) {
  return new Promise((resolve, reject) => {
    loader.load(
      ruta,
      (gltf) => {
        if (modeloMaestro) {
          modeloMaestro.traverse(o => {
            if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); }
          });
          scene.remove(modeloMaestro);
        }

        modeloMaestro = gltf.scene;
        centrarYEscalar(modeloMaestro, 2.2);
        modeloMaestro.traverse(o => {
          if (!o.isMesh) return;
          o.castShadow = true;
          if (o.material) o.material.side = THREE.DoubleSide;
        });
        aplicarMaterialSlots(modeloMaestro);
        scene.add(modeloMaestro);
        resolve(modeloMaestro);
      },
      onProgress,
      reject
    );
  });
}

// ── Cambio de base — solo visibilidad ────────────────────────────
export function cambiarBase(id) {
  BASES.forEach(nombre => {
    const obj = modeloMaestro?.getObjectByName(nombre);
    if (obj) obj.visible = (nombre === id);
  });
}

// ── Cambio de manecillas — solo visibilidad ──────────────────────
export function cambiarManecillas(id) {
  Object.values(ESTILOS_MANECILLAS).flat().forEach(nombre => {
    const obj = modeloMaestro?.getObjectByName(nombre);
    if (obj) obj.visible = false;
  });

  const piezas = ESTILOS_MANECILLAS[id];
  if (!piezas) return;

  const [hora, minuto] = piezas;
  const mHora = modeloMaestro?.getObjectByName(hora);
  const mMin  = modeloMaestro?.getObjectByName(minuto);

  if (mHora) mHora.visible = true;
  if (mMin)  mMin.visible  = true;
}

// ── Cambio de add-ons — solo visibilidad ─────────────────────────
export function cambiarAddons(id) {
  GRUPOS_ADDONS.forEach(nombre => {
    const grupo = modeloMaestro?.getObjectByName(nombre);
    if (grupo) grupo.visible = (nombre === id);
  });
}

// ── Color de elementos ────────────────────────────────────────────
function aplicarColorGrupo(nombres, hex) {
  if (!modeloMaestro) return;
  const color = new THREE.Color(hex);
  nombres.forEach(nombre => {
    const obj = modeloMaestro.getObjectByName(nombre);
    if (!obj) return;
    obj.traverse(o => {
      if (!o.isMesh || !o.material) return;
      if (!o.material._custom) {
        o.material = o.material.clone();
        o.material.map        = null;
        o.material.roughness  = 0.4;
        o.material.metalness  = 0.1;
        o.material._custom    = true;
      }
      o.material.color.set(color);
      o.material.needsUpdate = true;
    });
  });
}

export function cambiarColorBase(hex)   { aplicarColorGrupo(BASES, hex); }
export function cambiarColorHora(hex)   { aplicarColorGrupo(GRUPOS_HORA, hex); }
export function cambiarColorMinuto(hex) { aplicarColorGrupo(GRUPOS_MINUTO, hex); }

// ── Loop ─────────────────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// ── Helpers ──────────────────────────────────────────────────────
function aplicarMaterialSlots(objeto) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xF5F0E8, roughness: 0.4, metalness: 0.1, side: THREE.DoubleSide });
  GRUPOS_ADDONS.forEach(nombre => {
    const grupo = objeto.getObjectByName(nombre);
    if (!grupo) return;
    grupo.traverse(o => { if (o.isMesh) o.material = mat; });
  });
}

function centrarYEscalar(objeto, tamanoObjetivo) {
  objeto.rotation.x = Math.PI / 2;

  const box = new THREE.Box3().setFromObject(objeto);
  const size = new THREE.Vector3();
  box.getSize(size);
  const escala = tamanoObjetivo / Math.max(size.x, size.y, size.z);
  objeto.scale.set(escala, escala, escala);

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
