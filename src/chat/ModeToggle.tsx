import { useChatStore, type Mode } from '../app/store';

const OPTIONS: { value: Mode; label: string }[] = [
  { value: 'chat', label: 'Chat' },
  { value: 'read', label: 'Leer' },
];

/**
 * Segmented control to switch between the chat and the article reader. Monochrome and
 * hairline-framed (DESIGN §4): the active segment gets a quiet inset fill, the other stays
 * muted. No shadows.
 */
export default function ModeToggle() {
  const mode = useChatStore((s) => s.mode);
  const setMode = useChatStore((s) => s.setMode);

  return (
    <div
      role="tablist"
      aria-label="Modo"
      className="inline-flex items-center gap-0.5 rounded-full border border-border p-0.5"
    >
      {OPTIONS.map((opt) => {
        const active = mode === opt.value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => setMode(opt.value)}
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
