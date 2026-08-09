import { LOCALES, type Locale } from '@curio/core';
import { useChatStore } from '../app/store';
import Segmented from './Segmented';

/**
 * The language switch: sets the one `locale` that drives BOTH the UI strings and the language
 * the model answers in (via the prompts' language directive). Compact code labels (EN/ES) so it
 * sits comfortably next to the other header toggles.
 */
export default function LanguagePicker() {
  const locale = useChatStore((s) => s.locale);
  const setLocale = useChatStore((s) => s.setLocale);

  return (
    <Segmented<Locale>
      id="curio-locale"
      ariaLabel="Language"
      options={LOCALES.map((l) => ({ value: l, label: l.toUpperCase() }))}
      value={locale}
      onChange={setLocale}
    />
  );
}
