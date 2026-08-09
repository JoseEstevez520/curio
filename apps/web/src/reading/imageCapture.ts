// Turn a live <img> in the reading surface into a data URL we can hand to the vision model.
// Best-effort: same-origin, data:, and CORS-enabled images capture straight from a canvas; a
// tainted cross-origin image throws a SecurityError, which we surface as a friendly gloss.

/** Friendly, localized-enough messages shown in the popover when capture fails. */
const CORS_MESSAGE = "I can't read this image (it's from another site).";
const GENERIC_MESSAGE = "I can't read this image.";

export interface ImageCapture {
  /** The captured image as a PNG data URL, when it worked. */
  dataUrl?: string;
  /** A friendly reason shown in the popover when it didn't. */
  error?: string;
}

/** Draw an <img> onto a canvas and read it back. Throws SecurityError if the canvas is tainted. */
function toDataUrl(img: HTMLImageElement): ImageCapture {
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  if (!width || !height) return { error: GENERIC_MESSAGE };
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { error: GENERIC_MESSAGE };
  ctx.drawImage(img, 0, 0, width, height);
  return { dataUrl: canvas.toDataURL('image/png') };
}

function isSecurityError(e: unknown): boolean {
  return e instanceof DOMException && e.name === 'SecurityError';
}

/**
 * Capture from the element already on the page. Works for same-origin, `data:` and blob images,
 * and any cross-origin image the server allowed via CORS. Returns a SecurityError as an error.
 */
export function captureImageSync(img: HTMLImageElement): ImageCapture {
  try {
    return toDataUrl(img);
  } catch (e) {
    return { error: isSecurityError(e) ? CORS_MESSAGE : GENERIC_MESSAGE };
  }
}

/**
 * Best-effort recovery for a tainted cross-origin image: reload the same URL through a FRESH
 * `crossOrigin="anonymous"` request. If the server sends `Access-Control-Allow-Origin`, the new
 * image is clean and captures; otherwise it errors and we fall back to the friendly CORS message.
 */
export function captureImageCrossOrigin(src: string): Promise<ImageCapture> {
  return new Promise((resolve) => {
    if (!src) {
      resolve({ error: CORS_MESSAGE });
      return;
    }
    const probe = new Image();
    probe.crossOrigin = 'anonymous';
    probe.onload = () => {
      try {
        resolve(toDataUrl(probe));
      } catch (e) {
        resolve({ error: isSecurityError(e) ? CORS_MESSAGE : GENERIC_MESSAGE });
      }
    };
    probe.onerror = () => resolve({ error: CORS_MESSAGE });
    probe.src = src;
  });
}
