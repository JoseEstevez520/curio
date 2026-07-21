# Curio — Roadmap

El **destino** (por qué existe Curio, la app de escritorio document-first, etc.) está en
[`../VISION.md`](../VISION.md). Este documento es el **camino**: versiones, slices y scope.
La visión manda sobre el rumbo; este roadmap, sobre el próximo paso.

## Cómo trabajamos (método)

- **Slices pequeños.** Cada unidad = **un commit** con mensaje claro (`feat:`, `fix:`, `chore:`,
  `docs:`, `test:`, `polish:`). Si un slice se siente grande, pártelo.
- **Muchos commits.** El historial es el registro de progreso.
- **Versiones = hitos** con **tag** (`vX.Y`) y entrada en `CHANGELOG.md` en cada frontera.
- **`main` siempre demoable.** No dejarlo roto entre sesiones.
- **Push** cuando el dueño lo pida (por defecto, commit local). *(Nota: durante v0 el dueño pidió
  push por slice; confírmalo cada sesión.)*
- **Agentes:** reparte en varios agentes lo **independiente** (paralelo); lo **acoplado** va en
  serie con un líder. Ver [`AGENTS.md`](AGENTS.md).
- **Estilo sagrado:** monocromo, iOS/Linear, **sin sombras**; movimiento "todo fluye a un lugar"
  (ver `DESIGN.md §9`). **Local, sin API keys**, todo por **Ollama**.

---

## ✅ v0 — Descripción en texto plano al clic  *(hecho — tag `v0.0`)*

El bucle central funciona de punta a punta, local vía Ollama: chat en streaming, clic/selección de
una palabra → descripción en contexto (texto plano), estilo monocromo.

### Pulido posterior a v0 (hecho, en `main`)

- Markdown en las respuestas (manteniendo las palabras clicables).
- Seleccionar una frase → describir toda la selección (banda azul continua, como unidad).
- Rediseño iOS: una sola columna, sin líneas divisorias, esquinas redondeadas, input que crece
  solo, botón de envío circular con flecha.
- Caret de escritura fino que sigue al texto en streaming; tres puntitos "pensando".
- El descriptor responde en el **idioma** de la conversación.
- **Modelo pequeño dedicado** para el descriptor (`llama3.2:1b`); el chat usa el grande (`3b`).
- La palabra clicada se resalta; el popover **sigue** a la palabra al hacer scroll y no se solapa
  con el input.
- (En curso, otra sesión) **Logo/mascota** + lenguaje de movimiento con Framer Motion.

---

## ✅ v1 — El chat, bien hecho: "poquito → más" + UI generativa  *(hecho — tag `v1.0`)*

**Meta:** clavar la experiencia principal dentro del chat. Clic → popover pequeño (el *vistazo*);
**"ver más"** → **modal** (con velo plano, sin sombras) donde vive el contenido rico. El modal es la
"casa" de la UI generativa: el modelo elige un **componente** de un catálogo y lo **rellena en JSON
validado con Zod**, con fallback a texto.

**Slices (orden pensado para de-riesgar — el JSON llega cuando el sitio ya existe):**
- [x] `feat: modal "ver más" desde el popover (aún con texto)` — monta el patrón poquito→más y el
  modal con morph/blur (DESIGN §9), sin tocar JSON todavía.
- [x] `feat: catálogo de componentes (tipos + esquemas Zod + envelope discriminado)`
- [x] `feat: renderer JSON→componente con fallback a texto (nunca crashea)`
- [x] `feat: prompt "elige + rellena" con salida estructurada de Ollama (format = JSON Schema)`
- [x] `feat: DefinitionCard` · `feat: FactTable` · `feat: Timeline` · `feat: Comparison` ·
  `feat: Steps/List`  *(un componente por slice; paralelizable, uno por agente)*
- [x] `feat: skeleton del componente mientras genera`
- [x] `test: validación de esquema (válido, inválido, parcial)`
- [x] `chore: tag v1.0` + `CHANGELOG`

**Hecho cuando:** clicar/"ver más" muestra un componente renderizado la mayoría de las veces, con
fallback fiable; añadir un componente nuevo es un slice pequeño; el JSON inválido nunca rompe la UI.

---

## v2 — Entidades + prefetch  *(mejora el núcleo — idea original del dueño)*

**Meta:** ser listo sobre **qué** merece clic, y **precargar en segundo plano** para que el clic sea
instantáneo.

**Slices:**
- [ ] `feat: detector de entidades` (heurística primero; luego modelo pequeño), con marca sutil.
  Cualquier palabra sigue clicable — la detección solo *sugiere*.
- [ ] `feat: prefetch en ocioso con cola` usando el modelo pequeño (1b).
- [ ] `feat: caché persistente (IndexedDB)` para que re-leer sea gratis.
- [ ] `feat: mejoras de prompt` (few-shot, hints por tipo de entidad).
- [ ] `chore: tag v2.0`

**Hecho cuando:** las entidades marcadas coinciden con lo que un lector curioso querría clicar, y el
clic sobre algo prefetcheado es instantáneo.

---

## v3 — Nuevas superficies y sesiones

**Meta:** abrir el abanico más allá de un solo chat.

- [ ] `feat: sesiones de chat` — varias conversaciones, cambiar entre ellas, historial.
- [ ] `feat: modo lectura de artículos` — pegar un texto/artículo y click-to-explain sobre él
  (aplica el motor de lectura a texto arbitrario).
- [ ] `feat: "ir más a fondo"` — expandir un componente en uno más rico.
- [ ] (explorar) `feat: canvas` — tablero donde lo explorado se acumula como tarjetas.
- [ ] `chore: tag v3.0`

---

## 🌅 Horizonte — Escritorio + "segundo cerebro"  *(hacia la VISIÓN)*

El salto grande, **después** de tener el núcleo web redondo (ver `VISION.md`):

- **App de escritorio con Tauri.**
- **Dos capas de datos:** sesiones en formato estructurado (SQLite/JSON) + **vault de conocimiento
  en Markdown** en disco (tipo Obsidian).
- **"Documenta esto / resume → Markdown"**: el gesto que lleva de una sesión al vault; un agente
  decide dónde archivar la nota.
- Ideas exploratorias (quizás): to-dos/tareas para agentes, marketplace de "skills". Ver `VISION.md`.

> **Regla:** no empezar el escritorio hasta terminar v1–v3 en la web (decisión del dueño).

---

## Transversal (deuda y tareas sueltas)

- [ ] Integrar el **logo/mascota** (viene de otra sesión; hacer `git pull` al empezar).
- [ ] Alinear `docs/ARCHITECTURE.md` con el stack real (menciona TanStack Query, aún no usado;
  Framer Motion ya se usa — actualizar el doc).
- [ ] Arreglar el **footgun de espaciado de Tailwind**: `tailwind.config.ts` remapea la escala
  numérica de spacing (p. ej. `h-9` = 6rem = 96px). Usar píxeles arbitrarios para tamaños fijos,
  o replantear el mapeo.
- [ ] Elegir **licencia** (MIT sugerida para un POC abierto) — el dueño decide.

---

## Track de experimentos (opcional, ramas `exp/<nombre>`)

Resultados en `EXPERIMENTS.md` (hipótesis, montaje, números, veredicto). Set de eval fijo de ~20–30
términos-en-contexto para comparar.

- **E-genUI** — ¿constrained prompting (enum de componentes, esquema estricto, few-shot) sube la
  tasa de JSON válido? (para v1)
- **E-entidades** — ¿el tagging con modelo pequeño elige mejores clics que la heurística? (para v2)
- **E-modelos** — bake-off de modelos pequeños (calidad/latencia) para chat vs descriptor.
- **E-prefetch** — ¿el prefetch en ocioso hace el clic instantáneo sin coste notable? (para v2)

---

## Arranque en una sesión nueva (`start`)

1. **`git pull`** (¡importante! trae el logo y lo último).
2. Lee el contexto vía `START.md`: `CLAUDE.md`, `VISION.md`, `IDEA.md`, `docs/ARCHITECTURE.md`,
   `docs/DESIGN.md`, este `ROADMAP.md`, `docs/AGENTS.md`, `CHANGELOG.md`.
3. `git log --oneline -15` para ver por dónde va.
4. Coge el **primer slice sin marcar `[ ]`** (ahora: el primero de **v1**), confírmalo en una frase
   y ponte a ello por slices.
