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
    <form onSubmit={submit} className="sticky bottom-0 bg-bg pb-5 pt-2">
      <div className="mx-auto flex w-full max-w-2xl items-end gap-2 px-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Ask something…"
          className="flex-1 resize-none rounded-2xl bg-bg-muted px-4 py-3 text-base text-fg outline-none placeholder:text-fg-faint"
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          aria-label="Send"
          className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg transition-colors duration-fast hover:bg-accent-hover disabled:bg-bg-inset disabled:text-fg-faint"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h13" />
            <path d="M12 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </form>
  );
}
