import { initEscena, cargarBase, cargarManecillas, actualizarAddons, capturarCanvas } from './escena3d.js';

let piezas = null;
let config = {
  base:       null,
  manecillas: null,
  addon:      null
};

// ── Init ─────────────────────────────────────────────────────────
export async function initConfigurador() {
  const container = document.getElementById('canvas-container');
  initEscena(container);

  piezas = await cargarPiezas();
  renderizarOpciones(piezas);
  initTabs();

  const guardada = cargarConfiguracion();
  if (guardada) {
    await aplicarSeleccion(guardada, true);
  } else {
    // Selección por defecto: primeros elementos de cada categoría
    await aplicarSeleccion({
      base:       piezas.bases[0].id,
      manecillas: piezas.manecillas[0].id,
      addon:      piezas.addons[0].id
    }, true);
  }

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
  renderizarGrid('grid-bases', piezas.bases, 'base');
  renderizarGrid('grid-manecillas', piezas.manecillas, 'manecillas', 'col-2');
  renderizarGrid('grid-addons', piezas.addons, 'addon');
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
    const icon = getIconForItem(item);

    card.innerHTML = `
      ${thumb}
      <span class="thumb-placeholder" style="display:${item.thumbnail ? 'none' : 'flex'}">${icon}</span>
      <span class="opcion-nombre">${item.nombre}</span>
    `;

    card.addEventListener('click', () => seleccionar(categoria, item.id));
    container.appendChild(card);
  });
}

function getIconForItem(item) {
  if (item.id.includes('base-01'))         return '⭕';
  if (item.id.includes('base-02'))         return '⬡';
  if (item.id.includes('base-03'))         return '✿';
  if (item.id.includes('man-01'))          return '🎯';
  if (item.id.includes('man-02'))          return '📐';
  if (item.id.includes('arabigos'))        return '1';
  if (item.id.includes('romanos'))         return 'I';
  if (item.id.includes('letras'))          return 'A';
  if (item.id.includes('emojis'))          return '●';
  return '◆';
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
async function seleccionar(categoria, id) {
  await aplicarSeleccion({ [categoria]: id });
}

async function aplicarSeleccion(parcial, silencioso = false) {
  const anterior = { ...config };
  Object.assign(config, parcial);

  // Actualizar UI seleccionada
  Object.keys(parcial).forEach(categoria => {
    const id = parcial[categoria];
    document.querySelectorAll(`.opcion-card[data-categoria="${categoria}"]`).forEach(card => {
      card.classList.toggle('selected', card.dataset.id === id);
    });
  });

  // Cargar modelos 3D que han cambiado
  const promesas = [];

  if (parcial.base) {
    const pieza = piezas.bases.find(b => b.id === parcial.base);
    if (pieza) promesas.push(cargarBase(pieza.modelo));
  }

  if (parcial.manecillas) {
    const pieza = piezas.manecillas.find(m => m.id === parcial.manecillas);
    if (pieza) promesas.push(cargarManecillas(pieza.modelo));
  }

  if (parcial.addon !== undefined) {
    const pieza = piezas.addons.find(a => a.id === parcial.addon);
    actualizarAddons(pieza || null);
  }

  await Promise.allSettled(promesas);
  guardarConfiguracion(config);
}

// ── Randomize ─────────────────────────────────────────────────────
async function randomize() {
  const btn = document.getElementById('btn-randomize');
  btn.style.transform = 'scale(0.95)';
  setTimeout(() => { btn.style.transform = ''; }, 150);

  const baseRandom       = piezas.bases[Math.floor(Math.random() * piezas.bases.length)].id;
  const manecillasRandom = piezas.manecillas[Math.floor(Math.random() * piezas.manecillas.length)].id;
  const addonRandom      = piezas.addons[Math.floor(Math.random() * piezas.addons.length)].id;

  await aplicarSeleccion({ base: baseRandom, manecillas: manecillasRandom, addon: addonRandom });
}

// ── Resumen del pedido ────────────────────────────────────────────
function generarResumen() {
  const base       = piezas.bases.find(b => b.id === config.base);
  const manecillas = piezas.manecillas.find(m => m.id === config.manecillas);
  const addon      = piezas.addons.find(a => a.id === config.addon);

  document.getElementById('resumen-base').textContent       = base?.nombre       ?? '—';
  document.getElementById('resumen-manecillas').textContent = manecillas?.nombre  ?? '—';
  document.getElementById('resumen-addon').textContent      = addon?.nombre       ?? '—';

  const imageData = capturarCanvas();
  const img = document.getElementById('resumen-imagen');
  img.src = imageData;

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
