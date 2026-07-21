# CLAUDE.md — Curio

Instrucciones para trabajar en este proyecto. **Tienen prioridad** sobre el comportamiento por
defecto.

## Qué es Curio

Lees un mensaje de un LLM (o cualquier texto), haces clic o pasas el ratón sobre una palabra y
aparece una **descripción completa** ahí mismo. Para curiosos e investigadores. Detalle
completo en `IDEA.md`.

Piezas: entidades + lazy loading (descripción bajo demanda al clic/hover) + modelos pequeños
en local con **Ollama** (sin API key).

## Idioma y estilo

- Responde **en español** y con lenguaje **llano**, con analogías cuando ayude. Nada de jerga
  salvo que se pida el detalle técnico.

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
