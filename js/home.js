// GSAP y ScrollTrigger cargados como scripts globales en el HTML
const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);

// ── Loader — relojito SVG con manecillas en tiempo real ───────────
function initLoader() {
  const loaderEl   = document.getElementById('loader');
  const handHora   = document.getElementById('loader-hand-hora');
  const handMinuto = document.getElementById('loader-hand-minuto');

  let raf;

  function tickLoader() {
    const now  = new Date();
    const seg  = now.getSeconds() + now.getMilliseconds() / 1000;
    const min  = now.getMinutes() + seg / 60;
    const hor  = (now.getHours() % 12) + min / 60;
    const degM = (min / 60) * 360;
    const degH = (hor / 12) * 360;

    if (handMinuto) handMinuto.style.transform = `rotate(${degM}deg)`;
    if (handHora)   handHora.style.transform   = `rotate(${degH}deg)`;

    raf = requestAnimationFrame(tickLoader);
  }

  tickLoader();

  // Ocultar loader cuando la página esté lista
  const minTime = 1200; // mínimo 1.2s para que se vea el relojito
  const startTime = Date.now();

  window.addEventListener('load', () => {
    const elapsed = Date.now() - startTime;
    const delay   = Math.max(0, minTime - elapsed);

    setTimeout(() => {
      cancelAnimationFrame(raf);
      loaderEl.classList.add('hidden');
      initAnimations();
    }, delay);
  });
}

// ── Animaciones principales ───────────────────────────────────────
function initAnimations() {
  animarHero();
  animarManifesto();
  animarOnboarding();
  animarCta();
}

// ── Hero ──────────────────────────────────────────────────────────
function animarHero() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Líneas del título: cada .line span sube desde abajo
  tl.to('.hero-title .line span', {
    y: 0,
    duration: 1,
    stagger: 0.12,
  })
  .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
  .to('.hero-sub',     { opacity: 1, y: 0, duration: 0.7 }, '-=0.3')
  .to('.hero-cta',     { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
  .to('.hero-scroll-hint', { opacity: 1, duration: 0.5 }, '-=0.1');

  // Reloj de fondo — rotación sutil continua
  gsap.to('.hero-bg-clock', {
    rotation: 360,
    duration: 120,
    repeat: -1,
    ease: 'none',
  });
}

// ── Manifesto ─────────────────────────────────────────────────────
function animarManifesto() {
  // Panel 1: "It's time for... [palabra rotante]"
  const palabras = ['nada.', 'jugar.', 'ti.', 'esto.'];
  let idx = 0;
  const rotatingEl = document.getElementById('rotating-word');

  ScrollTrigger.create({
    trigger: '#panel-1',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      animarLineas('#panel-1');

      // Ciclo de palabras cada 1.2s
      if (rotatingEl) {
        gsap.delayedCall(0.8, () => {
          const ciclo = setInterval(() => {
            idx = (idx + 1) % palabras.length;
            gsap.to(rotatingEl, {
              yPercent: -100,
              opacity: 0,
              duration: 0.3,
              ease: 'power2.in',
              onComplete: () => {
                rotatingEl.textContent = palabras[idx];
                gsap.fromTo(rotatingEl,
                  { yPercent: 60, opacity: 0 },
                  { yPercent: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }
                );
              }
            });
          }, 1200);

          // Parar al salir del panel
          ScrollTrigger.create({
            trigger: '#panel-1',
            start: 'bottom top',
            once: true,
            onEnter: () => clearInterval(ciclo),
          });
        });
      }
    }
  });

  // Panel 2: texto aparece línea a línea
  ScrollTrigger.create({
    trigger: '#panel-2',
    start: 'top 75%',
    once: true,
    onEnter: () => animarLineas('#panel-2'),
  });

  // Panel 3: fondo amarillo — texto desde el centro con scale
  ScrollTrigger.create({
    trigger: '#panel-3',
    start: 'top 75%',
    once: true,
    onEnter: () => {
      gsap.from('#panel-3 .manifesto-text', {
        scale: 0.6,
        opacity: 0,
        duration: 0.9,
        ease: 'back.out(1.4)',
      });
    }
  });

  // Panel 4: entrada desde izquierda
  ScrollTrigger.create({
    trigger: '#panel-4',
    start: 'top 75%',
    once: true,
    onEnter: () => {
      gsap.from('#panel-4 .manifesto-text', {
        x: '-8vw',
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });
      gsap.from('#panel-4 .manifesto-aside', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.5,
      });
    }
  });
}

// Anima las palabras de un panel: cada palabra aparece desde abajo
function animarLineas(selector) {
  const words = document.querySelectorAll(`${selector} .word span`);
  if (!words.length) return;
  gsap.to(words, {
    y: 0,
    opacity: 1,
    duration: 0.7,
    stagger: 0.05,
    ease: 'power3.out',
  });
}

// ── Onboarding ────────────────────────────────────────────────────
function animarOnboarding() {
  // Título intro
  ScrollTrigger.create({
    trigger: '.onboarding-intro',
    start: 'top 70%',
    once: true,
    onEnter: () => {
      gsap.from('.onboarding-intro h2', { y: 40, opacity: 0, duration: 0.7, ease: 'power3.out' });
      gsap.from('.onboarding-intro p',  { y: 30, opacity: 0, duration: 0.6, delay: 0.2, ease: 'power3.out' });
    }
  });

  // Steps SVG — aparece con un ligero bounce
  ScrollTrigger.create({
    trigger: '.onboarding-steps',
    start: 'top 75%',
    once: true,
    onEnter: () => {
      gsap.from('.onboarding-steps img', { scale: 0.9, opacity: 0, duration: 0.8, ease: 'back.out(1.2)' });
    }
  });

  // Specs — cada item aparece en cascada
  ScrollTrigger.create({
    trigger: '.specs-grid',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.from('.spec-item', {
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
      });
    }
  });

  // Esquemático
  ScrollTrigger.create({
    trigger: '.schematic-section',
    start: 'top 70%',
    once: true,
    onEnter: () => {
      gsap.from('.schematic-section img',  { x: -40, opacity: 0, duration: 0.8, ease: 'power3.out' });
      gsap.from('.schematic-text h3',      { y: 30,  opacity: 0, duration: 0.7, delay: 0.2 });
      gsap.from('.schematic-text p',       { y: 20,  opacity: 0, duration: 0.6, stagger: 0.15, delay: 0.35 });
    }
  });

  // Magnetos
  ScrollTrigger.create({
    trigger: '.magnet-section',
    start: 'top 70%',
    once: true,
    onEnter: () => {
      gsap.from('.magnet-section img', { scale: 0.85, opacity: 0, duration: 0.8, ease: 'back.out(1.2)' });
      gsap.from('.magnet-text h3',     { x: 40, opacity: 0, duration: 0.7, delay: 0.2 });
      gsap.from('.magnet-text p',      { x: 30, opacity: 0, duration: 0.6, delay: 0.35 });
    }
  });
}

// ── CTA ───────────────────────────────────────────────────────────
function animarCta() {
  ScrollTrigger.create({
    trigger: '.section-cta',
    start: 'top 70%',
    once: true,
    onEnter: () => {
      gsap.from('.cta-title', {
        scale: 0.7,
        opacity: 0,
        duration: 1,
        ease: 'back.out(1.2)',
      });
      gsap.from('.cta-link', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: 0.4,
        ease: 'power3.out',
      });
    }
  });
}

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initLoader();

  // Set initial states (antes de animar)
  gsap.set('.hero-eyebrow', { opacity: 0, y: 20 });
  gsap.set('.hero-sub',     { opacity: 0, y: 20 });
  gsap.set('.hero-cta',     { opacity: 0, y: 20 });
  gsap.set('.hero-scroll-hint', { opacity: 0 });
  gsap.set('.word span', { y: '110%', opacity: 0 });
});
