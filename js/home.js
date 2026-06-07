// GSAP y ScrollTrigger cargados como scripts globales en el HTML
const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);

// ════════════════════════════════════════════════════════════════
// LOADER — el reloj gira y la pantalla desliza hacia arriba
// ════════════════════════════════════════════════════════════════
function initLoader(onComplete) {
  const loaderEl   = document.getElementById('loader');
  const handHora   = document.getElementById('loader-hand-hora');
  const handMinuto = document.getElementById('loader-hand-minuto');

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.to(loaderEl, {
        yPercent: -100,
        duration: 1.2,
        ease: 'power4.inOut',
        onComplete,
      });
    }
  });

  tl.to(handMinuto, { rotation: 360 * 4, transformOrigin: '50px 50px', duration: 2.5, ease: 'power3.inOut' }, 0)
    .to(handHora,   { rotation: 360,     transformOrigin: '50px 50px', duration: 2.5, ease: 'power3.inOut' }, 0);

  gsap.delayedCall(4.5, () => {
    if (loaderEl && !loaderEl.dataset.done) {
      gsap.set(loaderEl, { yPercent: -100 });
      onComplete();
    }
  });
}

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
    { trigger: '#block-timefor',   color: 'var(--color-negro)' },
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
// BANDAS TIPOGRÁFICAS — desplazamiento horizontal con scroll
// ════════════════════════════════════════════════════════════════
function initMarquees() {
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
  { text: 'PARAR',      color: 'var(--color-rojo)' },
  { text: 'DIVERTIRSE', color: 'var(--color-azul)' },
  { text: 'HACER NADA', color: 'var(--color-verde)' },
  { text: 'EL CAFÉ',    color: 'var(--color-rosa)' },
  { text: 'RESPIRAR',   color: 'var(--color-amarillo)' },
];

function initTimeFor() {
  const el = document.getElementById('timefor-word');
  let idx = 0;
  let animando = false;

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
        el.textContent = PALABRAS[idx].text;
        el.style.color = PALABRAS[idx].color;
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
    scrollTrigger: { trigger: '#block-one', start: 'top top', end: '+=4000', scrub: 1, pin: true }
  });

  gsap.set('.stop-text', { opacity: 0, scale: 0.5 });
  gsap.set('.manifesto-p1, .manifesto-p2, .manifesto-p3', { opacity: 0, scale: 0.9, y: 50 });

  tl.to('.rushed-text', { xPercent: -150, duration: 4, ease: 'none' })
    .to('.rushed-container', { opacity: 0, duration: 0.5 }, '-=0.5')

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

  tl.from('.layer-base',      { y: 100, opacity: 0, duration: 1 })
    .from('.layer-magnet',    { y: 100, opacity: 0, duration: 1 }, '-=0.6')
    .from('.layer-mechanism', { y: 100, opacity: 0, duration: 1 }, '-=0.6')
    .from('.layer-hands',     { y: 100, opacity: 0, duration: 1 }, '-=0.6')

    .to({}, { duration: 0.5 })

    .to('.layer-magnet',    { stroke: 'var(--color-rosa)',     duration: 0.5 })
    .to('.layer-mechanism', { stroke: 'var(--color-amarillo)', duration: 0.5 }, '<')
    .to('.layer-hands',     { stroke: 'var(--color-verde)',    duration: 0.5 }, '<')

    .fromTo('.tech-text-1', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5 }, 1)
    .fromTo('.tech-text-2', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5 }, 2)
    .fromTo('.tech-text-3', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5 }, 3);
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
  initCta();
  initBackgroundTransitions();

  setTimeout(() => { ScrollTrigger.sort(); ScrollTrigger.refresh(); }, 300);
}

document.addEventListener('DOMContentLoaded', () => {
  document.body.style.overflow = 'hidden';
  initLoader(() => {
    document.getElementById('loader').dataset.done = '1';
    startApp();
  });
});
