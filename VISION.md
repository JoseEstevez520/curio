# Curio — Visión (estrella polar)

> Este documento es el **destino** a largo plazo. El **camino concreto** (versiones y slices)
> vive en [`docs/ROADMAP.md`](docs/ROADMAP.md). La visión manda sobre el rumbo; el roadmap, sobre
> el próximo paso.

## Para quién es

Para gente que **trabaja con IA para aprender e investigar** y quiere construir su **propio
conocimiento**. No es solo "el internet miente y somos curiosos": Curio es la herramienta donde
lees, hablas con la IA, entiendes las cosas en su contexto y **conviertes todo eso en conocimiento
tuyo, guardado y enlazado**.

En una frase: **un "segundo cerebro" local que se documenta solo, con la IA dentro.**

## Los dos escalones del producto

1. **Curio Web (lite).** Lo que estamos construyendo: un chat limpio donde hablas con un modelo
   local y, al **hacer clic en cualquier palabra** (o seleccionar una frase), ves su **descripción
   en contexto** ahí mismo. Con sesiones, selector de modelo y **UI generativa** (fichas, tablas,
   líneas de tiempo…) dentro de un modal. Ligero, en el navegador.

2. **Curio Escritorio (Tauri).** Sobre el mismo núcleo, una app de escritorio con tu **base de
   datos local pensada para IA y agentes**. Aquí Curio deja de ser un lector y se vuelve tu
   herramienta de conocimiento.

## Las dos capas de datos (no se mezclan)

- **Sesiones** (tus conversaciones) → almacenadas en un **formato estructurado** (p. ej. SQLite/
  JSON). No en Markdown: un log de chat no es un documento.
- **Vault de conocimiento** (lo que decides guardar) → **ficheros Markdown en disco**, enlazados,
  al estilo **Obsidian**. Es lo durable.
- **El puente:** una acción tipo **"documenta esto / resume → Markdown"** toma algo de una sesión
  (un mensaje, o la conversación entera) y lo **escribe como nota** en el vault; el agente decide
  **dónde** archivarlo.

Tauri encaja justo por esto: da acceso al **disco** (el vault Markdown) y a una **base local**
(SQLite) para las sesiones — todo local, sin nube.

## Principios (no se rompen)

- **Local, sin API keys.** Todo pasa por **Ollama** con modelos pequeños.
- **Entender-en-contexto es el átomo.** Todo lo demás se construye encima.
- **Document-first.** El conocimiento del usuario vive en **sus** ficheros, no encerrado en la app.
- **Estilo:** monocromo, limpio, **sin sombras**.

## Ideas exploratorias (quizás — no comprometidas)

Semillas que pueden o no cuajar; se anotan para no perderlas:

- **To-dos / tareas para agentes** — anotar lo que la IA (o los agentes) tienen que hacer.
- **Marketplace de "skills"** — un catálogo de habilidades de la comunidad para Curio.
- **Canvas** — un tablero donde las cosas exploradas se acumulan como tarjetas que ordenas y
  revisitas (encaja con el ángulo de curiosidad).
- **Sesiones enlazadas al vault** — que investigar y documentar sean el mismo gesto continuo.

## Relación con el roadmap

El roadmap actual (v0 → v1 chat + UI generativa → v2 entidades/prefetch → v3+ superficies) es el
**camino hacia esta visión**. El salto grande hacia el "segundo cerebro" (escritorio + documentar
al vault) llega después de tener el núcleo redondo. Ver [`docs/ROADMAP.md`](docs/ROADMAP.md).
