// Curio's language layer — one place that decides what language everything speaks.
//
// A single `Locale` setting (chosen by the user on any surface) drives BOTH the UI strings
// (see ./strings) AND the language the model answers in (via `languageDirective`, injected
// into the system prompts). The prompt scaffolding itself stays in English — small models
// follow English instructions reliably — but the OUTPUT language is whatever this setting says.
// Adding a language = add its code here plus its entries in ./strings; nothing else changes.

/** Supported UI + output languages. Extend this union to add a language. */
export type Locale = 'es' | 'en';

/** All locales, in menu order. */
export const LOCALES: readonly Locale[] = ['en', 'es'];

/** The default when nothing is stored yet. */
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * English NAME of each language — used INSIDE the (English-scaffolded) system prompts, e.g.
 * "Always answer in Spanish." Kept in English on purpose so the directive reads naturally in
 * the prompt regardless of which language the model must produce.
 */
export const LANGUAGE_NAMES: Record<Locale, string> = {
  es: 'Spanish',
  en: 'English',
};

/**
 * NATIVE label of each language — what the user sees in a language picker ("Español", "English").
 * Never sent to the model; purely for the UI.
 */
export const LANGUAGE_LABELS: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
};

/** True if `value` is a supported locale — for validating stored / query values. */
export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Coerce any stored/env value to a valid locale, falling back to the default. */
export function toLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * The output-language instruction injected into every describer/generator system prompt. This
 * is the seam that makes the model's language configurable: swap the locale and every lookup
 * answers in the new language, without touching the prompt bodies. Replaces the old
 * "answer in the same language as the text" rule with an explicit, user-chosen target.
 */
export function languageDirective(locale: Locale): string {
  return `Always answer entirely in ${LANGUAGE_NAMES[locale]}. Never mix languages, regardless of the language of the surrounding text.`;
}
