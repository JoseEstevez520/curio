# Curio — Registro de experimentos

Cada experimento se ejecuta en una rama `exp/<nombre>`. Se apunta aquí, con fecha, hipótesis,
montaje, números y veredicto. **Un experimento no está terminado hasta que su resultado está
escrito aquí** — aunque el veredicto sea "sin mejora, no se funde".

Los experimentos planificados (E1–E6) están descritos en `docs/ROADMAP.md`.

Mantener un **set de evaluación fijo** de ~20–30 términos-en-contexto reales para que las
tandas sean comparables.

---

## 2026-08-04 — MCP Apps con Excalidraw
- **Rama:** `exp/mcp-app`.
- **Hipótesis:** Curio puede actuar como host MCP Apps y reutilizar una View interactiva externa sin
  convertirla en un componente propio ni romper la superficie principal.
- **Montaje / eval:** `apps/web/src/mcp/McpAppDemo.tsx`, accesible con `/?mcp-app`. El host conecta
  por Streamable HTTP a `https://mcp.excalidraw.com/mcp`, descubre `create_view`, lee la resource
  `ui://excalidraw/mcp-app.html`, la monta en un iframe `sandbox="allow-scripts"` y conecta
  `AppBridge` con `PostMessageTransport`. Después envía un diagrama mínimo y reenvía el resultado
  de `create_view` a la View. Como siguiente paso del spike, `Message.tsx` expone la acción
  **Visualizar con Excalidraw** en las respuestas del chat. `ExcalidrawExplanation.tsx` llama primero
  a `read_me`, pasa una guía compacta del formato al cerebro activo para convertir la explicación en
  elementos JSON y reutiliza la conexión para ejecutar `create_view`. El provider OpenAI-compatible
  usa `response_format: json_schema` (con array en la raíz) porque `json_object` falla en Groq con
  `400 json_validate_failed` cuando la respuesta debe ser un array.
- **Números:** la conexión directa desde el navegador falla porque el servidor remoto no responde
  correctamente al preflight CORS. El proxy de Vite en `/excalidraw-mcp` evita ese bloqueo y el flujo
  completo vuelve a funcionar. El typecheck global conserva tres errores no relacionados en
  `useGenerative.ts`, `SelectionPopover.tsx` y `packages/core/src/lookup/generate.ts`.
- **Veredicto:** **funciona en desarrollo local mediante proxy**. Para producción haría falta un proxy
  propio o que el servidor remoto habilite CORS para clientes browser.
- **Qué se funde:** nada. La rama conserva la prueba para decidir si esta superficie merece entrar
  en el producto o quedarse como host experimental.

<!-- Plantilla para cada entrada:

## [FECHA] Exx — Título
- **Rama:** exp/<nombre>
- **Hipótesis:**
- **Montaje / eval:**
- **Números:**
- **Veredicto:**
- **Qué se funde:**

-->

## 2026-07-24 — OpenUI (nivel 2.5/3) sobre Groq
- **Rama:** `exp/openui` (no fundida a `main`).
- **Hipótesis:** OpenUI (openui.com, `@openuidev/react-lang`) permite **el nivel 2.5/3** que
  buscábamos SIN romper el principio sagrado ("el modelo nunca escribe HTML libre"): el modelo
  **compone nuestros componentes** (registrados con `defineComponent` + esquema Zod), nunca autora
  markup. Groq como cerebro rápido debería dar la fluidez que un 3B local no da.
- **Montaje / eval:** `apps/web/src/openui/` — 7 piezas Curio monocromo (Heading, Prose,
  DefinitionCard, KeyStat, FactTable, Timeline, Callout) + un `Panel` raíz que agrupa hijos vía
  `z.array(z.union([...ref]))`. `library.prompt()` → system prompt; Groq (`llama-3.3-70b-versatile`,
  vía el proveedor OpenAI-compatible del core) → OpenUI Lang en streaming → `<Renderer>` parsea a
  nuestros componentes. Demo aislada en `/?openui`. Verificado además **headless** el round-trip
  (prompt → Groq → parseo) sobre 3 términos: Mercurio, Bauhaus, Fotosíntesis.
- **Números:** tras afinar el prompt (envolver hijos en UN array), **3/3 términos parsean con 0
  errores**, componiendo 4-6 piezas distintas cada uno. Sin API keys de pago (tier gratis de Groq),
  clave bring-your-own en localStorage. Compat confirmada: React 18.3.1, Zod 4.4.3.
- **Aprendizajes:** (1) OpenUI EXIGE un componente raíz (`root = Panel(...)`); Root/Container no son
  builtins — hay que registrarlos. (2) El modelo tiende a pasar hijos como args sueltos; el prompt
  debe insistir en el array único. (3) OpenUI Lang ≠ JSON: NO usar el modo JSON del proveedor.
- **Veredicto:** **encaje excelente y seguro** — es el "puente realista" del doc de niveles, ya hecho
  en producción. Pendiente antes de fundir: anidar/enriquecer el vocabulario, cablearlo al modal
  "ver más" (hoy vive en `/?openui`), y decidir el "level 3" restante (autoría) + los nudges.
- **Qué se funde:** aún nada — spike de validación. Se fundirá cuando esté cableado al flujo real.

## 2026-07-21 — PoC de escritorio con Tauri
- **Rama:** `exp/tauri` (empujada a `origin`; **no** se funde a `main`).
- **Hipótesis:** el núcleo web (salida estática `dist/`) se puede envolver en Tauri sin
  reescribirlo, y Tauri aporta disco (vault Markdown) + base local (sesiones), las dos capas de la
  VISIÓN.
- **Montaje / eval:** andamiaje Tauri v2 en `src-tauri/` (`tauri.conf.json` con
  `frontendDist=../dist`; comandos Rust `vault::{list,read,write}_note` y
  `sessions::{load,save}`). Detalle completo en `docs/experiments/tauri-poc.md`.
- **Números:** N/A (cala de diseño, no de rendimiento).
- **Veredicto:** encaje **limpio y de bajo riesgo** — el web se reutiliza tal cual; las dos capas
  caben en comandos pequeños. **No compilado/ejecutado aquí** (sin toolchain de Rust ni WebView2):
  los `.rs` son andamiaje sin verificar. Punto abierto decidido: en producción, acceso a Ollama vía
  **proxy en Rust** (no `OLLAMA_ORIGINS`), coherente con la web.
- **Qué se funde:** solo esta conclusión + `docs/experiments/tauri-poc.md`. El código Tauri se
  queda en `exp/tauri` hasta que toque el escritorio (después de v2/v3 en web, regla del ROADMAP).
