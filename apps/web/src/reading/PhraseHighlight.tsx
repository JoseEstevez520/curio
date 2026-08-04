import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useChatStore } from '../app/store';

/** How far the band extends past the raw text box, in px — the "padding". */
const PAD_X = 4;
const PAD_Y = 2;

interface LineRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * range.getClientRects() returns one rect per inline box — i.e. per word and per space,
 * since each word is its own <span>. Merge rects that share a line into a single span so
 * the band is continuous (rounded only at the line ends), not a row of per-word pills.
 */
function mergeIntoLines(rects: DOMRect[]): LineRect[] {
  const lines: LineRect[] = [];
  for (const r of rects) {
    if (r.width === 0 || r.height === 0) continue;
    const last = lines[lines.length - 1];
    // Same line when this rect vertically overlaps the current one.
    if (last && r.top < last.bottom - 2 && r.bottom > last.top + 2) {
      last.left = Math.min(last.left, r.left);
      last.top = Math.min(last.top, r.top);
      last.right = Math.max(last.right, r.right);
      last.bottom = Math.max(last.bottom, r.bottom);
    } else {
      lines.push({ left: r.left, top: r.top, right: r.right, bottom: r.bottom });
    }
  }
  return lines;
}

/**
 * Paints a selection range as a soft, rounded, continuous band behind the text.
 *
 * We can't use the CSS Custom Highlight API here — `::highlight()` supports neither
 * padding nor border-radius. Instead we measure the range's client rects (one per
 * wrapped line) and draw a translucent rounded rectangle for each, in a body portal,
 * re-measuring on scroll/resize so the band tracks the text. The native selection is
 * cleared on mouse-up (see MarkdownMessage), so this is the only band on screen.
 *
 * Exported on its own so DescribeModal can paint the SAME band for selections made
 * inside the "See more" modal (which keeps its own local selection state).
 */
export function PhraseBand({ range, zIndex }: { range: Range | null; zIndex?: number }) {
  const [rects, setRects] = useState<LineRect[]>([]);

  useEffect(() => {
    if (!range) {
      setRects([]);
      return;
    }
    let frame = 0;
    const measure = () => {
      frame = 0;
      setRects(mergeIntoLines(Array.from(range.getClientRects())));
    };
    measure();
    const onChange = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    // Capture phase so scrolls inside the messages pane are caught too.
    window.addEventListener('scroll', onChange, true);
    window.addEventListener('resize', onChange);
    return () => {
      window.removeEventListener('scroll', onChange, true);
      window.removeEventListener('resize', onChange);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [range]);

  if (!range || rects.length === 0) return null;

  return createPortal(
    // zIndex is opt-in: the main chat leaves the layer unstacked (so the "See more" modal
    // covers the main-page band), while the modal passes one so ITS band paints above it.
    <div className="curio-phrase-layer" aria-hidden="true" style={zIndex === undefined ? undefined : { zIndex }}>
      {rects.map((r, i) => (
        <span
          key={i}
          className="curio-phrase-rect"
          style={{
            left: `${r.left - PAD_X}px`,
            top: `${r.top - PAD_Y}px`,
            width: `${r.right - r.left + PAD_X * 2}px`,
            height: `${r.bottom - r.top + PAD_Y * 2}px`,
          }}
        />
      ))}
    </div>,
    document.body,
  );
}

/** The main-chat band: reads the global selection and paints it with PhraseBand. */
export default function PhraseHighlight() {
  const range = useChatStore((s) => s.selection?.range ?? null);
  return <PhraseBand range={range} />;
}
