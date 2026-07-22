# Curio — Extensión de navegador (Chrome/Edge, MV3)

Lleva el "clic → descripción" de Curio a **cualquier página web**. Seleccionas una palabra o
frase y aparece su descripción ahí mismo; **"Ver más"** abre un modal con la UI generativa
(ficha, tabla, cronología…). Todo **local y sin API keys**, con el modelo del **navegador (Gemini
Nano)** por defecto y **Ollama de reserva** — reutiliza el mismo `@curio/core` que la app web.

> Vive en `apps/extension`. Es un **PoC funcional**: compila y carga como extensión sin
> empaquetar; para usarla hay que permitir su origen en Ollama (abajo).

## El cerebro: Gemini Nano primero, Ollama de reserva

La extensión usa un **"cerebro" enchufable** (`LlmProvider` de `@curio/core`). Elige así:

1. **Gemini Nano** — la **IA integrada de Chrome** (Prompt API), on-device y **sin instalar nada**.
   Es la opción preferida: cero configuración para el usuario.
2. **Ollama** (reserva) — si el navegador no tiene Nano disponible, cae al daemon local
   `http://localhost:11434` (necesita permitir el origen, abajo).

Toda la **lógica** (catálogo Zod, prompts, generación de dos etapas, validación, saneador) vive en
`@curio/core` y es la misma que la web; solo cambia el proveedor.

## Cómo funciona (arquitectura)

- **Service worker (`background.ts`)** — el único que ejecuta el modelo. Detecta el cerebro
  (`isChromeAIAvailable()` → Nano; si no, `pingOllama()` → Ollama) y responde
  `describe` / `generate` / `status` por mensajes. Con Ollama, las llamadas salen del **origen de
  la extensión** (cubierto por `host_permissions`), así la CSP/CORS de la página no las bloquea.
- **Content script (`content.tsx`)** — monta la UI en un **Shadow DOM** (aislado del CSS de la
  página; el CSS de Tailwind se inyecta dentro del shadow). Al seleccionar texto, muestra el
  popover con la glosa y, en "Ver más", el modal con `CatalogRenderer` del core.
- **Popup** — muestra qué cerebro hay (Nano / Ollama / ninguno); con Ollama, selector de modelo;
  on/off. Atajo **Alt+C** para activar.

## Requisitos según el cerebro

- **Con Gemini Nano** (recomendado): un Chrome reciente con la Prompt API disponible (puede requerir
  activarla en `chrome://flags` y que Chrome descargue el modelo la primera vez). **Nada de Ollama.**
- **Con Ollama** (reserva): Ollama bloquea los orígenes de navegador por defecto, así que hay que
  permitir el de la extensión (`chrome-extension://<id>`) al arrancarlo:

  ```bash
  # Windows (PowerShell)
  $env:OLLAMA_ORIGINS = "chrome-extension://*"; ollama serve
  # macOS / Linux
  OLLAMA_ORIGINS=chrome-extension://* ollama serve
  ```

  (Para acotar, sustituye `*` por el id real de la extensión.) Si Ollama corre como servicio,
  reinícialo con esa variable. El popup avisa qué cerebro está usando (o si no hay ninguno).

## Compilar y cargar (desarrollo)

```bash
npm install            # en la raíz del monorepo
npm run build:ext      # genera apps/extension/dist/
```

Luego en Chrome/Edge:

1. Abre `chrome://extensions`.
2. Activa **Modo desarrollador** (arriba a la derecha).
3. **Cargar descomprimida** → elige `apps/extension/dist`.
4. Ancla "Curio" y ábrelo: elige modelo y pulsa **Activo** (o Alt+C en la página).
5. Selecciona una palabra/frase en cualquier página → aparece la descripción.

Para iterar: `npm -w @curio/extension run dev` (rebuild en watch) y pulsa *recargar* en
`chrome://extensions`.

## Estado y límites (honesto)

- **Compila y typechea** (`tsc --noEmit` + build de Vite/crxjs). Genera un `dist/` cargable MV3.
- **No verificado end-to-end en este entorno**: cargar la extensión sin empaquetar y permitir su
  origen en Ollama son pasos manuales del usuario (cambian la config de Ollama y requieren
  `chrome://extensions`), así que la prueba en vivo queda de tu lado.
- **Gesto**: por ahora se dispara al **seleccionar texto** (robusto en páginas arbitrarias), no
  haciendo clicable cada palabra (eso sería invasivo en webs de terceros). El popover se posiciona
  a mano bajo la selección (sin Floating UI, para simplicidad en el shadow DOM).
- **Pendiente**: streaming de la glosa (ahora llega completa), caché entre selecciones, y compartir
  el popover/modal exacto de la web (fase 3, cuando el motor de lectura se mueva al core).

## Reutilización — la "pieza portable"

La extensión NO reimplementa la lógica: importa `@curio/core` igual que la app web y (a futuro) el
PoC de escritorio. Lo único propio de la extensión es la fontanería del navegador (service worker,
shadow DOM, mensajes) y un popover mínimo. El catálogo generativo se renderiza con el mismo
`CatalogRenderer` del core.
