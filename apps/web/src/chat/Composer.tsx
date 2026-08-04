import { useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';

interface ComposerProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  /** Compact mode for embedding inside modals etc. Removes sticky/padding. */
  compact?: boolean;
}

const MAX_HEIGHT = 200;

export default function Composer({ onSend, disabled, compact }: ComposerProps) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? 'auto' : 'hidden';
  }, [text]);

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

  // The button is always there. It merges with the input when idle (no focus, no text)
  // and separates like a liquid droplet when active.
  const active = focused || text.trim().length > 0;

  const wrapper = compact ? '' : 'sticky bottom-0 bg-bg pb-5 pt-2';
  const inner = compact ? '' : 'mx-auto w-full max-w-2xl px-4';

  return (
    <form onSubmit={submit} className={wrapper}>
      <div className={inner}>
        <div style={{ filter: 'url(#curio-gooey)' }}>
          <div className="relative flex items-end">
            <textarea
              ref={taRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              rows={1}
              placeholder="Ask anything..."
              className="max-h-[200px] min-h-[44px] flex-1 resize-none overflow-y-hidden rounded-3xl bg-bg-muted px-4 py-[11px] text-base leading-normal text-fg outline-none placeholder:text-fg-faint"
              style={{
                marginRight: active ? 52 : 0,
                transition: 'margin-right 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                transform: active ? 'translateX(0)' : 'translateX(-4px)',
                transition: 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
              }}
            >
              <button
                type="submit"
                disabled={disabled || !text.trim()}
                aria-label="Send"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-muted transition-colors duration-fast hover:bg-accent hover:text-accent-fg disabled:text-fg-faint"
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
                  style={{
                    opacity: active ? 1 : 0,
                    transition: 'opacity 0.3s ease 0.15s',
                  }}
                >
                  <path d="M5 12h13" />
                  <path d="M12 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SVG gooey filter — shared id so it works everywhere */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="curio-gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>
    </form>
  );
}
