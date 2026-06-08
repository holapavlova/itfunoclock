# It's Fun o'clock

Landing page y configurador para **It's Fun o'clock**, marca de relojes de pared 3D personalizados, impresos en PLA+ y montados con sistema de fijación magnética. Fabricados en Barcelona.

---

## Stack

- HTML / CSS / JS vanilla (sin frameworks)
- [GSAP](https://gsap.com/) + ScrollTrigger para animaciones de scroll
- Fuentes: **Martian Mono** (títulos) + **Inter** (cuerpo) vía Google Fonts
- SVGs inline para el reloj isométrico (anatomía) y el reloj plano (configurador interactivo)

---

## Archivos principales

```
itsfunoclock/
├── home.html              # Landing page storytelling
├── index.html             # Configurador 3D (en desarrollo)
├── piezaisometrica.html   # Vista aislada del SVG isométrico
├── css/
│   ├── style.css          # Variables globales, reset, tipografía
│   └── home.css           # Estilos específicos de la landing
├── js/
│   ├── home.js            # Animaciones GSAP de la landing
│   └── vendors/
│       ├── gsap.min.js
│       └── ScrollTrigger.min.js
└── img/
    ├── logonegro.svg      # Logo Hola·Pavlova (negro, para fondos claros)
    ├── logo-blanco.svg    # Logo Hola·Pavlova (blanco, para fondos oscuros)
    └── home/              # SVGs decorativos de secciones
```

---

## Secciones de la landing (`home.html`)

| Sección | ID | Descripción |
|---|---|---|
| Loader | `#loader` | Reloj animado que sube al cargar |
| Hero | `#block-timefor` | "Es hora de [palabra]" — rotador interactivo con letras delineadas |
| Manifiesto | `#block-one` | Texto de marca pinned con scrub (texto que avanza en scroll) |
| Anatomía | `#block-two` | SVG isométrico del reloj con capas que aparecen una a una |
| Especificaciones | `#block-specs` | 4 tarjetas técnicas con entrada tipo manecilla de reloj |
| Configuración | `#block-onboarding` | Pasos + reloj SVG interactivo con drag & drop |
| CTA | `#block-three` | Llamada a la acción al configurador |

---

## Funciones JS (`home.js`)

| Función | Qué hace |
|---|---|
| `initPageTransition()` | Cortina roja al navegar entre páginas |
| `initBackgroundTransitions()` | Cambia el color de fondo del `<main>` según la sección visible |
| `initMarquees()` | Bandas tipográficas que se desplazan con el scroll |
| `initReveals()` | Elementos con `data-reveal` entran con máscara clip-path |
| `initTimeFor()` | Rotador "Es hora de" — genera spans por letra con efecto delineado |
| `initBlockOne()` | Animación pinned del manifiesto (texto de marca) |
| `initBlockTwo()` | Animación pinned del SVG isométrico por capas |
| `initSpecCards()` | Cards de specs entran desde posiciones de reloj (12h, 3h, 6h, 9h) |
| `initMagneticButton()` | Botón CTA se atrae magnéticamente hacia el cursor |
| `initTiltCards()` | Inclinación 3D de las cards de specs siguiendo el cursor |
| `initDraggableConfig()` | Manecillas rotables (snap a 30°) + círculos arrastrables en el SVG |
| `initCta()` | Reveal del bloque CTA final |

---

## Efecto de letras delineadas

Las palabras del rotador hero y el texto "O'CLOCK!" del manifiesto usan letras individuales con:
- `class="timefor-letter c-[color]"` — trazo de color por letra
- `-webkit-text-fill-color: transparent` + `-webkit-text-stroke` — texto hueco
- `--r` CSS custom property — ligera inclinación por letra

Colores que ciclan: rojo → azul → rosa → verde.

---

## Cómo ver el proyecto

Es un sitio estático, no necesita servidor. Abre `home.html` directamente en el navegador, o usa la extensión **Live Server** de VS Code para recarga automática.

---

## Estado del proyecto

- [x] Landing completa con animaciones scroll
- [x] SVG isométrico animado por capas
- [x] Reloj interactivo con drag & drop
- [x] Letras delineadas multicolor
- [ ] Configurador 3D (`index.html`) — en desarrollo
- [ ] Versión mobile revisada
- [ ] SEO / Open Graph
