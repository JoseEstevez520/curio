import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MASCOT_MORPH } from '@curio/core';

/**
 * El wordmark "Curio". Comparte `layoutId` con su gemelo en la otra superficie, así que
 * Framer lo trata como UNA sola pieza que VIAJA entre el hero (chat vacío) y el header,
 * igual que el mascota. Coherente con la filosofía "todo fluye a un lugar" (DESIGN §9).
 *
 * EL RETO: el texto pasa de 24px/bold (hero) a 14px/semibold (header). El morph por
 * defecto de `layoutId` corrige la diferencia de tamaño con `transform: scale`, que
 * RASTERIZA el texto y lo deja borroso a mitad de camino. Solución:
 *   - `layout="position"` → Framer anima SOLO la posición (el viaje), nunca escala el
 *     tamaño, así que el texto siempre se dibuja nítido a su tamaño real.
 *   - animamos `fontSize`/`fontWeight` como estilo de verdad → el navegador re-renderiza
 *     los glifos a cada tamaño intermedio (nítidos), en vez de estirar un bitmap.
 * Cada instancia anima desde el tamaño de la OTRA superficie hacia el suyo, así el morph
 * funciona en ambos sentidos (hero→header y header→hero) sin estado compartido.
 */
const HERO = { fontSize: '1.5rem', fontWeight: 700 }; // = text-2xl font-bold
const HEADER = { fontSize: '0.875rem', fontWeight: 600 }; // = text-sm font-semibold

// El wordmark aparece QUIETO en la primera carga (como el mascota) y solo morphea en los
// cambios de superficie posteriores. Este pestillo a nivel de módulo se cierra tras el
// primer montaje de cualquier instancia (que siempre es el hero al abrir la app).
let hasAppeared = false;

export default function Wordmark({ variant }: { variant: 'hero' | 'header' }) {
  const self = variant === 'hero' ? HERO : HEADER;
  const other = variant === 'hero' ? HEADER : HERO;
  // Capturamos "¿es la primera aparición?" en el primer render de esta instancia; el
  // efecto cierra el pestillo para las siguientes.
  const first = useRef(!hasAppeared);
  useEffect(() => {
    hasAppeared = true;
  }, []);

  return (
    <motion.span
      layoutId="curio-wordmark"
      layout="position"
      initial={first.current ? false : other}
      animate={self}
      transition={MASCOT_MORPH}
      className="inline-block tracking-tight text-fg"
    >
      Curio
    </motion.span>
  );
}
