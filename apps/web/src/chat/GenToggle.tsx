import { useChatStore } from '../app/store';

/**
 * Toggle for GENERATIVE chat: when on, the assistant answers by composing Curio's components
 * (OpenUI) instead of plain text. Monochrome pill, matching ModeToggle. Wants a capable brain
 * (Groq) — a small local model won't compose reliably.
 */
export default function GenToggle() {
  const genChat = useChatStore((s) => s.genChat);
  const setGenChat = useChatStore((s) => s.setGenChat);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={genChat}
      onClick={() => setGenChat(!genChat)}
      title="Respuestas como componentes (OpenUI) en vez de solo texto"
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-fast ${
        genChat
          ? 'border-border bg-bg-inset text-fg'
          : 'border-border text-fg-muted hover:text-fg'
      }`}
    >
      ✦ Generativa
    </button>
  );
}
