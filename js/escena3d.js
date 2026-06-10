import * as THREE from './vendors/three.module.min.js';
import { OrbitControls } from './vendors/OrbitControls.js';
import { GLTFLoader } from './vendors/GLTFLoader.js';

let renderer, scene, camera, controls, loader;
let modeloMaestro = null;

// Nombres de los objetos en el GLB para cada base — deben coincidir exactamente
// con los nombres de los objetos en Blender. Añade aquí si creas más bases.
const BASES = ['base_01', 'base_02', 'base_03', 'base_04', 'base_05'];

// Mapeo estilo → [nombre_hora, nombre_minuto] dentro del GLB.
// Si añades un nuevo estilo de manecillas en Blender, añade aquí su entrada.
const ESTILOS_MANECILLAS = {
  'manecillas_01': ['manecilla_hora_01', 'manecilla_minuto_01'],
  'manecillas_02': ['manecilla_hora_02', 'manecilla_minuto_02'],
  'manecillas_03': ['manecilla_hora_03', 'manecilla_minuto_03'],
};

// Derivados automáticamente del mapeo anterior — no hace falta tocarlos
const GRUPOS_HORA   = Object.values(ESTILOS_MANECILLAS).map(([h]) => h);
const GRUPOS_MINUTO = Object.values(ESTILOS_MANECILLAS).map(([, m]) => m);

// Nombres de los grupos de slots de números en el GLB
const GRUPOS_ADDONS = [
  'arabigos',
  'romanos',
  'dislexicos',
  'emojis',
  'letras',
];

// ── Init ─────────────────────────────────────────────────────────
export function initEscena(container) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xC8C1B2); // color de fondo del visor

  // FOV (40°): ángulo de visión. Más alto = más grande pero más distorsión.
  // near/far (0.1, 100): rango de profundidad renderizable.
  camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
  const isMobile = window.innerWidth <= 768;
  camera.position.set(0, 0, isMobile ? 5 : 8); // más cerca en móvil para que el reloj llene el visor

  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // Luz ambiente: ilumina todo por igual. Intensidad 0–2 aprox.
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  // Luz principal: da volumen y sombras. position(x,y,z) controla de dónde viene.
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.6); // intensidad 0–2
  keyLight.position.set(3, 5, 5);
  keyLight.castShadow = true;
  scene.add(keyLight);

  // Luz de relleno: suaviza las sombras del lado opuesto. Intensidad más baja.
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
  fillLight.position.set(-3, 2, 3);
  scene.add(fillLight);

  // Controles de órbita (arrastrar / zoom)
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;  // inercia al soltar (0 = sin inercia, 1 = no para)
  controls.enablePan = false;     // desactiva desplazamiento lateral
  controls.minDistance = 4;       // zoom mínimo (más cerca del reloj)
  controls.maxDistance = 16;      // zoom máximo (más lejos)
  controls.maxPolarAngle = Math.PI / 1.5; // límite vertical: impide ver desde abajo

  loader = new GLTFLoader();

  window.addEventListener('resize', () => onResize(container));
  animate();

  return renderer;
}

// ── Carga del modelo maestro ──────────────────────────────────────
// El GLB contiene todos los componentes. Los no visibles se ocultan con visible=false.
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
        centrarYEscalar(modeloMaestro, 2.2); // 2.2 = tamaño objetivo en unidades Three.js
        modeloMaestro.traverse(o => {
          if (!o.isMesh) return;
          o.castShadow = true;
          if (o.material) o.material.side = THREE.DoubleSide; // renderiza ambas caras
        });

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
// La primera vez que se colorea un objeto se clona su material y se
// elimina la textura original del GLB, para que el color hex se vea limpio.
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
        o.material.map        = null;  // elimina textura del GLB
        o.material.roughness  = 0.2;  // 0 = espejo, 1 = mate
        o.material.metalness  = 0.0;  // 0 = plástico, 1 = metal
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
// Orienta y escala el modelo para que quepa centrado en el visor.
// tamanoObjetivo = tamaño máximo en unidades Three.js (2.2 ≈ ocupa bien el visor).
// rotation.x = Math.PI/2 corrige la orientación del GLB exportado desde Blender.
function centrarYEscalar(objeto, tamanoObjetivo) {
  objeto.rotation.x = Math.PI / 2; // ajuste de orientación — no cambiar salvo que el modelo cambie

  const box = new THREE.Box3().setFromObject(objeto);
  const size = new THREE.Vector3();
  box.getSize(size);
  const escala = tamanoObjetivo / Math.max(size.x, size.y, size.z);
  objeto.scale.set(escala, escala, escala);

  box.setFromObject(objeto);
  const center = new THREE.Vector3();
  box.getCenter(center);
  objeto.position.sub(center); // centra en el origen
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
