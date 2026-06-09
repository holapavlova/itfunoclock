// GSAP y ScrollTrigger cargados como scripts globales en el HTML
const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);

// ══════════════════════════════════════════════════════════════
// 1. ANIMACIÓN DEL LOADER (Giro de manecillas)
// ══════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  // Minutero (rápido)
  gsap.to("#loader-hand-minuto", {
    rotation: 360,
    svgOrigin: "50 50", // El centro exacto de tu SVG
    duration: 1,
    repeat: -1,
    ease: "linear"
  });

  // Horas (lento)
  gsap.to("#loader-hand-hora", {
    rotation: 360,
    svgOrigin: "50 50", // El centro exacto de tu SVG
    duration: 12,
    repeat: -1,
    ease: "linear"
  });
});

// ══════════════════════════════════════════════════════════════
// 2. DESAPARICIÓN DEL LOADER (Sube como telón al cargar la web)
// ══════════════════════════════════════════════════════════════
window.addEventListener("load", () => {
  gsap.to("#loader", {
    yPercent: -100,         
    duration: 0.8,          
    ease: "power3.inOut",   
    delay: 0.5,             // Medio segundo de cortesía visual
    onComplete: () => {
      document.getElementById("loader").style.display = "none";
    }
  });
});

// ════════════════════════════════════════════════════════════════
// TRANSICIÓN ENTRE PÁGINAS — cortina al navegar a otro .html
// ════════════════════════════════════════════════════════════════
function initPageTransition() {
  const curtain = document.getElementById('page-transition');
  const label   = curtain.querySelector('.pt-label');

  document.querySelectorAll('a[data-transition]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      e.preventDefault();

      const tl = gsap.timeline({
        onComplete: () => { window.location.href = href; }
      });
      tl.set(curtain, { y: '100%' })
        .to(curtain, { y: '0%', duration: 0.6, ease: 'power4.inOut' })
        .to(label,   { opacity: 1, duration: 0.3 }, '-=0.25');
    });
  });
}

// ════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════
// FONDO QUE CAMBIA DE COLOR POR BLOQUE
// ════════════════════════════════════════════════════════════════
function initBackgroundTransitions() {
  const main = document.getElementById('home-main');
  const transitions = [
    { trigger: '#block-timefor',   color: 'var(--color-amarillo)' },
    { trigger: '#block-one',       color: 'var(--color-amarillo)' },
    { trigger: '#block-two',       color: 'var(--color-blanco-roto)' },
    { trigger: '#block-specs',     color: 'var(--color-blanco-roto)' },
    { trigger: '#block-onboarding',color: 'var(--color-azul)' },
    { trigger: '#block-three',     color: 'var(--color-blanco)' },
  ];

  transitions.forEach(({ trigger, color }) => {
    ScrollTrigger.create({
      trigger,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter:     () => gsap.to(main, { backgroundColor: color, duration: 0.8, overwrite: 'auto' }),
      onEnterBack: () => gsap.to(main, { backgroundColor: color, duration: 0.8, overwrite: 'auto' }),
    });
  });
}

// ════════════════════════════════════════════════════════════════
// HEADER — fondo amarillo al hacer scroll
// ════════════════════════════════════════════════════════════════
function initNavScroll() {
  const nav = document.querySelector('.nav-home');
  ScrollTrigger.create({
    start: 'top -1px',
    onUpdate: self => nav.classList.toggle('nav-home--scrolled', self.scroll() > 0),
  });
}

// ════════════════════════════════════════════════════════════════
// BANDAS TIPOGRÁFICAS — desplazamiento horizontal con scroll
// ════════════════════════════════════════════════════════════════
function initMarquees() {
  // ── traducción horizontal guiada por scroll ──
  gsap.utils.toArray('.marquee').forEach(strip => {
    const track = strip.querySelector('.marquee-track');
    gsap.fromTo(track,
      { xPercent: 0 },
      {
        xPercent: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: strip,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        }
      }
    );
  });

  // ── apertura desde el centro (clip-path) al entrar en viewport ──
  const negMarquee = document.querySelector('.marquee--negro');
  if (negMarquee) {
    gsap.fromTo(negMarquee,
      { clipPath: 'inset(0 38% 0 38%)' },
      {
        clipPath: 'inset(0 0% 0 0%)',
        ease: 'expo.inOut',
        duration: 1,
        scrollTrigger: {
          trigger: negMarquee,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        }
      }
    );
  }

  // ── skewX proporcional a la velocidad de scroll (ticker por frame) ──
  const clamp = gsap.utils.clamp(-14, 14);
  const tracks = gsap.utils.toArray('.marquee-track');
  let lastY = window.scrollY;
  let currentSkew = 0;

  gsap.ticker.add(() => {
    const y = window.scrollY;
    const delta = y - lastY;
    lastY = y;
    const target = clamp(delta * 0.9);
    currentSkew += (target - currentSkew) * 0.12;
    tracks.forEach(t => gsap.set(t, { skewX: currentSkew }));
  });
}

// ════════════════════════════════════════════════════════════════
// REVELADOS CON MÁSCARA (clip-path)
// ════════════════════════════════════════════════════════════════
function initReveals() {
  gsap.utils.toArray('[data-reveal]').forEach(el => {
    gsap.to(el, {
      clipPath: 'inset(0 0% 0 0)',
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });
}

// ════════════════════════════════════════════════════════════════
// "ES HORA DE [palabra]" — rotador manual con flechas
// ════════════════════════════════════════════════════════════════
const PALABRAS = [
  'PARAR',
  'DIVERTIRSE',
  'HACER NADA',
  'EL CAFÉ',
  'RESPIRAR',
];

const LETTER_COLORS   = ['c-rojo', 'c-azul', 'c-rosa', 'c-verde'];
const LETTER_ROTS     = [-2, 3, -1, 2, -3, 1, -2, 3, -1, 2, -3, 1];

function wordToHTML(text) {
  let ci = 0;
  return [...text].map((char, i) => {
    if (char === ' ') return '<span class="timefor-letter-gap"></span>';
    const color = LETTER_COLORS[ci % LETTER_COLORS.length];
    const rot   = LETTER_ROTS[ci % LETTER_ROTS.length];
    ci++;
    return `<span class="timefor-letter ${color}" style="--r:${rot}deg">${char}</span>`;
  }).join('');
}

function initTimeFor() {
  const el = document.getElementById('timefor-word');
  let idx = 0;
  let animando = false;

  // render inicial
  el.innerHTML = wordToHTML(PALABRAS[0]);

  function cambiar(delta) {
    if (animando) return;
    animando = true;
    const nuevo = (idx + delta + PALABRAS.length) % PALABRAS.length;
    const salida = delta > 0 ? -50 : 50;
    const entrada = delta > 0 ? 50 : -50;

    gsap.to(el, {
      y: salida, opacity: 0, duration: 0.2,
      onComplete: () => {
        idx = nuevo;
        el.innerHTML = wordToHTML(PALABRAS[idx]);
        gsap.fromTo(el,
          { y: entrada, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, ease: 'back.out(1.5)', onComplete: () => { animando = false; } }
        );
      }
    });
  }

  document.getElementById('timefor-next').addEventListener('click', () => cambiar(1));
  document.getElementById('timefor-prev').addEventListener('click', () => cambiar(-1));

  let auto = setInterval(() => cambiar(1), 2600);
  ['timefor-next', 'timefor-prev'].forEach(id =>
    document.getElementById(id).addEventListener('click', () => clearInterval(auto))
  );
}

// ════════════════════════════════════════════════════════════════
// BLOQUE 1 — manifiesto pinned con scrub
// ════════════════════════════════════════════════════════════════
function initBlockOne() {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#block-one', start: 'top top', end: '+=5500', scrub: 1, pin: true,
      invalidateOnRefresh: true,
    }
  });

  // Estados iniciales dentro de la timeline: al scrub hacia atrás se restauran solos
  tl.set('.rushed-container', { clipPath: 'inset(0 0 100% 0)' })
    .set('.stop-text', { opacity: 0, scale: 0.5 })
    .set('.manifesto-p1, .manifesto-p2, .manifesto-p3', { opacity: 0, scale: 0.9, y: 50 });

  // Fase 1: el texto llena la pantalla línea a línea (clip de arriba a abajo)
  tl.to('.rushed-container', { clipPath: 'inset(0% 0% 0% 0%)', duration: 3, ease: 'none' })
  // Fase 2: el texto escala hasta llenar todo el viewport
    .to('.rushed-text', { scale: 14, duration: 2, ease: 'power2.in', transformOrigin: '50% 50%' })
    .to('.rushed-container', { opacity: 0, duration: 0.5 }, '-=0.4')

    .to('.stop-text', { opacity: 1, scale: 1, duration: 1, ease: 'elastic.out(1, 0.5)' })
    .to('.stop-text', { opacity: 0, scale: 1.5, duration: 1, delay: 0.5 })

    .to('.manifesto-p1', { opacity: 1, scale: 1, y: 0, duration: 1 })
    .to('.manifesto-p1', { opacity: 0, y: -50, duration: 1, delay: 1 })

    .to('.manifesto-p2', { opacity: 1, scale: 1, y: 0, duration: 1 })
    .to('.manifesto-p2', { opacity: 0, y: -50, duration: 1, delay: 1 })

    .to('.manifesto-p3', { opacity: 1, scale: 1, y: 0, duration: 1 })
    .to({}, { duration: 1 });
}

// ════════════════════════════════════════════════════════════════
// BLOQUE 2 — anatomía / blueprint pinned con scrub
// ════════════════════════════════════════════════════════════════
function initBlockTwo() {
  const tl = gsap.timeline({
    scrollTrigger: { trigger: '#block-two', start: 'top top', end: '+=3000', scrub: 1, pin: true }
  });

  tl.from('.layer-base',      { y: 120, autoAlpha: 0, duration: 1 })
    .from('.layer-mechanism', { y: 120, autoAlpha: 0, duration: 1 }, '-=0.5')
    .from('.layer-magnet',    { y: 80,  autoAlpha: 0, duration: 0.8 }, '-=0.4')
    .from('.layer-addons',    { y: 60,  autoAlpha: 0, duration: 0.5, stagger: 0.08 }, '-=0.3')
    .from('.layer-hands',     { y: 100, autoAlpha: 0, duration: 1 }, '-=0.3')
    .from('.layer-lines',     { autoAlpha: 0, duration: 0.5 }, '-=0.5')

    .to({}, { duration: 0.5 })

    .fromTo('.tech-text-1', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5 }, 1)
    .fromTo('.tech-text-2', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5 }, 2)
    .fromTo('.tech-text-3', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5 }, 3);
}

// ════════════════════════════════════════════════════════════════
// BLOQUE SPECS — cards entran como manecillas de reloj
// ════════════════════════════════════════════════════════════════
function initSpecCards() {
  const cards = gsap.utils.toArray('.spec-card');

  // Posición de reloj: 12h → arriba, 3h → derecha, 6h → abajo, 9h → izquierda
  const clockOrigins = [
    { y: -100, x:    0, rotation: -25 }, // 12h
    { y:    0, x:  100, rotation:  25 }, // 3h
    { y:  100, x:    0, rotation:  25 }, // 6h
    { y:    0, x: -100, rotation: -25 }, // 9h
  ];

  cards.forEach((card, i) => {
    gsap.from(card, {
      ...clockOrigins[i],
      autoAlpha: 0,
      duration: 0.9,
      ease: 'back.out(1.4)',
      delay: i * 0.12,
      scrollTrigger: {
        trigger: '.specs-cards',
        start: 'top 80%',
        once: true,
      },
    });
  });
}

// ════════════════════════════════════════════════════════════════
// BOTÓN MAGNÉTICO — el botón CTA se atrae hacia el cursor
// ════════════════════════════════════════════════════════════════
function initMagneticButton() {
  const btn = document.querySelector('.cta-link');
  if (!btn) return;
  const zone = btn.closest('section') || btn.parentElement;
  const RADIUS   = 140; // px — radio de atracción antes de tocar el botón
  const STRENGTH = 0.28; // cuánto se mueve (menor = más sutil)

  zone.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < RADIUS) {
      const pull = 1 - dist / RADIUS; // 0 en el borde del radio, 1 en el centro
      gsap.to(btn, {
        x: dx * STRENGTH * pull,
        y: dy * STRENGTH * pull,
        duration: 0.4,
        ease: 'power3.out',
      });
    } else {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'power3.out' });
    }
  });

  zone.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.3)' });
  });
}

// ════════════════════════════════════════════════════════════════
// TARJETAS 3D — inclinación siguiendo el cursor (tilt)
// ════════════════════════════════════════════════════════════════
function initTiltCards() {
  gsap.utils.toArray('.spec-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2); // -1 a 1
      const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2); // -1 a 1
      gsap.to(card, {
        rotateY:             dx * 10,
        rotateX:            -dy * 10,
        scale:               1.03,
        transformPerspective: 700,
        duration: 0.3,
        ease: 'power2.out',
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        scale:   1,
        transformPerspective: 700,
        duration: 0.7,
        ease: 'elastic.out(1, 0.4)',
      });
    });
  });
}

// ════════════════════════════════════════════════════════════════
// RELOJ CONFIGURABLE — manecillas rotables + círculos arrastrables
// ════════════════════════════════════════════════════════════════
function initDraggableConfig() {
  const svg = document.getElementById('config-svg');
  if (!svg) return;

  const CX = 338.93, CY = 338.93;

  function toSVGPoint(clientX, clientY) {
    const pt = svg.createSVGPoint();
    pt.x = clientX; pt.y = clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  function getAngle(clientX, clientY) {
    const p = toSVGPoint(clientX, clientY);
    return Math.atan2(p.y - CY, p.x - CX) * (180 / Math.PI);
  }

  // — Manecillas: rotan alrededor del centro —
  ['hand-hora', 'hand-minuto'].forEach(id => {
    const hand = document.getElementById(id);
    if (!hand) return;

    let startAngle = 0;
    let baseRot    = 0;
    hand.style.cursor = 'grab';

    hand.addEventListener('pointerdown', e => {
      e.preventDefault();
      hand.setPointerCapture(e.pointerId);
      startAngle = getAngle(e.clientX, e.clientY);
      hand.style.cursor = 'grabbing';
    });

    hand.addEventListener('pointermove', e => {
      if (!e.buttons) return;
      const delta = getAngle(e.clientX, e.clientY) - startAngle;
      gsap.set(hand, { rotation: baseRot + delta, svgOrigin: `${CX} ${CY}` });
    });

    hand.addEventListener('pointerup', e => {
      const delta = getAngle(e.clientX, e.clientY) - startAngle;
      const snapped = Math.round((baseRot + delta) / 30) * 30;
      baseRot = snapped;
      gsap.to(hand, { rotation: snapped, svgOrigin: `${CX} ${CY}`, duration: 0.4, ease: 'back.out(1.5)' });
      hand.style.cursor = 'grab';
    });
  });

  // — Círculos add-on: arrastrables libremente —
  for (let i = 0; i < 12; i++) {
    const circle = document.getElementById(`addon-${i}`);
    if (!circle) continue;

    const origX = parseFloat(circle.getAttribute('cx'));
    const origY = parseFloat(circle.getAttribute('cy'));
    let tx = 0, ty = 0, ox = 0, oy = 0;

    circle.style.cursor = 'grab';

    circle.addEventListener('pointerdown', e => {
      e.preventDefault();
      circle.setPointerCapture(e.pointerId);
      const p = toSVGPoint(e.clientX, e.clientY);
      ox = p.x - origX - tx;
      oy = p.y - origY - ty;
      circle.style.cursor = 'grabbing';
      gsap.to(circle, { scale: 1.15, transformOrigin: `${origX + tx}px ${origY + ty}px`, duration: 0.15 });
    });

    circle.addEventListener('pointermove', e => {
      if (!e.buttons) return;
      const p = toSVGPoint(e.clientX, e.clientY);
      tx = p.x - origX - ox;
      ty = p.y - origY - oy;
      gsap.set(circle, { x: tx, y: ty });
    });

    circle.addEventListener('pointerup', () => {
      circle.style.cursor = 'grab';
      gsap.to(circle, { scale: 1, duration: 0.2 });
    });
  }

  // — Doble clic: resetea todo —
  svg.addEventListener('dblclick', () => {
    ['hand-hora', 'hand-minuto'].forEach(id => {
      const hand = document.getElementById(id);
      if (hand) {
        gsap.to(hand, { rotation: 0, svgOrigin: `${CX} ${CY}`, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      }
    });
    for (let i = 0; i < 12; i++) {
      const c = document.getElementById(`addon-${i}`);
      if (c) gsap.to(c, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)', delay: i * 0.03 });
    }
  });
}

// ════════════════════════════════════════════════════════════════
// CTA final — reveal
// ════════════════════════════════════════════════════════════════
function initCta() {
  ScrollTrigger.create({
    trigger: '#block-three',
    start: 'top 70%',
    once: true,
    onEnter: () => {
      gsap.from('.cta-sub',  { y: 30, opacity: 0, duration: 0.6, delay: 0.3 });
      gsap.from('.cta-link', { y: 30, opacity: 0, duration: 0.6, delay: 0.45 });
    }
  });
}

// ════════════════════════════════════════════════════════════════
// BOTÓN VOLVER ARRIBA
// ════════════════════════════════════════════════════════════════
function initScrollTopBtn() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;

  ScrollTrigger.create({
    start: 'top -300px',
    onEnter:     () => gsap.to(btn, { opacity: 1, y: 0, pointerEvents: 'auto', duration: 0.4, ease: 'power3.out' }),
    onLeaveBack: () => gsap.to(btn, { opacity: 0, y: 14, pointerEvents: 'none', duration: 0.3 }),
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ════════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════════
function startApp() {
  document.body.style.overflow = '';
  initPageTransition();
  initTimeFor();
  initMarquees();
  initReveals();
  initBlockOne();
  initBlockTwo();
  initSpecCards();
  initMagneticButton();
  initTiltCards();
  initDraggableConfig();
  initCta();
  initBackgroundTransitions();
  initNavScroll();
  initScrollTopBtn();

  setTimeout(() => { ScrollTrigger.sort(); ScrollTrigger.refresh(); }, 300);
}

window.addEventListener('load', () => {
  // El loader sube en 0.8s + 0.5s de delay → arrancamos la app cuando termina
  setTimeout(startApp, 1400);
});
