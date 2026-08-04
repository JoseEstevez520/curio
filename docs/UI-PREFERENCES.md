# Curio — Preferencias de UI del dueño (lecciones aprendidas)

> **Para quién:** cualquier agente que toque la UI. Esto es lo **aprendido del feedback real** del
> dueño, iterando en vivo. Complementa `DESIGN.md` (el sistema formal) y, donde se contradiga con
> él, **manda esto** (ver §"Reconciliación" al final). Léelo antes de animar, elegir tamaños o
> tocar la selección.

Regla del proyecto: **sin memoria persistente**; el contexto vive en el repo. Este archivo ES esa
memoria para la UI. Si aprendes algo nuevo del dueño, **anótalo aquí**.

---

## 1. Se tiene que ver. Nada microscópico.

Feedback literal: _"no noto ahora mismo ninguna animación"_, _"apenas se ve el logo por el tamaño"_.

- Los elementos de marca y las animaciones tienen que ser **perceptibles**. Si dudas, hazlo más
  grande / con más amplitud, no menos.
- La mascota del hero es un **foco visual** (112px), no un icono. La respiración se subió a
  `scale(1.05) / -6px` para que se note.
- **Cómo aplicar:** antes de dar por buena una animación, míralo en vivo (captura/GIF). Si no la
  notas de un vistazo, es demasiado sutil.

## 2. El morph es sagrado — pero SUAVE, nunca agresivo.

Le **encanta** el morph de elemento compartido (un objeto que viaja y se transforma en otro), por
_"esa sensación de que todo es 3D"_. **Pero**: _"el morph es demasiado agresivo"_.

- **Morph estructural** (hero→cabecera, popover→modal): **lento y decelerado**, ~0.5s, curva tipo
  `cubic-bezier(0.32, 0.72, 0, 1)`, **SIN rebote/overshoot**. Un deslizamiento, no un latigazo.
- **Spring/overshoot/elástico**: SOLO para **micro-interacciones juguetonas y pequeñas** (el _squish_
  al pulsar el blob, el _pop_ del monóculo). Nunca para el morph grande.
- ⚠️ Esto **matiza `DESIGN.md §9`** ("overshoot / spring, no ease-in-out"): esa regla vale para lo
  pequeño; el morph grande va suave.

## 3. Objeto sí, texto no.

_"sobre todo la palabra… la palabra sí [se ve mal]"_ al morfear el wordmark entre tamaños.

- **No** hagas morph de texto escalándolo entre dos tamaños: se ve borroso/raro.
- Morfea el **objeto** (el logo/blob); el **texto** entra con un **fundido** suave y con retardo.

## 4. La herramienta correcta para el trabajo.

_"si no estás cambiando página no uses view transitions, tenemos React, usa la librería más famosa"_.

- Animación de **estado dentro de React** (no navegación) → **Framer Motion** (`layoutId` para
  elemento compartido). Ya está integrada.
- **View Transitions API** = solo para cambios de página. No la uses para estado in-app.

## 5. Fundido limpio, no blur (en la práctica).

Aunque `DESIGN.md §9` dice "blur, no fade", en esta sesión los **fundidos de opacidad** limpios
(wordmark, banda de selección) gustaron y quedaron sobrios. **No fuerces `filter: blur()`** salvo que
el dueño lo pida; el fade simple encaja con la estética plana.

## 6. Nada de duplicar la marca.

No muestres logo **y** nombre **dos veces a la vez** (p. ej. en cabecera y hero en el estado vacío).
Una sola vez; el resto llega por morph.

## 7. Selección / resaltado: con carácter y como un BLOQUE.

Mucho feedback aquí. Lo que quiere:

- **Con carácter, no un lavado invisible.** El azul pálido "no se ve apenas". Usa un azul de Curio
  con presencia (token `--color-curio`, mezclado con `color-mix` ~32% claro / 38% oscuro).
- **Que matchee el logo.** El color de selección se deriva del azul de marca.
- **Un bloque continuo**, sin cajitas por palabra ni huecos en los espacios.
- **Con padding y esquinas redondeadas** (como una píldora), **una sola capa** (nada de doble banda
  nativa + propia).
- Notas técnicas que costó descubrir: `::selection` y `::highlight()` **no admiten padding ni
  border-radius** → hay que dibujar la banda con **elementos reales** (`PhraseHighlight`), **fusionar
  los client-rects por línea** (si no, sale una caja por palabra) y **limpiar la selección nativa**
  (`removeAllRanges`) para que no se vean dos bandas.

## 8. Micro-interacciones "smart" y suaves.

- **Snap a palabra completa**: si seleccionas media palabra, captura la palabra entera.
- Todo **smooth**: fundidos de aparición, nada de saltos ni pops secos.

## 9. Personalidad, con moderación.

- Los estados reactivos de la mascota le gustan (**pensando** al generar, **squish** al clic,
  **monóculo** al inspeccionar), pero la **estética sobria manda** (monocromo, sin sombras).
- _"añade unos cuantos y deja el resto para el futuro"_ → añade pocos estados bien hechos; el resto
  del repertorio se queda en `docs/logo/` para más adelante.

## 10. Habla llano, sin jerga.

Se confundió con "tokens" (creyó que hablaba de tokens de LLM). **Explica en términos simples**, con
analogías; deja el detalle técnico para cuando lo pida.

## 11. Itera en vivo y enseña.

Juzga por la **sensación real**, no por la descripción. **Enséñale** el resultado (captura/GIF/preview
en el navegador) en vez de solo contarlo. Reacciona rápido a cada versión.

## 12. Sube a GitHub a menudo.

Pide **push** tras el trabajo terminado. Commits pequeños y claros (ver `ROADMAP.md`).

---

## Reconciliación con `DESIGN.md` (dónde el doc formal está desalineado)

Al integrar la mascota se vio que `DESIGN.md` está en parte **desactualizado**; hasta que se corrija,
prevalece lo de aquí:

- **§7 vs §9 se contradicen** (§7 "no bounce" / §9 "overshoot/spring"). Resolución práctica: morph
  grande = **suave, sin rebote**; spring **solo** en micro-interacciones.
- **§9 "blur, no fade"** → en la práctica se usó **fade** limpio (ver §5 arriba).
- **§6 palabra clicable con subrayado punteado en reposo** → la implementación real y preferida es
  **invisible en reposo** (se revela al hover/clic). El doc está desfasado ahí.
- **Footgun de Tailwind:** `tailwind.config.ts` remapea el spacing (`h-9` = 96px, no 36). Para
  tamaños fijos usa **px arbitrarios** (`h-[32px]`) o `style={{ width: … }}`.

> Si algún día se alinea `DESIGN.md` con esto, actualiza ambos y borra las notas duplicadas.
