# It's Fun o'Clock — Memoria técnica del proyecto

**Autora:** Paula Aner (holapavlova)  
**Repositorio:** github.com/holapavlova  
**Tecnologías principales:** HTML5 · CSS3 · JavaScript ES6+ · GSAP · Three.js

---

## 1. Concepto y objetivo

_It's Fun o'Clock_ es una landing page de venta de relojes de pared 3D personalizados, impresos en PLA+ en Madrid. El objetivo del proyecto web es doble:

- **Narrativo**: contar la historia del producto usando scroll como medio expresivo, no solo como navegación.
- **Funcional**: permitir al usuario configurar su reloj (base, manecillas, marcadores) en tiempo real antes de comprarlo.

La propuesta estética es industrial-lúdica: tipografía monoespaciada en peso extrabold, paleta de cuatro colores primarios saturados sobre fondos neutros, y un lenguaje visual que mezcla el plano técnico (blueprint) con la energía del diseño gráfico de los 70.

---

## 2. Estructura de archivos

```
itsfunoclock/
├── index.html              — Landing page (home)
├── configurador.html       — Configurador 3D interactivo
│
├── css/
│   ├── style.css           — Punto de entrada (@import de todos los módulos)
│   ├── reset.css           — Normalización cross-browser
│   ├── variables.css       — Custom properties (colores, tipografía, espaciado)
│   ├── typography.css      — @font-face + estilos tipográficos base
│   ├── global.css          — Componentes compartidos (botones, etc.)
│   ├── home.css            — Estilos exclusivos de la landing
│   └── configurador.css    — Estilos del configurador 3D
│
├── js/
│   ├── home.js             — Todas las animaciones e interacciones del home
│   ├── configurador.js     — Lógica de UI del configurador (tabs, color pickers)
│   ├── escena3d.js         — Motor Three.js: render, cámara, luces, modelo GLB
│   ├── main.js             — Punto de entrada del configurador
│   └── vendors/
│       ├── gsap.min.js
│       ├── ScrollTrigger.min.js
│       ├── three.module.min.js
│       ├── GLTFLoader.js
│       ├── OrbitControls.js
│       └── reloj-maestro.glb   — Modelo 3D maestro con todas las variantes
│
├── fonts/
│   └── MartianMono-NrxBd.woff2  — Fuente local estática (ExtraBold)
│
├── img/
│   ├── favicon/            — Set completo de favicons (ico, png, webmanifest)
│   └── addons/             — Miniaturas SVG de componentes del reloj
└── data/                   — Datos de configuración (JSON)
```

**Métricas de código:** Mantener actualizado

| Archivo            | Líneas |
| ------------------ | ------ |
| `home.js`          | 646    |
| `escena3d.js`      | 223    |
| `configurador.js`  | 256    |
| `home.css`         | 798    |
| `configurador.css` | 624    |

---

## 3. Tecnologías y librerías

### 3.1 Núcleo

- **HTML5** semántico: uso de `<main>`, `<section>`, `<nav>`, `<aside>`, atributos `aria-label`, `aria-hidden`, `role`.
- **CSS3** sin frameworks: Custom Properties, `clamp()`, `clip-path`, `paint-order`, `@font-face`, Grid, Flexbox.
- **JavaScript ES6+** modular: `import/export`, arrow functions, Pointer Events API, `requestAnimationFrame` vía GSAP ticker.

### 3.2 Animación — GSAP 3 + ScrollTrigger

Cargados como scripts globales (no npm). GSAP es la librería de animación web estándar en producción para proyectos de alto rendimiento. Se usa para:

- Timelines scrubbeables sincronizadas con scroll (`scrub: 1`)
- Secciones pinneadas (`pin: true`)
- Animaciones de entrada/salida, transiciones de página, efectos de cursor

### 3.3 Motor 3D — Three.js r158

Cargado como módulo ES (`three.module.min.js`). Se usa para:

- Renderizar el modelo GLB en un canvas WebGL
- Controles de órbita (rotar, zoom)
- Gestión de materiales y cambio de color en tiempo real

### 3.4 Modelo 3D — `reloj-maestro.glb`

Archivo GLTF binario creado en **Blender**. Contiene todas las variantes del reloj en un solo archivo: 5 bases, 3 estilos de manecillas (hora + minuto), 6 grupos de marcadores horarios. Los objetos se muestran u ocultan desde JS según la selección del usuario.

### 3.5 Tipografía — Martian Mono ExtraBold (estática)

La fuente se autoaloja desde `fonts/MartianMono-NrxBd.woff2` mediante `@font-face` en `typography.css`. Se eligió la versión **estática** (no variable) para garantizar un renderizado correcto del delineado (`-webkit-text-stroke`) en todos los navegadores, pues daba problemas con las uniones en su versión variable. Inter (cuerpo de texto) se sigue cargando desde Google Fonts.

---

## 4. Arquitectura CSS

El CSS sigue una arquitectura modular de 7 capas importadas en cascada desde `style.css`:

```
reset → variables → typography → global → configurador
```

`home.css` se carga solo en `index.html` (no en el configurador), lo que evita que los ~800 líneas de estilos de la landing afecten a la otra página.

**Sistema de diseño** definido en `variables.css`:

- 8 colores como Custom Properties (`--color-amarillo`, `--color-rojo`, etc.)
- 2 familias tipográficas (`--font-titulo`, `--font-cuerpo`)
- 6 niveles de espaciado (`--spacing-xs` a `--spacing-xl`)
- Radios, sombras y duraciones de transición

**Tipografía fluida** con `clamp()` en todos los tamaños: los textos escalan continuamente entre mobile y desktop sin breakpoints para el tamaño de letra, solo para cambios de layout.

---

## 5. Landing page — Secciones y animaciones

Toda la lógica vive en `home.js`. La función `startApp()` orquesta la inicialización de todos los módulos tras el loader. Se usa `setTimeout(startApp, 1400)` alineado con la duración del loader animation para garantizar que GSAP no empieza antes de que la pantalla sea visible.

### 5.1 Loader

Un SVG de reloj con dos manecillas girando en bucle continuo (`repeat: -1`). Al dispararse `window.load`, el loader sube fuera de pantalla con `yPercent: -100` (`ease: power3.inOut`) simulando un telón que se levanta.

### 5.2 Transición entre páginas

Todos los `<a>` con el atributo `data-transition` tienen un listener que intercepta el clic, despliega una cortina roja de abajo hacia arriba (`power4.inOut`) y solo navega al destino cuando la cortina cubre toda la pantalla. El efecto es el de una cortina de teatro.

### 5.3 Navegación

`position: fixed` con z-index 100. Transparente por defecto; al hacer scroll > 0px, ScrollTrigger añade la clase `nav-home--scrolled` que aplica fondo amarillo mediante CSS transition.

### 5.4 Bloque "Es hora de" (rotador interactivo)

Una sección hero con fondo amarillo y un rotador de palabras controlado por flechas. Cada letra de la palabra activa se genera dinámicamente con `wordToHTML()`: cada carácter es un `<span class="timefor-letter">` con color y rotación únicos asignados por ciclo. El cambio de palabra usa una timeline GSAP de salida (Y + fade) → swap de innerHTML → entrada (Y inversa + fade con `back.out`). Hay autoplay cada 2,6 s que se cancela al interactuar.

### 5.5 Bloque 1 — Manifiesto pinneado (5.500px de scroll)

La sección más compleja. `ScrollTrigger` con `pin: true` mantiene la sección fija mientras el usuario scrollea 5.500px. Ese scroll se convierte en progreso de una `gsap.timeline` con `scrub: 1`. Los estados iniciales se definen con `tl.set()` dentro de la propia timeline (no fuera) para que el scrub hacia atrás los restaure correctamente. `invalidateOnRefresh: true` recalcula posiciones en cada resize.

**Secuencia de la timeline:**

1. Texto "¿SCROLLEAR = PERDER EL TIEMPO?" se revela de arriba a abajo con `clip-path: inset(0 0 100% 0)` → `inset(0 0 0 0)`.
2. El texto escala a `scale: 14` llenando todo el viewport, creando sensación de velocida¶d y colapso.
3. Aparece "PARA." con easing elástico (`elastic.out(1, 0.5)`) — rebota al aparecer.
4. Aparecen y desaparecen en secuencia tres mensajes del manifiesto con fundidos y desplazamientos verticales.

### 5.6 Banda marquee — tres efectos combinados

Una banda negra con texto en loop horizontal. Tres efectos superpuestos:

1. **Scroll-driven translation**: `xPercent: 0 → -50` scrubbeado con scroll. El texto se duplica tres veces — por eso el desplazamiento al -50% crea loop infinito sin salto.
2. **Apertura con clip-path**: al entrar en viewport, se revela desde el centro hacia los extremos (`inset(0 38% 0 38%)` → `inset(0 0%)`), con `ease: expo.inOut`.
3. **SkewX por velocidad de scroll**: `gsap.ticker` corre en cada frame (requestAnimationFrame). Calcula el delta de posición respecto al frame anterior, lo multiplica por 0.9 y lo aplica como `skewX` suavizado con lerp (12% por frame). El texto se inclina en la dirección del movimiento y se recupera al parar, dando sensación de inercia.

### 5.7 Bloque 2 — Anatomía del reloj, pinneado (3.000px de scroll)

Mismo sistema de pin + scrub. Un SVG isométrico del reloj tiene sus componentes divididos en capas con clases CSS (`.layer-base`, `.layer-mechanism`, `.layer-magnet`, `.layer-addons`, `.layer-hands`, `.layer-lines`). La timeline las hace entrar desde abajo con alturas y delays escalonados, como si el reloj se ensamblara en directo. Tres etiquetas técnicas aparecen en posiciones absolutas de la timeline.

### 5.8 Tarjetas de especificaciones

Cuatro tarjetas entran al hacer scroll desde las cuatro posiciones de un reloj analógico (12h = arriba, 3h = derecha, 6h = abajo, 9h = izquierda) con `back.out(1.4)`. En hover, cada tarjeta se inclina en 3D siguiendo el cursor: se calculan las coordenadas relativas del ratón dentro de la tarjeta y se aplican `rotateX` y `rotateY` proporcionales con `transformPerspective: 700`. Al salir, vuelve a plano con `elastic.out(1, 0.4)`.

### 5.9 Reloj interactivo (bloque configurador en el home)

Un SVG inline con dos manecillas y doce círculos de color. Las manecillas se arrastran calculando el ángulo entre el cursor y el centro geométrico del SVG con `Math.atan2`. Al soltar, hacen snap al múltiplo de 30° más cercano (snap a cada hora) con `back.out(1.5)`. Los círculos son libremente arrastrables mediante la **Pointer Events API** (`setPointerCapture` para que el drag no se pierda si el cursor sale del elemento). Doble clic resetea todo con elastic escalonado.

### 5.10 Botón CTA magnético

El botón "Abre el configurador" calcula la distancia del cursor a su centro geométrico en cada `mousemove`. Si la distancia es menor de 140px, el botón se desplaza hacia el cursor con intensidad proporcional a la proximidad (`STRENGTH * pull`). Al alejarse, vuelve con `elastic.out(1, 0.3)`.

### 5.11 Cambio de color de fondo por sección

No hay fondos de color fijados en CSS por sección. En cambio, ScrollTrigger monitoriza cuándo cada sección llega al 50% del viewport y dispara un `gsap.to` sobre el `backgroundColor` del contenedor `#home-main`. Así la transición de color (amarillo → blanco roto → azul → blanco) es suave y no depende del scroll exacto.

### 5.12 Hover en letras

Cada letra de "IT'S FUN" está en un `<span class="manifesto-letter">` y cada letra de "O'CLOCK!" en un `<span class="timefor-letter">`. En hover, ambas suben con `translateY(-10px) scale(1.08)` usando el easing `cubic-bezier(0.34, 1.56, 0.64, 1)` — un muelle que produce un pequeño overshoot, dando un efecto playful coherente con la marca.

### 5.13 Botón volver arriba

Aparece (slide-up + fade) cuando el scroll supera los 300px, desaparece al volver arriba. En hover se pone rojo. Al hacer clic usa `window.scrollTo({ behavior: 'smooth' })` nativo.

---

## 6. Configurador 3D

### 6.1 Arquitectura

El configurador está completamente separado del home. Carga sus propias dependencias (Three.js, configurador.js, escena3d.js) y no usa GSAP. La UI está dividida en dos columnas mediante CSS Grid: visor 3D (60%) y panel de opciones (40%).

### 6.2 Motor Three.js (`escena3d.js`)

- **Renderer**: `WebGLRenderer` con antialiasing y `SRGBColorSpace` para colores correctos.
- **Cámara**: `PerspectiveCamera` con FOV 40°. `OrbitControls` permite rotar y hacer zoom.
- **Iluminación**: tres luces — `AmbientLight` (0.7) para relleno general, `DirectionalLight` key (1.0) desde arriba-izquierda, `DirectionalLight` fill (0.4) desde el lado opuesto.
- **Sombras**: `PCFSoftShadowMap` para sombras suavizadas.
- **Modelo**: un único archivo `reloj-maestro.glb` cargado con `GLTFLoader`. Contiene todos los objetos de todas las variantes; el código los muestra/oculta por nombre.

### 6.3 Lógica de personalización (`configurador.js`)

El usuario puede configurar tres aspectos:

| Opción         | Implementación                                                     |
| -------------- | ------------------------------------------------------------------ |
| **Base**       | Oculta todos los objetos `base_0X` y muestra solo el seleccionado  |
| **Manecillas** | Oculta todos los pares hora/minuto y muestra el estilo elegido     |
| **Marcadores** | Oculta todos los `slots_*` y muestra el grupo seleccionado         |
| **Color**      | `material.color.set(hexColor)` sobre el material del objeto activo |

### 6.4 Interfaz del configurador

Tabs con `role="tablist"` / `role="tab"` para accesibilidad. Color pickers implementados con `<input type="color">` nativos. Los cambios se aplican en tiempo real sin necesidad de confirmar.

---

## 7. Decisiones técnicas relevantes

### Fuente autoalojada

Martian Mono ExtraBold se sirve localmente (`fonts/MartianMono-NrxBd.woff2`) en lugar de desde Google Fonts. El motivo es técnico: Google Fonts sirve la versión variable del typeface incluso cuando se solicita un peso específico. La fuente variable tiene inconsistencias de renderizado con `-webkit-text-stroke` en algunos sistemas, lo que hacía que los contornos de las letras se vieran mal. La versión estática garantiza comportamiento uniforme.

### `tl.set()` dentro de la timeline vs `gsap.set()` global

Los estados iniciales de los elementos animados (opacidad 0, posición inicial, clip-path cerrado) se definen con `tl.set()` al inicio de la timeline, no con llamadas `gsap.set()` globales. La razón: `gsap.set()` global solo se ejecuta una vez al cargar. Si el usuario vuelve a la página con el scroll ya en una posición avanzada (botón "atrás" del navegador), los estados iniciales no se reaplicarían y habría flashes visuales. Con `tl.set()` dentro de la timeline scrubbeada, al hacer scrub hacia atrás los estados se restauran automáticamente. Se añade `invalidateOnRefresh: true` para que los cálculos de posición se recalculen en cada resize.

### SVG inline

El reloj isométrico de la sección "Anatomía del tiempo" y el reloj interactivo de la sección de configuración están embebidos como SVG inline en el HTML. Esto permite animar partes individuales desde JavaScript (grupos de capas, manecillas, círculos) sin restricciones del mismo origen. Con `<img src="archivo.svg">` no sería posible acceder al DOM interno del SVG.

### Pointer Events API para drag

Los elementos arrastrables (manecillas del reloj, círculos de add-on) usan `addEventListener('pointerdown/move/up')` en lugar de los eventos de ratón clásicos. La ventaja clave es `element.setPointerCapture(e.pointerId)`: hace que el elemento "capture" todos los eventos del puntero aunque el cursor se mueva fuera de él durante el drag, lo que funciona también en pantallas táctiles.

### Arquitectura CSS modular

Los estilos del home (home.css, ~800 líneas) solo se cargan en index.html. El configurador carga únicamente style.css (que importa los módulos compartidos) más configurador.css. Esto evita que las animaciones y estilos de la landing afecten al configurador, y reduce el CSS en ~800 líneas en esa página.

---

## 8. Responsive y accesibilidad

### Responsive

- **Mobile-first** en puntos clave: `@media (max-width: 767px)` para ajustes de padding y tipografía.
- **Tablet** `@media (min-width: 768px) and (max-width: 1023px)`: reduce los tamaños tipográficos del bloque hero para que no resulten excesivos en pantallas medianas.
- **Tipografía fluida**: todos los `font-size` usan `clamp(min, valor-fluido, max)` para escalar continuamente sin breakpoints.
- **Nav hide-on-scroll**: en scroll hacia abajo el nav se oculta con `translateY(-100%)`; en scroll hacia arriba reaparece. Implementado con un listener `scroll` pasivo que compara `scrollY` con el frame anterior (threshold ±5px para evitar parpadeo).
- **Sección onboarding — responsive dual**: en desktop (≥768px), la sección está pinneada con snap; el reloj arranca con su top justo bajo el viewport (`startY = VH − demoTopFromSection + 20`) para evitar solapamiento con los pasos. En mobile, la sección fluye en scroll normal (sin pin), mostrando heading → pasos con descripción → reloj → CTA.
- **Tamaño del reloj onboarding**: `min(90vw, 85vh)` — la fórmula `85vh` garantiza que el radio del reloj nunca supere la distancia al borde inferior del viewport, previniendo overlap en cualquier resolución.

### Accesibilidad implementada

- `lang="es"` en la etiqueta `<html>`
- `aria-label` en todos los elementos de navegación y controles interactivos
- `aria-hidden="true"` en elementos decorativos (marquee, grid de fondo, hint de scroll)
- `role="tablist"` / `role="tab"` / `aria-selected` en las tabs del configurador
- `role="status"` / `aria-live="polite"` en el overlay de carga del visor 3D
- Texto alternativo en todos los `<img>`
- **`:focus-visible`**: outline azul de 3px en todos los elementos interactivos para navegación por teclado (`global.css`)
- **`prefers-reduced-motion`**: doble cobertura — CSS desactiva todas las transiciones/animaciones a 0.01ms; JS comprueba la media query en `startApp()` y omite la inicialización de GSAP si está activa
- **Open Graph tags**: `og:title`, `og:description`, `og:image`, `og:url` y `twitter:card` en ambas páginas
- **Favicon completo**: set `.ico`, PNG 16×32, apple-touch-icon y `site.webmanifest` en `img/favicon/`

---

## 9. Flujo de trabajo y control de versiones

El proyecto usa **Git** con repositorio en GitHub. Historial de commits relevante:

```
(pending)  Nav hide-on-scroll, onboarding mobile sin snap, fixes layout y CTA
ab6b7c8  Problemas de mobile arreglados
1750984  Sección onboarding: snap dual con CTA inline, hint semicírculo y ajustes UI
bda87be  Mejoras accesibilidad, rendimiento y SEO
f96f4e0  Autoalojar Martian Mono, nav en configurador y mejoras UI
5877eff  Renombrar home→index, index→configurador + README
f67cad7  Merge branch 'feature'
4538a8c  Añadir reloj interactivo, letras delineadas y rotador hero
```

---
