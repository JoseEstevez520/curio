# Curio — Changelog

Se actualiza en cada frontera de versión (tag `vX.Y`). Formato inspirado en Keep a Changelog.

## [Unreleased]
- Siguiente: v1 (UI generativa — catálogo de componentes).

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
