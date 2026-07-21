# START — cómo arrancar Curio en un chat nuevo

Este archivo es el punto de entrada. En un chat nuevo, el dueño escribe **`start`** y tú
(Claude, como **Orchestrator**) arrancas todo desde aquí. No hace falta que el dueño explique
nada más.

## Al recibir `start`, haz esto en orden

1. **Lee el contexto** (en este orden):
   - `CLAUDE.md` — reglas de trabajo (mandan sobre todo).
   - `IDEA.md` — qué es Curio y por qué.
   - `docs/ARCHITECTURE.md` — cómo se construye (stack, entidades, Ollama, generative UI).
   - `docs/DESIGN.md` — estilo (monocromo, tipo Linear, sin sombras).
   - `docs/ROADMAP.md` — versiones y slices; **aquí está la lista de tareas**.
   - `docs/AGENTS.md` — el equipo de agentes y cómo colaboran.
   - `EXPERIMENTS.md` y `CHANGELOG.md` — dónde vamos.

2. **Comprueba el estado**:
   - `git log --oneline -10` para ver por dónde va.
   - Busca en `docs/ROADMAP.md` la **versión actual** y el **primer slice sin marcar** `[ ]`.

3. **Confirma el objetivo del turno** en una frase (qué slice vas a hacer) y ponte a ello.
   No pidas permiso para cada paso; trabaja por slices.

4. **Trabaja por slices, con muchos commits**:
   - Un slice = un commit pequeño con mensaje claro (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `polish:`).
   - Reparte en **varios agentes** cuando el trabajo sea grande o independiente (ver `docs/AGENTS.md`).
   - Al terminar un slice: commit. Marca la casilla `[x]` en `docs/ROADMAP.md`.
   - En frontera de versión: tag (`git tag -a vX.Y`) y actualiza `CHANGELOG.md`.
   - **Push solo si el dueño lo pide** (regla de `CLAUDE.md`).

5. **Experimentos**: cuando toque (o entre slices), lanza un experimento de `docs/ROADMAP.md`
   en una rama `exp/<nombre>`, escribe el resultado en `EXPERIMENTS.md`, y funde de vuelta solo
   la conclusión ganadora.

## Reglas que nunca se rompen
- **Local, sin API keys.** Todo pasa por **Ollama** con modelos pequeños.
- **Estilo:** monocromo, limpio, tipo Linear, **sin sombras**.
- `main` siempre demoable; no lo dejes roto entre sesiones.
- Este proyecto va **sin memoria persistente**: todo el contexto vive en estos archivos.

## Prerrequisitos del entorno (avísale al dueño si faltan)
- **Ollama** instalado y corriendo (`http://localhost:11434`).
- Al menos un modelo pequeño descargado (p. ej. `ollama pull <modelo-pequeño>`).
- Node.js para el frontend (el stack exacto está en `docs/ARCHITECTURE.md`).

---

**Estado actual:** obra escrita, sin código todavía. El primer slice de `docs/ROADMAP.md` (v0)
es `chore: scaffold app`. Ahí empieza todo.
