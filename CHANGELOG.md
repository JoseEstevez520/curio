# Curio — Changelog

Se actualiza en cada frontera de versión (tag `vX.Y`). Formato inspirado en Keep a Changelog.

## [Unreleased]

## [v1.0] — 2026-07-21 — Chat "poquito → más" + UI generativa
El chat, bien hecho: clic → popover pequeño (el *vistazo*); **"Ver más"** → **modal** donde vive la
**UI generativa**. El modelo elige un componente de un catálogo fijo y lo **rellena en JSON validado
con Zod**, con fallback fiable a texto. Todo local vía Ollama, monocromo y sin sombras.

### Added (v1 — el núcleo)
- **Modal "Ver más"** desde el popover, con **morph tipo iOS** (Framer `layoutId`): la tarjeta
  pequeña **crece** hasta el modal (curva decelerada, sin rebote) y **encoge** de vuelta al cerrar.
  Velo plano (un atenuado, no una sombra); el objeto morfa y el texto entra con un fundido. Cierre
  por Escape o clic en el velo. Respeta `prefers-reduced-motion`.
- **Catálogo de componentes** (Zod): `plain-text`, `definition-card`, `fact-table`, `timeline`,
  `comparison`, `steps`, con un **envelope discriminado** `{ type, confidence, data }` y utilidades
  **Zod→JSON Schema** para el `format` de Ollama.
- **Renderer JSON→componente**: `switch` type-safe sobre el envelope (sin `any`) + `coerce` que
  valida con Zod cualquier salida del modelo y **nunca crashea** (cae a texto plano ante fallo).
- **Cinco componentes** de UI generativa (monocromos, sin sombras, sin cajas anidadas): DefinitionCard,
  FactTable, Timeline, Comparison, Steps.
- **Pipeline generativo de dos etapas** contra Ollama con **salida estructurada** (`format` = JSON
  Schema, grammar-constrained): 1) elegir tipo del catálogo; 2) rellenar solo el esquema elegido.
  Perezoso (solo al abrir el modal), cacheado por (mensaje, término), en el **idioma del texto**.
- **Skeleton** monocromo mientras genera (shimmer sutil, se apaga con `prefers-reduced-motion`).
- **Tests** (Vitest): 26 tests de validación del catálogo (válido/ inválido/ parcial/ basura,
  límites de cada esquema, y que las utilidades JSON Schema no emiten `$schema`).

### Docs
- **`VISION.md`** nuevo — la estrella polar (compañero de investigación local, document-first tipo
  Obsidian, escritorio con Tauri, dos capas de datos: sesiones + vault Markdown).
- **`docs/ROADMAP.md`** reorganizado — v0 (hecho) → v1 chat "poquito→más" + UI generativa → v2
  entidades/prefetch → v3 superficies/sesiones → horizonte escritorio. Con scope por slice.
- **`docs/DESIGN.md §9`** — principios de movimiento ("todo fluye a un lugar", morph/blur/overshoot,
  timing dual), adaptados a la estética plana y sin sombras de Curio.
- `START.md` actualizado (lee `VISION.md`, `git pull` al arrancar, estado = v1 siguiente).

### Added
- **Modelo dedicado y rápido para el descriptor:** el chat usa el modelo grande (p. ej.
  `llama3.2:3b`) y las descripciones un modelo pequeño (`llama3.2:1b`) para ir más rápidas —
  se elige automáticamente entre los modelos instalados.

### Changed (interacción)
- La **palabra clicada se queda resaltada** (azul) mientras su descripción está abierta.
- El popover se **ancla al DOM vivo** (palabra o selección) y **sigue al texto al hacer scroll**
  (antes se quedaba fijo en la pantalla, desanclado).

### Added (previo)
- **Markdown en las respuestas:** las respuestas del asistente se renderizan como Markdown
  (negritas, listas, encabezados, código, tablas) en vez de texto crudo — manteniendo que cada
  palabra sea clicable y que puedas seleccionar frases.

### Changed (UI, hacia estilo iOS)
- **Composer** que **crece solo** al escribir (sin scroll interno hasta un máximo), input tipo
  píldora y botón de envío circular con **flecha a la derecha**, ambos a la misma altura.
- **Caret de escritura** fino y moderno que **sigue al texto** en streaming (antes saltaba de
  línea y era un bloque grueso).
- Palabras clicables como `<span>` inline (sin subrayado): la **selección de varias palabras se
  ve continua y limpia** (antes salía a trozos por los botones).

### Added (antes)
- **Describir una selección de texto:** además de una palabra, ahora puedes **seleccionar una
  frase** (2+ palabras) en una respuesta y aparece un popover con la descripción de todo lo
  seleccionado (anclado a la selección; cacheado igual que las palabras). Adelanto del slice de
  selección multi-palabra de v3.

### Changed
- **Descriptor más limpio y sin "esto es un enlace":** las palabras clicables ya no llevan
  subrayado ni color en reposo (se leen como prosa normal). Al hacer clic, una pequeña animación
  y el popover con fundido de entrada. Popover sin cabecera (solo el texto), cierre por
  Escape / clic fuera.
- **Idioma:** el descriptor responde en el **mismo idioma** de la conversación/frase (antes salía
  en inglés aunque la conversación fuera en español).
- **Contexto:** la descripción usa además un poco de contexto de la conversación (la pregunta del
  usuario), no solo la frase.
- **Velocidad:** modelo mantenido caliente (`keep_alive`), respuesta acotada (`num_predict`) y
  streaming → descripción en ~2-3 s en caliente.

- Siguiente: v2 (entidades + prefetch) y modo lectura de artículos.

## [v0.0] — 2026-07-21 — Descripción en texto plano al clic
El bucle central funciona de punta a punta, todo en local vía Ollama (sin API keys).

### Added
- **Scaffold**: Vite 6 + React 18 + TypeScript, Tailwind, ESLint (flat) + Prettier, con proxy
  `/ollama` (mismo origen, sin CORS).
- **Sistema de diseño** en `src/styles/tokens.css`: monocromo, tipo Linear, sin sombras; temas
  claro/oscuro; expuesto como utilidades de Tailwind.
- **Cliente de Ollama**: `chatStream` (streaming NDJSON con `AbortSignal`), `chat`, `listModels`,
  `pingOllama`, y `OllamaError` tipado.
- **Chat**: layout con lista de mensajes + composer; envío con respuesta del asistente en
  streaming; selector de modelo desde los modelos instalados; banner amable cuando Ollama no
  corre o no hay modelos.
- **Lectura**: tokenización del mensaje en palabras clicables (`.entity`), extracción de la
  frase de contexto, y popover en línea (Floating UI) que genera y **transmite en streaming** la
  descripción de la palabra en su contexto, con caché por (mensaje, término), cierre y descarte
  (Escape / clic fuera).
- **README** con quickstart, prerrequisitos de Ollama y captura de la app.

### Notes
- Modelo por defecto probado: `llama3.2:3b`. Sin memoria persistente; el contexto vive en el repo.
