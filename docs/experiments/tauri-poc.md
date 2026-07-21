# Experimento: PoC de Curio en Tauri (escritorio)

> **Estado: prueba de concepto DOCUMENTADA, no compilada.** Rama `exp/tauri`. No es la app
> final y **no se funde a `main`** (solo se funde la conclusión — ver `EXPERIMENTS.md`).
> Regla del proyecto (`ROADMAP.md`): el escritorio llega **después** de redondear la web; esto
> es solo una cala hacia la VISIÓN (segundo cerebro: vault Markdown + sesiones).

## Hipótesis

El núcleo web de Curio (Vite + React, salida estática en `dist/`) se puede **envolver en Tauri**
sin reescribirlo, y Tauri aporta lo que la web no tiene y la VISIÓN pide: **acceso al disco** (vault
Markdown) y una **base local** para sesiones. Objetivo de la cala: validar el encaje y dejar el
andamiaje + lo que faltaría para ejecutarlo de verdad.

## Qué se montó (en esta rama)

- `src-tauri/tauri.conf.json` — config Tauri v2. Clave: `build.frontendDist = "../dist"` (Tauri
  sirve la **misma** salida estática que ya genera `npm run build`) y `devUrl`/`beforeDevCommand`
  para desarrollo con el dev server de Vite.
- `src-tauri/Cargo.toml`, `build.rs` — manifiesto Rust y build script estándar de Tauri.
- `src-tauri/src/main.rs` — arranque; registra los comandos que el frontend llamaría con `invoke`.
- `src-tauri/src/vault.rs` — la capa **vault Markdown**: `list_notes`, `read_note`, `write_note`.
  `write_note` es el destino del gesto **"documenta esto → Markdown"** de la VISIÓN.
- `src-tauri/src/sessions.rs` — la capa **sesiones** (estructurada, JSON en el PoC; SQLite después):
  `load_sessions`, `save_session`. Deliberadamente separada del vault (un log de chat no es un
  documento).

## Qué se PUDO verificar aquí

- **La salida estática existe y sirve como frontend de Tauri.** `npm run build` produce
  `dist/` (`index.html` + `assets/` + `favicon.png`); es exactamente lo que `frontendDist` espera.
  El envoltorio no requiere tocar el código web.
- **El diseño de las dos capas de datos encaja en comandos Tauri** (`invoke` → funciones Rust),
  con tipos serde que reflejan lo que el store del frontend ya maneja (turnos rol/contenido).

## Qué NO se pudo probar (bloqueado por el entorno)

Este equipo **no tiene toolchain de Rust ni WebView2 CLI**, así que **no se compiló ni se ejecutó**:

- `rustc` / `cargo`: no instalados → no hay `cargo build`, no hay binario.
- Sin `@tauri-apps/cli` instalado → no hay `tauri dev` / `tauri build`.
- No verificado en ventana real: arranque, `invoke` de los comandos, lectura/escritura del vault,
  ni el empaquetado.

Por honestidad: los `.rs` son un **andamiaje de diseño sin compilar**; pueden necesitar ajustes al
compilar por primera vez (versiones de crates, capabilities/permits de Tauri v2 para FS).

## El punto delicado: acceso a Ollama en producción

En **dev** funciona igual que en la web: el proxy `/ollama` del dev server de Vite (mismo origen,
sin CORS). En **producción empaquetada no hay dev server**, y la webview de Tauri sirve desde
`tauri://localhost` (o `http://tauri.localhost` en Windows). Dos opciones:

1. **`OLLAMA_ORIGINS`**: permitir el origen de Tauri antes de arrancar Ollama. Cero código, pero
   empuja configuración al usuario (justo lo que la web evita).
2. **Comando/proxy en Rust** (recomendado): un comando Tauri (o un plugin HTTP) que reenvía a
   `http://localhost:11434`, de modo que el frontend siga llamando a un mismo-origen. Es el sitio
   natural para el proxy que `ARCHITECTURE.md §5` ya anticipa para la app empaquetada.

Decisión para cuando se retome: **opción 2** (coherente con la web: el frontend nunca configura CORS).

## Cómo ejecutarlo de verdad (pendiente, en una máquina con toolchain)

1. Instalar Rust (`rustup`) y, en Windows, **WebView2** (viene con Edge moderno).
2. `npm i -D @tauri-apps/cli` y añadir script `"tauri": "tauri"` a `package.json`.
3. Añadir iconos en `src-tauri/icons/` (`tauri icon` los genera desde un PNG).
4. Resolver **capabilities** de Tauri v2 para permitir FS en el vault (o usar los comandos propios de
   `vault.rs`/`sessions.rs`, que usan `std::fs` y no necesitan el plugin FS).
5. `npm run tauri dev` (usa el dev server) y luego `npm run tauri build` (empaqueta con `dist/`).
6. Cablear el frontend: en escritorio, sustituir el acceso a Ollama por la opción 2 y añadir la UI
   de sesiones + el gesto "documenta esto → vault".

## Riesgos / lo que falta para que sea la app de verdad

- Proxy Ollama en Rust (arriba) y detección de plataforma (web vs. escritorio) en el frontend.
- Confinar y validar rutas del vault (evitar path traversal); elegir la raíz del vault (diálogo).
- Migrar sesiones a SQLite si crecen; hoy es un `sessions.json` completo por guardado.
- Firmado/notarización para distribuir; iconos y metadatos de bundle.
- Tests: los comandos Rust no tienen pruebas todavía.

## Veredicto

El encaje es **limpio y de bajo riesgo**: el núcleo web se reutiliza tal cual y Tauri añade disco +
base local con comandos pequeños. La cala queda **documentada y andamiada** en `exp/tauri`; retomar
el escritorio es la frontera correcta **después** de v2/v3 en la web (regla del ROADMAP). No se funde
a `main`; la conclusión vive en `EXPERIMENTS.md`.
