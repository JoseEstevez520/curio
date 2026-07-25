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
const HERO_SIZE = '1.5rem'; // = text-2xl
const HEADER_SIZE = '0.875rem'; // = text-sm

// El wordmark aparece QUIETO en la primera carga (como el mascota) y solo morphea en los
// cambios de superficie posteriores. Este pestillo a nivel de módulo se cierra tras el
// primer montaje de cualquier instancia (que siempre es el hero al abrir la app).
let hasAppeared = false;

export default function Wordmark({ variant }: { variant: 'hero' | 'header' }) {
  const isHero = variant === 'hero';
  const selfSize = isHero ? HERO_SIZE : HEADER_SIZE;
  const otherSize = isHero ? HEADER_SIZE : HERO_SIZE;
  // Capturamos "¿es la primera aparición?" en el primer render de esta instancia; el
  // efecto cierra el pestillo para las siguientes.
  const first = useRef(!hasAppeared);
  useEffect(() => {
    hasAppeared = true;
  }, []);

  // MÁS SUTIL: el logo lleva el morph; el texto solo lo ACOMPAÑA. Sigue viajando (layout="position",
  // nítido porque animamos fontSize y no scale), pero se ATENÚA mientras viaja (opacity 0.5→1), así
  // no roba atención. El grosor ya no cambia (estático por variante) para quitarle "morphiness".
  return (
    <motion.span
      layoutId="curio-wordmark"
      layout="position"
      initial={first.current ? false : { fontSize: otherSize, opacity: 0.5 }}
      animate={{ fontSize: selfSize, opacity: 1 }}
      transition={MASCOT_MORPH}
      className={`inline-block tracking-tight text-fg ${isHero ? 'font-bold' : 'font-semibold'}`}
    >
      Curio
    </motion.span>
  );
}
