# Curio - Logo Interactivo

## Arquitectura

El logo de Curio es un blob azul 3D renderizado como PNG (`curionuevo.png`) **sin ojos**. Los ojos se crean por codigo (CSS/JS) y se superponen en la posicion correcta. Esto permite animarlos independientemente.

**Archivos:**
- `curionuevo.png` - Blob sin ojos (cuerpo)
- `curio.png` - Blob original con ojos (referencia)
- `showcase.html` - Catalogo de todas las animaciones con flujos
- `prototype.html` - Prototipo basico de eye tracking
- `v1-v10.svg` - Experimentos SVG (descartados, el PNG 3D es mejor)

## Posicion en la UI

El logo va **arriba a la izquierda** de la interfaz de chat. El input del usuario esta **abajo**. Por esto:
- La mirada neutral debe apuntar ligeramente **abajo-derecha** (hacia el contenido)
- El peek se hace **desde arriba** (no desde la izquierda)
- El escaneo de chat es **vertical** (arriba-abajo)

## Posicion de los ojos

```
.eye-l { top: 54%; left: 37%; }
.eye-r { top: 54%; left: 62%; }
```

Las pupilas son circulos negros de 17px con gradiente radial y un reflejo blanco (::after).

## Posicion del monoculo

Siempre sobre el ojo derecho:
```
top: 60%; left: 62%; transform: translate(-50%, -50%);
```
- Borde: 3px solid #d4af37 (dorado)
- Handle: linea de 2.5px que sale del borde inferior, rotada 20deg
- Sin brillo/glow

## Animaciones

### Estados idle

**Respiracion**
- `scale(1) <-> scale(1.03) translateY(-4px)` en 4s loop
- Siempre activa como base

**Parpadeo**
- `scaleY(1) -> scaleY(0.05) -> scaleY(1)` en 150ms
- Aleatorio cada 2-5 segundos

**Dormido**
- Ojos cerrados: blink rapido que se queda en `scaleY(0.05)` (no deformar gradualmente)
- Body: bob suave `rotate(-3deg) translateY(3px)` en 3s loop
- Zzz: salen FUERA de la cara (top-right del blob, ~left:76-88%), escalonadas verticalmente, tamaño creciente (z, z, Z)

**Despertar**
- Bounce con anticipacion (squash down -> spring up -> overshoot -> settle)
- Ojos se abren de golpe: `scaleY(0.05) -> scaleY(1.15) -> scaleY(1)` (sorpresa)

### Estados de interaccion

**Mirando abajo-derecha (usuario escribe)**
- Body se inclina: `rotate(-2deg) translateY(5px)`
- Pupilas: `translate(3px, 4px)` (abajo-derecha)

**Escaneo vertical (leyendo chat)**
- Pupilas suben y bajan: `translate(2px, -3px) <-> translate(2px, 3px)`
- Body oscila ligeramente

**Pensando (IA genera respuesta)**
- Body wobble: `rotate(2deg) <-> rotate(-2deg)` en 2s
- Tres dots pulsantes debajo del blob
- Ojos INTACTOS, no deformar

### Flujo del monoculo (inspeccion de referencias)

1. **Monoculo aparece**: body anticipa (lean -2deg), luego lean +3deg con overshoot. Monoculo entra con spring desde abajo.
2. **Buscando**: ojos escanean de lado a lado, **monoculo se mueve con los ojos** (misma animacion). Body sway suave.
3. **Eureka (encontrado)**: bounce con spring, sparkles ALREDEDOR del blob (arriba, derecha, abajo, izquierda - distribuidos), monoculo se queda.
4. **Sin resultados**: monoculo cae con gravedad (leve subida antes de caer), body se encoge (deflate).

### Feedback

**Contento**
- Wiggle: `rotate(4deg) <-> rotate(-4deg)` con scale(1.03)
- Sparkles alrededor (misma distribucion que eureka)
- Ojos INTACTOS

**Error**
- Freeze -> shake horizontal
- Pupilas: espirales giratorias (border trick, sin cambiar el fondo)
- Texto "Oops..." debajo

**Squish (click en el blob)**
- Secuencia: `scale(1.18, 0.82) -> scale(0.88, 1.12) -> scale(1.06, 0.94) -> scale(1)`
- Ojos intactos

### Otros

**Peek desde arriba**
- Se esconde hacia arriba (`translateY(-140px)`)
- Baja gradualmente: primero asoman los ojos, luego el cuerpo
- Pupilas miran abajo

## Principios de animacion

- **Web Animations API** para transiciones entre estados (no CSS class swapping)
- Siempre `commitStyles()` + `cancel()` antes de iniciar nueva animacion
- Animar DESDE la posicion actual (`getComputedStyle().transform`) para evitar saltos
- **Anticipacion**: counter-move antes de la accion principal
- **Follow-through**: overshoot + settle al final
- **Easing**: `cubic-bezier(0.34, 1.56, 0.64, 1)` para spring, `cubic-bezier(0.25, 0.46, 0.45, 0.94)` para organic
- Solo animar `transform` y `opacity` (compositor thread)
- NUNCA deformar los ojos (excepto blink/dormido con scaleY y error con espirales)
- Elementos decorativos (sparkles, zzz) siempre FUERA de la cara del blob
