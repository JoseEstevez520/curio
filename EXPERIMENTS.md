# Curio — Registro de experimentos

Cada experimento se ejecuta en una rama `exp/<nombre>`. Se apunta aquí, con fecha, hipótesis,
montaje, números y veredicto. **Un experimento no está terminado hasta que su resultado está
escrito aquí** — aunque el veredicto sea "sin mejora, no se funde".

Los experimentos planificados (E1–E6) están descritos en `docs/ROADMAP.md`.

Mantener un **set de evaluación fijo** de ~20–30 términos-en-contexto reales para que las
tandas sean comparables.

---

<!-- Plantilla para cada entrada:

## [FECHA] Exx — Título
- **Rama:** exp/<nombre>
- **Hipótesis:**
- **Montaje / eval:**
- **Números:**
- **Veredicto:**
- **Qué se funde:**

-->

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
