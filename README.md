# Curio

Lees un mensaje de un LLM (o cualquier texto), haces clic o pasas el ratón sobre una palabra y
aparece una **descripción completa** ahí mismo. Para curiosos e investigadores: fin del
copiar-pegar-buscar-volver.

Piezas: **entidades** + **lazy loading** (la descripción se genera al clic/hover) + **modelos
pequeños** en **local con Ollama** (sin API key). Con el tiempo, en vez de texto plano, una
**UI generativa** (componentes de un catálogo que el modelo elige y rellena). Estilo limpio,
monocromo, tipo Linear, sin sombras.

> Estado: **obra de arranque escrita, sin código todavía.**

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

## Cómo se trabaja

Por **slices pequeños**, con **muchos commits**, en **versiones** (tags `vX.Y`), y con **varios
agentes** en paralelo cuando conviene. Local siempre: **sin API keys**, todo por **Ollama**.
