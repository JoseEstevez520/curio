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
      title="Respuestas como componentes (Gen UI) en vez de solo texto"
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-fast ${
        genChat ? 'bg-bg-inset text-fg' : 'text-fg-muted hover:text-fg'
      }`}
    >
      Gen UI
    </button>
  );
}
