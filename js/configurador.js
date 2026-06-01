import { initEscena, cargarModeloMaestro, cambiarBase, cambiarManecillas, cambiarAddons, cambiarColorBase, cambiarColorHora, cambiarColorMinuto, capturarCanvas } from './escena3d.js';

const PALETA = [
  { id: 'blanco',   nombre: 'Blanco',   hex: '#FFFFFF' },
  { id: 'negro',    nombre: 'Negro',    hex: '#1A1A1A' },
  { id: 'amarillo', nombre: 'Amarillo', hex: '#F5B800' },
  { id: 'celeste',  nombre: 'Celeste',  hex: '#1A6EFF' },
  { id: 'verde',    nombre: 'Verde',    hex: '#00AA44' },
  { id: 'rosa',     nombre: 'Rosa',     hex: '#FF4DA6' },
  { id: 'rojo',     nombre: 'Rojo',     hex: '#FF2D00' },
];

let piezas = null;
let config = { base: null, manecillas: null, addon: null, colorBase: null, colorHora: null, colorMinuto: null };

// ── Init ─────────────────────────────────────────────────────────
export async function initConfigurador() {
  const container = document.getElementById('canvas-container');
  initEscena(container);

  piezas = await cargarPiezas();

  renderizarOpciones(piezas);
  initColores();
  initTabs();

  try {
    await cargarModeloMaestro('modelos/reloj-maestro.glb');
  } catch (err) {
    console.warn('[configurador] No se pudo cargar reloj-maestro.glb:', err);
  }

  const guardada = cargarConfiguracion();
  aplicarSeleccion(guardada ?? {
    base:        piezas.bases[0].id,
    manecillas:  piezas.manecillas[0].id,
    addon:       piezas.addons[0].id,
    colorBase:   '#FFFFFF',
    colorHora:   '#1A1A1A',
    colorMinuto: '#1A1A1A',
  });

  ocultarLoading();

  document.getElementById('btn-randomize').addEventListener('click', randomize);
  document.getElementById('btn-resumen').addEventListener('click', generarResumen);
  document.getElementById('btn-cerrar-resumen').addEventListener('click', cerrarResumen);
  document.getElementById('btn-imprimir').addEventListener('click', () => window.print());
}

// ── Cargar JSON ───────────────────────────────────────────────────
async function cargarPiezas() {
  const res = await fetch('data/piezas.json');
  return res.json();
}

// ── Renderizar opciones en el panel ──────────────────────────────
function renderizarOpciones(piezas) {
  renderizarGrid('grid-bases',       piezas.bases,      'base');
  renderizarGrid('grid-manecillas',  piezas.manecillas, 'manecillas', 'col-2');
  renderizarGrid('grid-addons',      piezas.addons,     'addon');
}

function renderizarGrid(containerId, items, categoria, extraClass = '') {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (extraClass) container.classList.add(extraClass);

  container.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('button');
    card.className = 'opcion-card';
    card.dataset.id = item.id;
    card.dataset.categoria = categoria;
    card.setAttribute('aria-label', item.nombre);

    const thumb = item.thumbnail
      ? `<img class="thumb" src="${item.thumbnail}" alt="${item.nombre}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';

    card.innerHTML = `
      ${thumb}
      <span class="thumb-placeholder" style="display:${item.thumbnail ? 'none' : 'flex'}">${getIconForItem(item)}</span>
      <span class="opcion-nombre">${item.nombre}</span>
    `;

    card.addEventListener('click', () => seleccionar(categoria, item.id));
    container.appendChild(card);
  });
}

function getIconForItem(item) {
  if (item.id === 'base_01')          return '⭕';
  if (item.id === 'base_02')          return '⬡';
  if (item.id === 'base_03')          return '✿';
  if (item.id === 'base_04')          return '☀';
  if (item.id === 'base_05')          return '〜';
  if (item.id === 'manecillas_01')    return '🎯';
  if (item.id === 'manecillas_02')    return '📐';
  if (item.id === 'manecillas_03')    return '—';
  if (item.id === 'slots_arabigos')   return '1';
  if (item.id === 'slots_romanos')    return 'I';
  if (item.id === 'slots_dislexicos') return 'p';
  if (item.id === 'slots_emojis')     return '●';
  if (item.id === 'slots_letras')     return 'A';
  return '◆';
}

// ── Colores ───────────────────────────────────────────────────────
function initColores() {
  renderizarSwatches('colores-base',   'colorBase');
  renderizarSwatches('colores-hora',   'colorHora');
  renderizarSwatches('colores-minuto', 'colorMinuto');
}

function renderizarSwatches(containerId, categoria) {
  const container = document.getElementById(containerId);
  if (!container) return;
  PALETA.forEach(({ nombre, hex }) => {
    const btn = document.createElement('button');
    btn.className = 'color-swatch';
    btn.dataset.id = hex;
    btn.dataset.categoria = categoria;
    btn.style.background = hex;
    btn.setAttribute('aria-label', nombre);
    btn.title = nombre;
    btn.addEventListener('click', () => seleccionar(categoria, hex));
    container.appendChild(btn);
  });
}

// ── Tabs ──────────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${target}`)?.classList.add('active');
    });
  });
}

// ── Selección y actualización ─────────────────────────────────────
function seleccionar(categoria, id) {
  aplicarSeleccion({ [categoria]: id });
}

function aplicarSeleccion(parcial) {
  Object.assign(config, parcial);

  Object.keys(parcial).forEach(categoria => {
    const id = parcial[categoria];
    document.querySelectorAll(`[data-categoria="${categoria}"]`).forEach(el => {
      el.classList.toggle('selected', el.dataset.id === id);
    });
  });

  if (parcial.base !== undefined)        cambiarBase(config.base);
  if (parcial.manecillas !== undefined)  cambiarManecillas(config.manecillas);
  if (parcial.addon !== undefined)       cambiarAddons(config.addon);
  if (parcial.colorBase !== undefined && config.colorBase)   cambiarColorBase(config.colorBase);
  if (parcial.colorHora !== undefined && config.colorHora)   cambiarColorHora(config.colorHora);
  if (parcial.colorMinuto !== undefined && config.colorMinuto) cambiarColorMinuto(config.colorMinuto);

  guardarConfiguracion(config);
}

// ── Randomize ─────────────────────────────────────────────────────
function randomize() {
  const btn = document.getElementById('btn-randomize');
  btn.style.transform = 'scale(0.95)';
  setTimeout(() => { btn.style.transform = ''; }, 150);

  const color = () => PALETA[Math.floor(Math.random() * PALETA.length)].hex;
  aplicarSeleccion({
    base:        piezas.bases[Math.floor(Math.random() * piezas.bases.length)].id,
    manecillas:  piezas.manecillas[Math.floor(Math.random() * piezas.manecillas.length)].id,
    addon:       piezas.addons[Math.floor(Math.random() * piezas.addons.length)].id,
    colorBase:   color(),
    colorHora:   color(),
    colorMinuto: color(),
  });
}

// ── Resumen del pedido ────────────────────────────────────────────
function generarResumen() {
  const base       = piezas.bases.find(b => b.id === config.base);
  const manecillas = piezas.manecillas.find(m => m.id === config.manecillas);
  const addon      = piezas.addons.find(a => a.id === config.addon);

  document.getElementById('resumen-base').textContent       = base?.nombre       ?? '—';
  document.getElementById('resumen-manecillas').textContent = manecillas?.nombre  ?? '—';
  document.getElementById('resumen-addon').textContent      = addon?.nombre       ?? '—';

  document.getElementById('resumen-imagen').src = capturarCanvas();
  document.getElementById('resumen-modal').classList.add('open');
}

function cerrarResumen() {
  document.getElementById('resumen-modal').classList.remove('open');
}

// ── localStorage ──────────────────────────────────────────────────
function guardarConfiguracion(cfg) {
  localStorage.setItem('reloj-config', JSON.stringify(cfg));
}

function cargarConfiguracion() {
  const saved = localStorage.getItem('reloj-config');
  return saved ? JSON.parse(saved) : null;
}

// ── Loading ───────────────────────────────────────────────────────
function ocultarLoading() {
  const overlay = document.getElementById('loading-overlay');
  overlay.classList.add('hidden');
  setTimeout(() => { overlay.style.display = 'none'; }, 400);
}
