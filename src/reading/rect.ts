import type { RectLike } from '../app/store';

/** Snapshot a live DOMRect into a plain, serializable RectLike for anchoring popovers. */
export function toRectLike(r: DOMRect): RectLike {
  return {
    x: r.x,
    y: r.y,
    width: r.width,
    height: r.height,
    top: r.top,
    left: r.left,
    right: r.right,
    bottom: r.bottom,
  };
}
