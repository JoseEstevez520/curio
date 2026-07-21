# Curio

Lees un mensaje de un LLM (o cualquier texto), haces clic o pasas el ratón sobre una palabra y
aparece una **descripción completa** ahí mismo. Para curiosos e investigadores: fin del
copiar-pegar-buscar-volver.

Piezas: **entidades** + **lazy loading** (la descripción se genera al clic/hover) + **modelos
pequeños** en **local con Ollama** (sin API key). Con el tiempo, en vez de texto plano, una
**UI generativa** (componentes de un catálogo que el modelo elige y rellena). Estilo limpio,
monocromo, tipo Linear, sin sombras.

![Curio — interfaz de chat monocroma con selector de modelo](docs/screenshot.png)

> Estado: **v0 funcional** — chat con Ollama en streaming y clic en cualquier palabra para
> ver su descripción en un popover en línea. (La captura muestra la interfaz inicial; graba un
> GIF del popover en acción para lucir la interacción.)

## Arrancar en un chat nuevo

Abre un chat nuevo y escribe **`start`**. A partir de ahí, se arranca todo desde
[`START.md`](START.md). No hace falta explicar nada más.

## Documentación

- [`START.md`](START.md) — cómo arranca un chat nuevo (léelo primero).
- [`IDEA.md`](IDEA.md) — qué es Curio y por qué.
- [`CLAUDE.md`](CLAUDE.md) — reglas de trabajo (mandan sobre todo).
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — stack, entidades, Ollama, UI generativa.
- [`docs/DESIGN.md`](docs/DESIGN.md) — sistema de diseño (monocromo, Linear, sin sombras).
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — versiones y slices (la lista de tareas).
- [`docs/AGENTS.md`](docs/AGENTS.md) — el equipo de agentes.
- [`EXPERIMENTS.md`](EXPERIMENTS.md) · [`CHANGELOG.md`](CHANGELOG.md) — dónde vamos.

## Ejecutar en local

Requisitos: **Node 18+** y **[Ollama](https://ollama.com)** corriendo en local (sin API keys).

1. **Arranca Ollama** y descarga un modelo pequeño:
   ```bash
   ollama serve                 # deja el daemon en http://localhost:11434
   ollama pull llama3.2:3b      # o qwen2.5:3b-instruct; en equipos flojos, qwen2.5:1.5b
   ```
2. **Instala dependencias y levanta la app:**
   ```bash
   npm install
   npm run dev                  # http://localhost:5173
   ```

El frontend habla con Ollama a través del proxy `/ollama` del dev server de Vite, así que
**no hay que configurar CORS ni `OLLAMA_ORIGINS`**. Si Ollama no está corriendo, la app lo
avisará (banner de onboarding, en un slice posterior).

Scripts útiles: `npm run build` (producción), `npm run typecheck`, `npm run lint`,
`npm run format`.

## Cómo se trabaja

Por **slices pequeños**, con **muchos commits**, en **versiones** (tags `vX.Y`), y con **varios
agentes** en paralelo cuando conviene. Local siempre: **sin API keys**, todo por **Ollama**.
