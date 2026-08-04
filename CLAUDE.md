# CLAUDE.md — Curio

Instrucciones para trabajar en este proyecto. **Tienen prioridad** sobre el comportamiento por
defecto.

## Qué es Curio

Lees un mensaje de un LLM (o cualquier texto), haces clic o pasas el ratón sobre una palabra y
aparece una **descripción completa** ahí mismo. Para curiosos e investigadores. Detalle
completo en `IDEA.md`.

Piezas: entidades + lazy loading (descripción bajo demanda al clic/hover) + modelos pequeños
en local con **Ollama** (sin API key). Con el tiempo, **UI generativa** (componentes de un
catálogo que el modelo elige y rellena) en vez de texto plano.

## Arranque

- En un chat nuevo, el dueño escribe **`start`**. Sigue **`START.md`** al pie de la letra:
  lee los docs, mira el estado en git, coge el primer slice sin marcar de `docs/ROADMAP.md` y
  ponte a ello por slices.

## Documentos clave (leer al empezar)

- `START.md` — el arranque. `IDEA.md` — qué y por qué.
- `docs/ARCHITECTURE.md` — stack y cómo se construye. `docs/DESIGN.md` — estilo.
- `docs/ROADMAP.md` — versiones y slices (la lista de tareas). `docs/AGENTS.md` — el equipo.
- `EXPERIMENTS.md`, `CHANGELOG.md` — dónde vamos.

## Idioma y estilo

- Responde **en español** y con lenguaje **llano**, con analogías cuando ayude. Nada de jerga
  salvo que se pida el detalle técnico.
- **Estilo del producto (sagrado):** monocromo/blanco y negro, tipografía limpia, tipo Linear,
  **sin sombras** ni cajas flotantes — jerarquía con espacio y filetes de 1px. Ver `docs/DESIGN.md`.
- **Restricción técnica (sagrada, actualizada):** el "cerebro" es **enchufable por superficie** y
  **local por defecto**. **Ollama** en web y escritorio; en la **extensión**, el **modelo integrado
  del navegador (Gemini Nano)** con Ollama de reserva. **Cerebro cloud permitido como opción
  "trae-tu-propia-clave"** (`bring-your-own-key`): el dueño decidió que cualquiera pueda enchufar el
  endpoint/clave que quiera vía la interfaz **compatible con OpenAI** (p. ej. **Groq** por su
  velocidad, LocalAI, OpenRouter…). La clave la mete el usuario, vive solo en su navegador
  (localStorage) y **nunca** se commitea. Ollama sigue siendo la base local sin configuración.
  **No hardcodear claves en el repo.** **Datos de referencia de la web abierta y sin clave
  permitidos** (p. ej. **Wikipedia/Wikimedia**) para enriquecer "ver más" con foto + hechos + enlace.
  **Rumbo:** hoy Wikipedia da la base fiable y Ollama el local; el cerebro cloud rápido (Groq) abre
  la puerta a la **UI generativa de nivel 3** (el modelo autora la interfaz — ver
  `docs/niveles-generativos.md`), que un modelo pequeño local no da con calidad. Las descripciones
  serán **personalizadas para el usuario** (generadas), no genéricas.
- **Tool calling (experimental, rama `exp/mcp-app`):** Curio tiene un **bucle de tools genérico**
  (`@curio/core`, `runToolLoop` + `completeWithTools`/`completeWithToolsStream`) y un **registro de
  tools enchufable** en `apps/web/src/tools/`. Excalidraw es el primer módulo
  (`apps/web/src/mcp/excalidrawTools.ts`): el modelo puede dibujar diagramas inline en el chat vía
  MCP (`read_me` → `create_view`), con toggle `VITE_EXCALIDRAW` (por defecto activado) y degradación
  elegante (si la tool falla, el modelo responde en texto). **Añadir una tool nueva = implementar un
  `ToolModule` y registrarlo**; el chat no se toca. Detalle en `EXPERIMENTS.md` y
  `docs/ARCHITECTURE.md §6b`. No está fundido a `main`.

## Flujo de trabajo con git — IMPORTANTE

- Repo enlazado a `https://github.com/JoseEstevez520/curio.git` (remoto `origin`, rama `main`).
- **Ve haciendo commits a medida que avanzas.** No acumules cambios: cada paso o unidad de
  trabajo con sentido propio = un commit con mensaje claro.
- Termina los mensajes de commit con:

  ```
  Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
  ```
- **Push solo cuando el usuario lo pida.** Commit local por defecto; subir a `origin` solo bajo
  petición explícita.
- **Trabaja por slices** (un slice = un commit pequeño). Marca la casilla `[x]` del slice en
  `docs/ROADMAP.md` al terminarlo.
- **Versiones = tags** (`git tag -a vX.Y`) en cada frontera de versión; actualiza `CHANGELOG.md`.
- **Experimentos** en ramas `exp/<nombre>`; escribe el resultado en `EXPERIMENTS.md` y funde solo
  la conclusión ganadora. `main` siempre demoable.

## Trabajar con varios agentes

- Para tareas grandes o con partes independientes, **reparte el trabajo en varios agentes**
  (subagentes) que trabajen en paralelo: exploración, implementación de módulos separados,
  revisión, etc.
- Usa un agente por pieza aislada cuando tenga sentido (p. ej. detección de entidades por un
  lado, integración con Ollama por otro, UI de hover/clic por otro).

## Memoria

- Este proyecto va **sin memoria persistente**. No guardes hechos de Curio en la memoria entre
  sesiones; toda la información de contexto vive en los archivos del repo (`IDEA.md`,
  `CLAUDE.md`, `README.md`).
