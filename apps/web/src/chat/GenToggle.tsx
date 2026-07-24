import { useChatStore } from '../app/store';

const OPTIONS: { value: boolean; label: string }[] = [
  { value: false, label: 'Texto' },
  { value: true, label: 'Gen UI' },
];

/**
 * Segmented control for the reply format: plain Texto or Gen UI (the assistant composes Curio's
 * components via OpenUI). Same monochrome pill as ModeToggle so the active segment reads clearly.
 * Gen UI wants a capable brain (Groq) — a small local model won't compose reliably.
 */
export default function GenToggle() {
  const genChat = useChatStore((s) => s.genChat);
  const setGenChat = useChatStore((s) => s.setGenChat);

  return (
    <div
      role="tablist"
      aria-label="Formato de respuesta"
      className="inline-flex items-center gap-0.5 rounded-full border border-border p-0.5"
    >
      {OPTIONS.map((opt) => {
        const active = genChat === opt.value;
        return (
          <button
            key={opt.label}
            role="tab"
            aria-selected={active}
            onClick={() => setGenChat(opt.value)}
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
