# Curio — Idea

> Estado: **idea capturada, sin implementar.** Documento de arranque.
> Nombre del proyecto: **Curio**. Repo: `github.com/JoseEstevez520/curio`.

## Pitch en una frase

Lees un mensaje de un LLM (o cualquier texto), **haces clic o pasas el ratón sobre una
palabra** y aparece una **descripción completa** de esa palabra ahí mismo. Para curiosos, para
investigadores: se acabó el copiar-pegar-buscar-volver.

## El problema

Has sido curioso toda la vida y siempre ha sido el mismo baile: **copiar, pegar, buscar,
volver. Copiar, pegar, buscar, volver.** Cada vez que aparece una palabra que no conoces
tienes que salir del texto, ir a buscarla y regresar. Eso no es para nosotros los curiosos.

## La visión / solución

- Recibes un mensaje de un LLM (o lees un texto).
- **Clic** sobre una palabra, o **hover** con el ratón encima.
- Aparece una **descripción completa** de esa palabra/entidad, sin salir.

El ángulo de marketing es la **curiosidad** (de ahí el nombre, **Curio**): la herramienta para
gente curiosa que quiere entender lo que lee en el momento.

## Piezas técnicas (lo que va de esto)

- **Entidades** — detectar qué palabras del texto son "clicables" / tienen descripción.
- **Lazy loading** — no se calcula todo de golpe; la descripción se genera/carga solo cuando
  el usuario hace clic o pasa el ratón por encima. Bajo demanda.
- **Modelos pequeños (small models)** — para que sea barato y rápido generar esas
  descripciones.
- **Local, sin API key** — no hace falta clave de API: se puede usar **Ollama** o similar para
  correr los modelos en local.

## Plan de arranque

Primero, un **POC / prototipo** para probar cosas y ver qué funciona:
- Coger un texto (o un mensaje de un LLM).
- Detectar entidades / palabras clicables.
- Al hacer clic o hover, generar la descripción con un modelo pequeño local (Ollama), bajo
  demanda (lazy).

Después de validar el POC se decide en qué se convierte (aplicación, extensión, etc.).

## Preguntas abiertas (a decidir más adelante)

- ¿Forma final? ¿Aplicación propia, extensión de navegador, u otra cosa? (a decidir tras el POC)
- ¿Qué modelo pequeño usar en local con Ollama para las descripciones?
- ¿Qué cuenta como "palabra clicable"? ¿Todas, solo entidades, solo términos poco comunes?
- ¿Sobre qué texto se prueba primero? (mensajes de un LLM parece el caso natural)
