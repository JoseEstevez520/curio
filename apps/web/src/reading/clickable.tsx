import { useRef, type ReactNode, type MouseEvent } from 'react';
import { useChatStore } from '../app/store';
import { brainSeesVision } from '../llm/useModelSupportsVision';
import { captureImageSync, captureImageCrossOrigin } from './imageCapture';

/**
 * The click-to-explain surface, shared by the Markdown reply and the generative (OpenUI) reply
 * so BOTH support "click a word / select a phrase to describe it". Turns clicks/drags on
 * `.entity` word spans (produced by {@link toClickable}) into a store selection that the
 * popover anchors to. Previously lived inside MarkdownMessage.
 */

export const BLOCK_SELECTOR = 'p,li,h1,h2,h3,h4,h5,h6,blockquote,td,th,dd,dt';

// Word characters, including the internal apostrophe/hyphen the tokenizer keeps.
const WORD_CHAR = /[\p{L}\p{N}'’-]/u;

/**
 * Smart snap: grow each end of the selection out to a whole word, so half-selecting a
 * word still describes (and highlights) the complete word. Exported for DescribeModal,
 * which replicates the same drag-to-select flow inside the "See more" modal.
 */
export function expandRangeToWords(range: Range): void {
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

  // Nearby text sent with an image for disambiguation: its alt text plus the surrounding block.
  const imageContextFor = (img: HTMLImageElement): string => {
    const alt = img.getAttribute('alt')?.trim();
    const block = img.closest(BLOCK_SELECTOR) ?? img.parentElement ?? ref.current;
    const near = (block?.textContent ?? '').replace(/\s+/g, ' ').trim();
    return [alt ? `Alt text: ${alt}.` : '', near].filter(Boolean).join(' ').slice(0, 600);
  };

  // Click an <img> → describe the whole picture in the SAME popover (only when the reader has
  // image-describe on AND the active model can see). Best-effort capture: same-origin/data/CORS
  // images draw straight from a canvas; a tainted cross-origin image shows a friendly error, then
  // we try once more through a fresh crossOrigin request in case the server allows it.
  const onImageClick = (img: HTMLImageElement) => {
    const st = useChatStore.getState();
    if (!st.describeImages || !brainSeesVision(st)) return;
    const imageContext = imageContextFor(img);
    const sync = captureImageSync(img);
    st.setSelection({
      messageId,
      text: '',
      context: '',
      el: img,
      range: null,
      block: null,
      image: sync.dataUrl,
      imageContext,
      imageError: sync.dataUrl ? undefined : sync.error,
    });
    if (!sync.dataUrl) {
      void captureImageCrossOrigin(img.currentSrc || img.src).then((res) => {
        if (!res.dataUrl) return; // keep the friendly error already shown
        const cur = useChatStore.getState().selection;
        if (!cur || cur.el !== img) return; // the reader moved on — don't clobber
        useChatStore.getState().setSelection({ ...cur, image: res.dataUrl, imageError: undefined });
      });
    }
  };

  // Single click → describe the clicked word (or image).
  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const img = (e.target as HTMLElement).closest('img');
    if (img instanceof HTMLImageElement && ref.current?.contains(img)) {
      onImageClick(img);
      return;
    }
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
