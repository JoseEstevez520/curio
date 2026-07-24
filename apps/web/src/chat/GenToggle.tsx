import { useChatStore } from '../app/store';

const OPTIONS: { value: boolean; label: string }[] = [
  { value: false, label: 'Texto' },
  { value: true, label: 'Gen UI' },
];

/**
 * Segmented control for the output format, GLOBAL across surfaces: plain Texto, or Gen UI (the
 * assistant's chat replies AND the article reader compose Curio's components via OpenUI). Same
 * monochrome pill as ModeToggle. Gen UI wants a capable brain (Groq) — a small local model
 * won't compose reliably.
 */
export default function GenToggle() {
  const genUI = useChatStore((s) => s.genUI);
  const setGenUI = useChatStore((s) => s.setGenUI);

  return (
    <div
      role="tablist"
      aria-label="Formato de respuesta"
      className="inline-flex items-center gap-0.5 rounded-full border border-border p-0.5"
    >
      {OPTIONS.map((opt) => {
        const active = genUI === opt.value;
        return (
          <button
            key={opt.label}
            role="tab"
            aria-selected={active}
            onClick={() => setGenUI(opt.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-fast ${
              active ? 'bg-bg-inset text-fg' : 'text-fg-muted hover:text-fg'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
