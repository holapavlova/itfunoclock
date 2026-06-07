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

  const minTime  = 1200;
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
  animarWave();
  animarManifesto();
  animarOnboarding();
  animarCta();
}

// ── Hero ──────────────────────────────────────────────────────────
function animarHero() {
  // Letras entran desde abajo con ligero bounce
  gsap.from('.hl', {
    y: 60,
    opacity: 0,
    duration: 0.7,
    stagger: { each: 0.04, from: 'start' },
    ease: 'back.out(1.3)',
  });

  gsap.to('.hero-scroll-hint', { opacity: 1, duration: 0.6, delay: 1 });
}

// ── Wave CTA ──────────────────────────────────────────────────────
function animarWave() {
  const words = gsap.utils.toArray('.wave-word');

  // Aparición inicial de todo el bloque al entrar en viewport
  ScrollTrigger.create({
    trigger: '.section-wave',
    start: 'top 70%',
    once: true,
    onEnter: () => {
      gsap.to('.wave-text', { opacity: 1, duration: 0.6, ease: 'power2.out' });
    }
  });

  // Efecto onda continuo con scroll (scrub)
  words.forEach((word, i) => {
    const phase = (i / words.length) * Math.PI * 2;
    gsap.fromTo(
      word,
      { y: Math.sin(phase) * 40 },
      {
        y: Math.sin(phase + Math.PI) * 40,
        ease: 'none',
        scrollTrigger: {
          trigger: '.section-wave',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      }
    );
  });
}

// ── Manifesto ─────────────────────────────────────────────────────
function animarManifesto() {
  const palabras = ['nada.', 'jugar.', 'ti.', 'esto.'];
  let idx = 0;
  const rotatingEl = document.getElementById('rotating-word');

  ScrollTrigger.create({
    trigger: '#panel-1',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      animarLineas('#panel-1');

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

  ScrollTrigger.create({
    trigger: '#panel-2',
    start: 'top 75%',
    once: true,
    onEnter: () => animarLineas('#panel-2'),
  });

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
  ScrollTrigger.create({
    trigger: '.onboarding-intro',
    start: 'top 70%',
    once: true,
    onEnter: () => {
      gsap.from('.onboarding-intro h2', { y: 40, opacity: 0, duration: 0.7, ease: 'power3.out' });
      gsap.from('.onboarding-intro p',  { y: 30, opacity: 0, duration: 0.6, delay: 0.2, ease: 'power3.out' });
    }
  });

  ScrollTrigger.create({
    trigger: '.onboarding-steps',
    start: 'top 75%',
    once: true,
    onEnter: () => {
      gsap.from('.onboarding-steps img', { scale: 0.9, opacity: 0, duration: 0.8, ease: 'back.out(1.2)' });
    }
  });

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

  ScrollTrigger.create({
    trigger: '.schematic-section',
    start: 'top 70%',
    once: true,
    onEnter: () => {
      gsap.from('.schematic-section img', { x: -40, opacity: 0, duration: 0.8, ease: 'power3.out' });
      gsap.from('.schematic-text h3',     { y: 30,  opacity: 0, duration: 0.7, delay: 0.2 });
      gsap.from('.schematic-text p',      { y: 20,  opacity: 0, duration: 0.6, stagger: 0.15, delay: 0.35 });
    }
  });

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

  // Estado inicial antes de animar
  gsap.set('.hero-scroll-hint', { opacity: 0 });
  gsap.set('.word span', { y: '110%', opacity: 0 });
});
