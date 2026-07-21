import { useState, type FormEvent, type KeyboardEvent } from 'react';

interface ComposerProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function Composer({ onSend, disabled }: ComposerProps) {
  const [text, setText] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit(e);
    }
  };

  return (
    <form onSubmit={submit} className="sticky bottom-0 border-t border-border bg-bg px-6 py-4">
      <div className="mx-auto flex max-w-measure items-end gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Ask something…"
          className="flex-1 resize-none rounded-sm border border-border bg-bg px-3 py-2 text-base text-fg outline-none placeholder:text-fg-faint focus-visible:border-border-focus"
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className="rounded-sm border border-border px-4 py-2 text-sm text-fg transition-colors duration-fast hover:bg-bg-muted disabled:cursor-not-allowed disabled:text-fg-faint"
        >
          Send
        </button>
      </div>
    </form>
  );
}
