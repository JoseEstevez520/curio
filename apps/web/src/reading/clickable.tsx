import { useRef, type ReactNode, type MouseEvent } from 'react';
import { useChatStore } from '../app/store';

/**
 * The click-to-explain surface, shared by the Markdown reply and the generative (OpenUI) reply
 * so BOTH support "click a word / select a phrase to describe it". Turns clicks/drags on
 * `.entity` word spans (produced by {@link toClickable}) into a store selection that the
 * popover anchors to. Previously lived inside MarkdownMessage.
 */

const BLOCK_SELECTOR = 'p,li,h1,h2,h3,h4,h5,h6,blockquote,td,th,dd,dt';

// Word characters, including the internal apostrophe/hyphen the tokenizer keeps.
const WORD_CHAR = /[\p{L}\p{N}'’-]/u;

/**
 * Smart snap: grow each end of the selection out to a whole word, so half-selecting a
 * word still describes (and highlights) the complete word.
 */
function expandRangeToWords(range: Range): void {
  const { startContainer, endContainer } = range;
  if (startContainer.nodeType === Node.TEXT_NODE) {
    const t = startContainer.textContent ?? '';
    let s = range.startOffset;
    while (s > 0 && WORD_CHAR.test(t[s - 1])) s--;
    range.setStart(startContainer, s);
  }
  if (endContainer.nodeType === Node.TEXT_NODE) {
    const t = endContainer.textContent ?? '';
    let e = range.endOffset;
    while (e < t.length && WORD_CHAR.test(t[e])) e++;
    range.setEnd(endContainer, e);
  }
}

interface ClickableSurfaceProps {
  messageId: string;
  /** Adds the streaming caret class while tokens are still arriving. */
  streaming?: boolean;
  children: ReactNode;
}

/**
 * Wraps content whose words carry the `.entity` class and turns a click (one word) or a drag
 * (a phrase) into a store selection, exactly like the Markdown reply. Works for any content —
 * Markdown or the generative components — as long as clickable words are `.entity` spans.
 */
export default function ClickableSurface({ messageId, streaming, children }: ClickableSurfaceProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Set when a drag just handled a selection, so the trailing click a short drag also fires
  // doesn't overwrite the phrase band with a single-word pill. Cleared on the next tick.
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
      block: (entity.closest(BLOCK_SELECTOR) as HTMLElement | null) ?? ref.current,
    });
  };

  // Drag select any text → describe whatever was selected (one word or many).
  const onMouseUp = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
    const liveRange = sel.getRangeAt(0);
    if (!ref.current?.contains(liveRange.commonAncestorContainer)) return;
    const range = liveRange.cloneRange();
    expandRangeToWords(range); // snap partial words out to whole words
    const text = range.toString().trim();
    if (!text) return;
    const node = range.commonAncestorContainer;
    const blockEl =
      (node instanceof Element ? node : node.parentElement)?.closest(BLOCK_SELECTOR) ?? ref.current;
    useChatStore.getState().setSelection({
      messageId,
      text,
      context: blockText(node),
      el: null,
      range,
      block: blockEl as HTMLElement | null,
    });
    // Drop the native selection so only our own rounded band shows (no double band).
    sel.removeAllRanges();
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
      {children}
    </div>
  );
}
