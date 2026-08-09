// Shared UI strings for Curio's reading surfaces (popover, modal, status/errors), keyed by
// locale. Both the web app and the extension read from here, so a single language setting
// speaks consistently across surfaces. App-specific chrome (settings screens, etc.) can keep
// its own strings; this dictionary is the COMMON reading vocabulary shared by every surface.

import { DEFAULT_LOCALE, type Locale } from './locale';

/** The shape every locale must fill — keeps translations in sync (a missing key won't compile). */
export interface Strings {
  /** "See more" — opens the modal from the popover glimpse. */
  seeMore: string;
  /** Close button label. */
  close: string;
  /** Back button label (modal navigation). */
  back: string;
  /** Accessible label while the one-line gloss is loading. */
  loadingDescription: string;
  /** Accessible label while the rich component is generating. */
  generating: string;
  /** Accessible label for the follow-up "thinking" indicator. */
  thinking: string;
  /** Shown when no model is available to answer (extension + web). */
  noBrain: string;
}

export const STRINGS: Record<Locale, Strings> = {
  en: {
    seeMore: 'See more',
    close: 'Close',
    back: 'Back',
    loadingDescription: 'Loading description',
    generating: 'Generating description',
    thinking: 'Thinking',
    noBrain:
      'No AI available: enable Gemini Nano in Chrome, start Ollama (with OLLAMA_ORIGINS), or add an API endpoint and key.',
  },
  es: {
    seeMore: 'Ver más',
    close: 'Cerrar',
    back: 'Atrás',
    loadingDescription: 'Cargando descripción',
    generating: 'Generando descripción',
    thinking: 'Pensando',
    noBrain:
      'No hay IA disponible: activa Gemini Nano en Chrome, arranca Ollama (con OLLAMA_ORIGINS), o añade un endpoint y clave de API.',
  },
};

/** The string table for `locale`, falling back to the default locale's table. */
export function strings(locale: Locale): Strings {
  return STRINGS[locale] ?? STRINGS[DEFAULT_LOCALE];
}
