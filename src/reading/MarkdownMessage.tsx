import { Children, useRef, type ReactNode, type MouseEvent } from 'react';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChatStore } from '../app/store';
import { tokenize } from './tokenize';

const BLOCK_SELECTOR = 'p,li,h1,h2,h3,h4,h5,h6,blockquote,td,th';

/** Wrap each content word in an inline .entity span (plain span → clean text selection). */
function toClickable(text: string): ReactNode[] {
  return tokenize(text).map((tok, i) =>
    tok.clickable ? (
      <span key={i} className="entity">
        {tok.text}
      </span>
    ) : (
      <span key={i}>{tok.text}</span>
    ),
  );
}

/** Replace string children with clickable words; leave nested elements untouched. */
function clickify(children: ReactNode): ReactNode {
  return Children.map(children, (child) =>
    typeof child === 'string' ? toClickable(child) : child,
  );
}

const components: Components = {
  p: ({ children }) => <p className="mb-3 last:mb-0">{clickify(children)}</p>,
  strong: ({ children }) => <strong className="font-semibold text-fg">{clickify(children)}</strong>,
  em: ({ children }) => <em className="italic">{clickify(children)}</em>,
  del: ({ children }) => <del>{clickify(children)}</del>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-accent underline">
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
  li: ({ children }) => <li>{clickify(children)}</li>,
  h1: ({ children }) => (
    <h3 className="mb-2 mt-4 text-lg font-semibold first:mt-0">{clickify(children)}</h3>
  ),
  h2: ({ children }) => (
    <h3 className="mb-2 mt-4 text-lg font-semibold first:mt-0">{clickify(children)}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="mb-1 mt-3 text-base font-semibold first:mt-0">{clickify(children)}</h4>
  ),
  h4: ({ children }) => (
    <h5 className="mb-1 mt-3 font-semibold first:mt-0">{clickify(children)}</h5>
  ),
  h5: ({ children }) => (
    <h6 className="mb-1 mt-3 font-semibold first:mt-0">{clickify(children)}</h6>
  ),
  h6: ({ children }) => (
    <h6 className="mb-1 mt-3 font-semibold first:mt-0">{clickify(children)}</h6>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-2 border-border pl-3 text-fg-secondary last:mb-0">
      {clickify(children)}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isBlock = /language-/.test(className ?? '');
    return isBlock ? (
      <code className="font-mono text-[0.85em]">{children}</code>
    ) : (
      <code className="rounded-md bg-bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-3 overflow-x-auto rounded-xl bg-bg-muted p-3 text-sm last:mb-0">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-4 border-border" />,
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto last:mb-0">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-border px-2 py-1 text-left font-semibold">
      {clickify(children)}
    </th>
  ),
  td: ({ children }) => <td className="border-b border-border px-2 py-1">{clickify(children)}</td>,
};

interface MarkdownMessageProps {
  messageId: string;
  content: string;
  streaming?: boolean;
}

/** Assistant reply rendered as Markdown, with word-click and phrase-selection to describe. */
export default function MarkdownMessage({ messageId, content, streaming }: MarkdownMessageProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Set when a drag just handled a selection, so the click that a short drag also
  // fires doesn't overwrite the phrase band with a single-word pill. Auto-cleared
  // on the next tick so it never suppresses a later genuine click.
  const justDragged = useRef(false);

  const blockText = (node: Node | null): string => {
    const el = node instanceof Element ? node : node?.parentElement;
    const block = el?.closest(BLOCK_SELECTOR) ?? ref.current;
    return (block?.textContent ?? '').slice(0, 600);
  };

  // Single click → describe the clicked word.
  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if (justDragged.current) {
      justDragged.current = false;
      return; // this click is the tail of a drag we already handled
    }
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.toString().trim()) return; // a drag; handled on mouse-up
    const entity = (e.target as HTMLElement).closest('.entity');
    if (!(entity instanceof HTMLElement) || !ref.current?.contains(entity)) return;
    const word = entity.textContent?.trim() ?? '';
    if (!word) return;
    useChatStore.getState().setSelection({
      messageId,
      text: word,
      context: blockText(entity),
      el: entity,
      range: null,
      block: entity.closest(BLOCK_SELECTOR) as HTMLElement | null,
    });
  };

  // Drag select any text → describe whatever was selected (one word or many).
  const onMouseUp = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
    const liveRange = sel.getRangeAt(0);
    if (!ref.current?.contains(liveRange.commonAncestorContainer)) return;
    const text = sel.toString().trim();
    if (!text) return;
    const node = liveRange.commonAncestorContainer;
    const blockEl =
      (node instanceof Element ? node : node.parentElement)?.closest(BLOCK_SELECTOR) ?? ref.current;
    const range = liveRange.cloneRange();
    useChatStore.getState().setSelection({
      messageId,
      text,
      context: blockText(node),
      el: null,
      range,
      block: blockEl as HTMLElement | null,
    });
    // Drop the native selection so only our own rounded band shows (no double band).
    // The cloned range keeps the geometry for the popover anchor and PhraseHighlight.
    sel.removeAllRanges();
    // Swallow the click a short (same-element) drag also fires; clear next tick so a
    // later real click still works even if no click followed this drag.
    justDragged.current = true;
    setTimeout(() => {
      justDragged.current = false;
    }, 0);
  };

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseUp={onMouseUp}
      className={streaming ? 'curio-streaming' : undefined}
    >
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </Markdown>
    </div>
  );
}
