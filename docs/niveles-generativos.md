# Curio — Niveles de UI generativa y el rumbo "manipulable"

> Estado: **visión, no implementado.** Recoge la reflexión sobre hacia dónde crece Curio más
> allá del "clic → descripción". Es el mapa; los slices concretos viven en `docs/ROADMAP.md`.
> Nada de esto rompe el estilo sagrado (`docs/DESIGN.md`) ni las restricciones de `CLAUDE.md`
> sin que el dueño lo decida antes; los puntos donde chocan se marcan como **bifurcación**.

## La idea de fondo

Curio no quiere ser un chat rígido: quiere que lo que lees sea **explorable** y que puedas
**hacer cosas encima de cada cosa** — esa sensación nativa (tocas, mueves, haces zoom)
que se pierde en la web. El vehículo para eso es la **UI generativa**: que la interfaz no sea
fija, sino que **tome la forma que mejor expresa** lo que estás mirando.

## Los niveles de UI generativa

- **Nivel 1 — UI estática.** La interfaz está escrita a mano y no cambia. La web de siempre.
- **Nivel 2 — el modelo elige y rellena.** El modelo escoge un componente de un **catálogo
  fijo** y devuelve JSON para rellenarlo. **Aquí está Curio hoy** (catálogo de piezas + envelope
  validado con Zod). Fiable con modelos pequeños porque no escribe interfaz a mano.
- **Nivel 3 — el modelo genera la interfaz.** La UI se **fabrica a medida de la situación**
  porque ninguna pantalla prefabricada la anticipa. Ejemplo canónico (vuelos): "destinos
  paradisíacos, 100–120 €, con 2 amigos, por día" — ninguna web de vuelos tiene esa vista, así
  que se te **genera** para tu intención concreta. Es el norte.

### Qué hace falta para el nivel 3 (los dos muros)

1. **Modelo capaz.** Elegir de un catálogo lo hace un 3B; **autorar** una interfaz con criterio
   no. El nivel 3 con calidad pide un modelo potente y rápido — no `llama3.2:3b` ni Gemini Nano.
   **Bifurcación:** aquí la regla "modelo pequeño y local" ya no aguanta (ver "Privacidad").
2. **Robustez.** Ni en la frontera dejan al modelo escribir HTML libre (se rompe, sale feo, es
   riesgo). Lo constriñen a un **vocabulario de componentes que el modelo *compone* libremente**
   — ensambla piezas vetadas en un layout nuevo, no elige 1 de N. Eso da ~80 % de la sensación
   "hecho a medida" con garantía de calidad.

### El puente realista

**Nivel 2 (catálogo fijo) → Nivel 2.5 (vocabulario rico que el modelo compone a medida) →
Nivel 3 (autoría total, cuando los modelos lo permitan con gusto).** Construir el substrato
componible ahora deja deslizarse hacia el 3 según mejoren los modelos, sin reescribir. El nivel
3 es cosa del **modelo y del substrato**, no de web vs. nativo: la web sirve para explorarlo; el
limitador es el cerebro.

## El combustible: contexto

La UI generativa es más rica cuantos más **datos** tiene. El moat no es *generar* la interfaz —
es tener el **contexto** que la hace tuya. Curio se sienta sobre tres capas:

1. **Lo que lees ahora** — la frase, el artículo, el hilo. **Ya se usa** ("en contexto"). Google
   o una web de vuelos no saben qué tienes delante; Curio sí.
2. **La intención de la sesión** — qué intentas hacer ahora. Casi gratis: se saca del propio
   hilo. **Palanca más barata a corto plazo.**
3. **Tú a lo largo del tiempo** — quién eres, qué sabes, qué has explorado y guardado. Es **el
   segundo cerebro**, y no es una función de "guardar": es el **combustible** que hace que la UI
   se genere *para ti* en vez de genérica. Leer + acumular + generar se vuelven un solo bucle.

**Bifurcación (privacidad):** datos ricos del usuario + modelo capaz chocan. Local = privado
pero capa la calidad; nube = potente pero mandas tu contexto fuera. Tercera vía elegante: el
segundo cerebro vive **local** y solo se le manda al modelo la **rebanada mínima** de contexto
que hace falta para cada generación. Privacidad por defecto, capacidad cuando la pides.

## El objetivo cercano: el "mix"

Ni chat pelado ni lienzo puro. La **espina sigue siendo el chat / la lectura**, pero en vez de
solo texto **crecen objetos ricos vivos dentro del flujo**. El clic sobre una palabra deja de
abrir "un textito" y pasa a hacer tres cosas en un gesto:

1. **Nace un objeto rico** — no un párrafo, una pieza con forma (nivel 2 → 2.5).
2. **Se guarda solo** — el "cuadro" queda ahí, acumulándose (semilla del segundo cerebro).
3. **Le puedes hablar en el sitio** — "¿y por qué no X e Y?" y **se rehace ahí mismo**, antes
   del "ver más".

La tercera es la joya: **reconvierte la conversación**. El chat es hablar *con un texto*; esto
es hablar *con el objeto* — el nudge no añade una burbuja debajo, **reforma la cosa que tienes
delante**. Es el puente entre el chat rígido y lo nativo.

**Semilla alcanzable ya (sin modelo perfecto):** los nudges no tienen por qué regenerar de cero.
Si son **operaciones acotadas** — "compara con Y", "añade este eje", "más corto", "dame
ejemplos" — son baratas y se sienten instantáneas. Empezar por un puñado de nudges rápidos ya
hace *oler* el rumbo sin necesitar el modelo grande ni el lienzo.

## El nivel siguiente: manipulable ("Tony Stark")

La meta lejana: la superficie deja de ser una transcripción y pasa a ser un **lienzo de objetos
vivos** que tienen **masa** — los tocas, los mueves, los dispones en el espacio, les hablas y
ceden. Dos motores distintos, que se construyen muy diferente:

- **Tocar** — mover, arrastrar, disponer objetos en el espacio. Es un **lienzo espacial**; ahí
  la PoC web se estruja y empieza a pedir el salto a nativo.
- **Hablarle** — empujas el objeto ("por qué no X") → se rehace. Es **la conversación aplicada
  al objeto**; esto se puede empezar a oler en la web casi ya (es el punto 3 del "mix").

**El hechizo vive o muere por la FLUIDEZ.** Si al decir "¿y por qué no X?" un 3B local tarda 4
segundos, se rompe. La magia es que responda **al toque, como si tuviera masa** — por eso este
nivel es el que más aprieta la pregunta del modelo (rápido) y la del lienzo (espacial). Se
documenta para tenerlo fijado; **se probará cuando toque**, no ahora.

## Resumen del rumbo

| Fase | Qué | Dónde estamos |
|---|---|---|
| Hoy | Nivel 2: catálogo fijo + envelope validado | ✅ hecho |
| Cercano | **El mix**: objetos ricos en el flujo + nudges acotados + se guardan (semilla 2º cerebro) | ⟵ siguiente a explorar |
| Medio | Nivel 2.5: vocabulario componible + más contexto (intención de sesión) | pendiente |
| Lejano | Manipulable "Tony Stark" (lienzo + hablarle al objeto) + nivel 3 real | a probar cuando toque |

Restricciones vivas a resolver por el dueño en cada frontera: **modelo pequeño/local vs. capaz**,
**monocromo sobrio vs. expresivo por concepto**, **privacidad vs. nube**.
