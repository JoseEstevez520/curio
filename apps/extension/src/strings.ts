// Extension UI strings, keyed by locale. Reuses the shared reading vocabulary from @curio/core
// (STRINGS) and adds the popup-only chrome the core doesn't know about. One `locale` (persisted in
// chrome.storage) drives all of it, plus the language the model answers in (see background.ts).

import { STRINGS as CORE, type Locale, type Strings as CoreStrings } from '@curio/core';

/** Everything the extension UI needs: the shared reading strings plus popup-only ones. */
export interface ExtStrings extends CoreStrings {
  /** Toggle button when Curio is on / off. */
  active: string;
  disabled: string;
  /** Status line while probing which brain is available. */
  checking: string;
  /** Status lines per available brain. */
  brainChromeAI: string;
  brainOllama: string;
  brainNone: string;
  /** Model picker label + empty state. */
  model: string;
  noModels: string;
  /** "Select text on the page (or press {Alt+C} to toggle)." split around the shortcut. */
  selectHintPre: string;
  selectHintPost: string;
  /** Setup hint shown when no brain is available. */
  enableHint: string;
  /** Language picker label. */
  language: string;
  /** Brain preference picker label + options. */
  brain: string;
  brainAuto: string;
  brainCloud: string;
  /** Status line when the cloud endpoint is the active brain. */
  brainCloudConnected: string;
  /** Cloud form field labels + actions. */
  cloudEndpoint: string;
  cloudKey: string;
  cloudModel: string;
  cloudSave: string;
  cloudSaved: string;
  cloudNeedsConfig: string;
  cloudDenied: string;
}

type PopupOnly = Omit<ExtStrings, keyof CoreStrings>;

const POPUP: Record<Locale, PopupOnly> = {
  en: {
    active: 'On',
    disabled: 'Off',
    checking: 'Checking…',
    brainChromeAI: 'Browser AI (Gemini Nano) · zero setup',
    brainOllama: 'Ollama connected',
    brainNone: 'No AI available',
    model: 'Model',
    noModels: 'No models — run `ollama pull`',
    selectHintPre: 'Select text on the page (or press',
    selectHintPost: 'to toggle).',
    enableHint:
      'Enable Gemini Nano in Chrome (chrome://flags → Prompt API), or start Ollama allowing the extension:',
    language: 'Language',
    brain: 'Brain',
    brainAuto: 'Auto (local)',
    brainCloud: 'Cloud',
    brainCloudConnected: 'Cloud endpoint · bring-your-own-key',
    cloudEndpoint: 'Endpoint (OpenAI-compatible)',
    cloudKey: 'API key (optional)',
    cloudModel: 'Model id',
    cloudSave: 'Grant access & save',
    cloudSaved: 'Saved ✓',
    cloudNeedsConfig: 'Enter an endpoint URL and a model id.',
    cloudDenied: 'Access to that endpoint was denied.',
  },
  es: {
    active: 'Activo',
    disabled: 'Desactivado',
    checking: 'Comprobando…',
    brainChromeAI: 'IA del navegador (Gemini Nano) · sin configurar nada',
    brainOllama: 'Ollama conectado',
    brainNone: 'Sin IA disponible',
    model: 'Modelo',
    noModels: 'Sin modelos — haz `ollama pull`',
    selectHintPre: 'Selecciona texto en la página (o pulsa',
    selectHintPost: 'para activar).',
    enableHint:
      'Activa Gemini Nano en Chrome (chrome://flags → Prompt API), o arranca Ollama permitiendo la extensión:',
    language: 'Idioma',
    brain: 'Cerebro',
    brainAuto: 'Auto (local)',
    brainCloud: 'Cloud',
    brainCloudConnected: 'Endpoint cloud · trae-tu-clave',
    cloudEndpoint: 'Endpoint (compatible con OpenAI)',
    cloudKey: 'Clave de API (opcional)',
    cloudModel: 'ID del modelo',
    cloudSave: 'Dar acceso y guardar',
    cloudSaved: 'Guardado ✓',
    cloudNeedsConfig: 'Introduce la URL del endpoint y un ID de modelo.',
    cloudDenied: 'Se denegó el acceso a ese endpoint.',
  },
};

/** The full string table for `locale` (shared reading strings + popup chrome). */
export function t(locale: Locale): ExtStrings {
  return { ...CORE[locale], ...POPUP[locale] };
}
