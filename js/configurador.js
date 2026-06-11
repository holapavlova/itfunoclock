import { initEscena, cargarModeloMaestro, cambiarBase, cambiarManecillas, cambiarAddons, cambiarColorBase, cambiarColorHora, cambiarColorMinuto, capturarCanvas } from './escena3d.js';

// Paleta de colores disponibles en el configurador. Añadir o cambiar color { id, nombre, hex }
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

// Estado actual del configurador — se guarda en localStorage automáticamente.
// colorBase/Hora/Minuto son hex strings; los demás son IDs del piezas.json.
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
    await cargarModeloMaestro('modelos/reloj-maestro.glb'); // ruta al GLB único
  } catch (err) {
    console.warn('[configurador] No se pudo cargar reloj-maestro.glb:', err);
  }

  // Si hay config guardada en localStorage la usa; si no, aplica los primeros de cada lista
  // y los colores por defecto (blanco para la base, negro para las manecillas).
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
  document.getElementById('resumen-close').addEventListener('click', cerrarResumen);
  document.getElementById('btn-imprimir').addEventListener('click', () => window.print());
  // btn-email no necesita listener: su href se actualiza en generarResumen()
}

// ── Cargar JSON ───────────────────────────────────────────────────
// piezas.json define las opciones del panel: bases, manecillas y add-ons.
async function cargarPiezas() {
  const res = await fetch('data/piezas.json');
  return res.json();
}

// ── Renderizar opciones en el panel ──────────────────────────────
function renderizarOpciones(piezas) {
  renderizarGrid('grid-bases',       piezas.bases,      'base');
  renderizarGrid('grid-manecillas',  piezas.manecillas, 'manecillas', 'col-2'); // col-2 = grid de 2 columnas
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
    card.dataset.id = item.id;           // debe coincidir con el id en piezas.json
    card.dataset.categoria = categoria;  // base | manecillas | addon

    const thumb = item.thumbnail
      ? `<img class="thumb" src="${item.thumbnail}" alt="${item.nombre}">`
      : '';

    card.innerHTML = `
      ${thumb}
      <span class="opcion-nombre">${item.nombre}</span>
    `;

    card.setAttribute('aria-label', item.nombre);
    card.addEventListener('click', () => seleccionar(categoria, item.id));
    container.appendChild(card);
  });
}


// ── Colores ───────────────────────────────────────────────────────
// Renderiza los círculos de color en los contenedores del HTML.
// Los IDs de los contenedores deben existir en index.html.
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
    btn.dataset.id = hex;              // el "id" de un color es su valor hex
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

// Punto central de toda actualización del configurador.
// Recibe un objeto parcial con solo las claves que cambian.
function aplicarSeleccion(parcial) {
  Object.assign(config, parcial);

  // Actualiza el estado visual seleccionado (tanto cards como swatches de color)
  Object.keys(parcial).forEach(categoria => {
    const id = parcial[categoria];
    document.querySelectorAll(`[data-categoria="${categoria}"]`).forEach(el => {
      el.classList.toggle('selected', el.dataset.id === id);
    });
  });

  // Aplica cambios al modelo 3D
  if (parcial.base !== undefined)        cambiarBase(config.base);
  if (parcial.manecillas !== undefined)  cambiarManecillas(config.manecillas);
  if (parcial.addon !== undefined)       cambiarAddons(config.addon);
  if (parcial.colorBase !== undefined && config.colorBase)     cambiarColorBase(config.colorBase);
  if (parcial.colorHora !== undefined && config.colorHora)     cambiarColorHora(config.colorHora);
  if (parcial.colorMinuto !== undefined && config.colorMinuto) cambiarColorMinuto(config.colorMinuto);

  guardarConfiguracion(config);
}

// ── Randomize ─────────────────────────────────────────────────────
function randomize() {
  const btn = document.getElementById('btn-randomize');
  btn.style.transform = 'scale(0.95)';
  setTimeout(() => { btn.style.transform = ''; }, 150);

  const colorRandom = () => PALETA[Math.floor(Math.random() * PALETA.length)].hex;
  aplicarSeleccion({
    base:        piezas.bases[Math.floor(Math.random() * piezas.bases.length)].id,
    manecillas:  piezas.manecillas[Math.floor(Math.random() * piezas.manecillas.length)].id,
    addon:       piezas.addons[Math.floor(Math.random() * piezas.addons.length)].id,
    colorBase:   colorRandom(),
    colorHora:   colorRandom(),
    colorMinuto: colorRandom(),
  });
}

// ── Resumen del pedido ────────────────────────────────────────────
function generarResumen() {
  const base       = piezas.bases.find(b => b.id === config.base);
  const manecillas = piezas.manecillas.find(m => m.id === config.manecillas);
  const addon      = piezas.addons.find(a => a.id === config.addon);

  document.getElementById('resumen-numero').textContent     = `#${generarNumeroPedido()}`;
  document.getElementById('resumen-base').textContent       = base?.nombre       ?? '—';
  document.getElementById('resumen-manecillas').textContent = manecillas?.nombre  ?? '—';
  document.getElementById('resumen-addon').textContent      = addon?.nombre       ?? '—';

  setResumenColor('resumen-color-base',   config.colorBase);
  setResumenColor('resumen-color-hora',   config.colorHora);
  setResumenColor('resumen-color-minuto', config.colorMinuto);

  document.getElementById('resumen-imagen').src = capturarCanvas();
  document.getElementById('resumen-modal').classList.add('open');

  const numero      = document.getElementById('resumen-numero').textContent;
  const nombreBase  = base?.nombre       ?? '—';
  const nombreMan   = manecillas?.nombre  ?? '—';
  const nombreAddon = addon?.nombre       ?? '—';
  const colorBase   = PALETA.find(c => c.hex === config.colorBase)?.nombre   ?? config.colorBase   ?? '—';
  const colorHora   = PALETA.find(c => c.hex === config.colorHora)?.nombre   ?? config.colorHora   ?? '—';
  const colorMin    = PALETA.find(c => c.hex === config.colorMinuto)?.nombre ?? config.colorMinuto ?? '—';

  const asunto = encodeURIComponent(`¡Quiero mi reloj! ${numero}`);
  const cuerpo = encodeURIComponent(
`¡Hola! 👋 He configurado mi reloj en itsfunoclock y me encanta cómo ha quedado.

¡Quiero pedirlo!

🕐 Número de pedido: ${numero}

🔩 Configuración:
• Base: ${nombreBase}
• Manecillas: ${nombreMan}
• Add-on: ${nombreAddon}
• Color base: ${colorBase}
• Color hora: ${colorHora}
• Color minutos: ${colorMin}

💳 Método de pago: Bizum a 600 000 000 — indicar número de pedido ${numero} en el concepto

📦 Dirección de entrega:
Nombre:
Dirección:
Ciudad y código postal:
Teléfono:

👤 Mis datos:
Nombre completo:
Email:

¡Gracias!`
  );

  document.getElementById('btn-email').href = `mailto:info@holapavlova.es?subject=${asunto}&body=${cuerpo}`;
}

// Rellena el chip de color y el nombre en el resumen
function setResumenColor(prefijo, hex) {
  const entrada = PALETA.find(c => c.hex === hex);
  document.getElementById(`${prefijo}-chip`).style.background = hex ?? 'transparent';
  document.getElementById(`${prefijo}-nombre`).textContent    = entrada?.nombre ?? hex ?? '—';
}

// Número único por pedido: IFO-AAAAMMDD-XXXX
function generarNumeroPedido() {
  const now = new Date();
  const fecha = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const aleatorio = String(Math.floor(Math.random() * 9000) + 1000);
  return `IFO-${fecha}-${aleatorio}`;
}

function cerrarResumen() {
  document.getElementById('resumen-modal').classList.remove('open');
}

// ── localStorage ──────────────────────────────────────────────────
// La config se guarda automáticamente en cada selección y se restaura al recargar.
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
