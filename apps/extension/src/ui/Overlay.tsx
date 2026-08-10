import { useCallback, useEffect, useRef, useState } from 'react';
import { CatalogRenderer, toLocale, DEFAULT_LOCALE, type Envelope, type Locale } from '@curio/core';
import {
  STORAGE,
  type DescribeResult,
  type DescribeImageResult,
  type GenerateResult,
} from '../messages';
import { t } from '../strings';

/** What the reader picked: a term (or an image), its surrounding context, and where to anchor. */
interface Pick {
  term: string;
  context: string;
  /** Viewport rect of the selection (or the image), for anchoring the popover. */
  rect: { top: number; bottom: number; left: number; right: number };
  /** Set when the pick is an IMAGE: the captured data URL sent to the vision model. */
  image?: string;
  /** Set when we couldn't read the image off the canvas (CORS) — shown in place of a gloss. */
  imageError?: string;
}

type Loadable<T> =
  { status: 'loading' } | { status: 'done'; value: T } | { status: 'error'; error: string };

/** Nearest block element's text around a node — the context we send to the model. */
function blockContext(node: Node | null): string {
  const el = node instanceof Element ? node : (node?.parentElement ?? null);
  const block = el?.closest('p,li,h1,h2,h3,h4,h5,h6,blockquote,td,th,article,section,div');
  return (block?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 600);
}

/** True if the selection sits inside an editable field — don't hijack those. */
function inEditable(node: Node | null): boolean {
  const el = node instanceof Element ? node : (node?.parentElement ?? null);
  return !!el?.closest('input,textarea,[contenteditable=""],[contenteditable="true"]');
}

async function send<T>(msg: object): Promise<T> {
  return (await chrome.runtime.sendMessage(msg)) as T;
}

/** Draw an <img> onto a canvas and read it as a PNG data URL. Throws (SecurityError) if the
 *  canvas is tainted by a cross-origin image without CORS headers. */
function toDataUrl(img: HTMLImageElement): string {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no 2d context');
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/png');
}

/** Load a fresh copy of `src` requesting CORS — the only way a cross-origin image can end up
 *  readable on a canvas (and only if the host actually sends the CORS headers). */
function loadCrossOrigin(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error('cross-origin load failed'));
    im.src = src;
  });
}

/** Best-effort capture of an <img> to a data URL. Tries the element as-is (works for same-origin,
 *  data: and blob: images); if that taints the canvas, retries with an explicit CORS request.
 *  Throws when the image still can't be read — the caller shows a friendly CORS message. */
async function captureImage(img: HTMLImageElement): Promise<string> {
  try {
    return toDataUrl(img);
  } catch {
    const fresh = await loadCrossOrigin(img.currentSrc || img.src);
    return toDataUrl(fresh);
  }
}

/** Context we send with an image: its alt text plus the nearby block text. */
function imageContext(img: HTMLImageElement): string {
  const alt = (img.alt || '').trim();
  const near = blockContext(img);
  return [alt, near].filter(Boolean).join(' — ').slice(0, 600);
}

export default function Overlay() {
  const [enabled, setEnabled] = useState(false);
  const [describeImages, setDescribeImages] = useState(false);
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [pick, setPick] = useState<Pick | null>(null);
  const [gloss, setGloss] = useState<Loadable<string> | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [gen, setGen] = useState<Loadable<Envelope> | null>(null);
  // Expanded ("see more") description for an IMAGE pick — reuses the modal shell in place of the
  // term-only catalog generation, which doesn't apply to images.
  const [imgMore, setImgMore] = useState<Loadable<string> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // On/off + language + the image toggle, driven by the popup + the Alt+C command (all flip
  // chrome.storage).
  useEffect(() => {
    chrome.storage.local
      .get([STORAGE.enabled, STORAGE.locale, STORAGE.describeImages])
      .then((s) => {
        setEnabled(!!s[STORAGE.enabled]);
        setLocale(toLocale(s[STORAGE.locale]));
        setDescribeImages(!!s[STORAGE.describeImages]);
      });
    const onChange = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area !== 'local') return;
      if (STORAGE.enabled in changes) setEnabled(!!changes[STORAGE.enabled].newValue);
      if (STORAGE.locale in changes) setLocale(toLocale(changes[STORAGE.locale].newValue));
      if (STORAGE.describeImages in changes)
        setDescribeImages(!!changes[STORAGE.describeImages].newValue);
    };
    chrome.storage.onChanged.addListener(onChange);
    return () => chrome.storage.onChanged.removeListener(onChange);
  }, []);

  const s = t(locale);

  const close = useCallback(() => {
    setPick(null);
    setGloss(null);
    setExpanded(false);
    setGen(null);
    setImgMore(null);
  }, []);

  // Capture a selection on mouse-up anywhere on the page (when enabled).
  useEffect(() => {
    if (!enabled) {
      close();
      return;
    }
    const onMouseUp = (e: MouseEvent) => {
      // Ignore mouse-ups inside Curio's own UI (the "Ver más" button, the modal, the scrim).
      // Otherwise, since the page's text stays selected, clicking "Ver más" would re-fire this
      // handler, capture the same selection again and reset the state — so the modal never opens.
      // Read composedPath synchronously (it's only valid during dispatch), then act on the tick.
      const inOwnUi = !!rootRef.current && e.composedPath().includes(rootRef.current);
      // Let the click settle, then read the selection.
      setTimeout(() => {
        if (inOwnUi) return;
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
        const term = sel.toString().replace(/\s+/g, ' ').trim();
        if (!term || term.length > 140) return; // a term/phrase, not a whole paragraph
        const range = sel.getRangeAt(0);
        if (inEditable(range.commonAncestorContainer)) return;
        const r = range.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return;
        setPick({
          term,
          context: blockContext(range.commonAncestorContainer),
          rect: { top: r.top, bottom: r.bottom, left: r.left, right: r.right },
        });
        setExpanded(false);
        setGen(null);
      }, 0);
    };
    document.addEventListener('mouseup', onMouseUp);
    return () => document.removeEventListener('mouseup', onMouseUp);
  }, [enabled, close]);

  // Click an image → capture it and anchor the SAME popover to it (only when the image feature is
  // on, which the popup allows only for a vision-capable model).
  useEffect(() => {
    if (!enabled || !describeImages) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLImageElement)) return;
      // Never hijack images inside Curio's own UI (e.g. the modal preview).
      if (rootRef.current && e.composedPath().includes(rootRef.current)) return;
      const img = target;
      const r = img.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      // Intercept the click (e.g. don't follow a linked image) and describe it instead.
      e.preventDefault();
      const rect = { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
      const context = imageContext(img);
      setExpanded(false);
      setGen(null);
      setImgMore(null);
      captureImage(img)
        .then((image) => setPick({ term: s.imageLabel, context, rect, image }))
        .catch(() => setPick({ term: s.imageLabel, context, rect, imageError: s.imageCorsError }));
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [enabled, describeImages, s.imageLabel, s.imageCorsError]);

  // Fetch the gloss whenever a new pick appears. An image pick asks the vision model to describe
  // the picture; a couldn't-read-image pick shows its friendly error without any model call.
  useEffect(() => {
    if (!pick) return;
    if (pick.imageError) {
      setGloss({ status: 'error', error: pick.imageError });
      return;
    }
    let alive = true;
    setGloss({ status: 'loading' });
    const req = pick.image
      ? { kind: 'describeImage', image: pick.image, context: pick.context }
      : { kind: 'describe', term: pick.term, context: pick.context };
    send<DescribeResult | DescribeImageResult>(req)
      .then((res) => {
        if (!alive) return;
        setGloss(
          res.ok ? { status: 'done', value: res.data } : { status: 'error', error: res.error },
        );
      })
      .catch((e) => alive && setGloss({ status: 'error', error: String(e) }));
    return () => {
      alive = false;
    };
  }, [pick]);

  // Generate the rich component when expanding (TERM picks only — images take the branch below).
  useEffect(() => {
    if (!expanded || !pick || pick.image || pick.imageError) return;
    let alive = true;
    setGen({ status: 'loading' });
    send<GenerateResult>({
      kind: 'generate',
      term: pick.term,
      context: pick.context,
      fallbackText: gloss?.status === 'done' ? gloss.value : pick.term,
    })
      .then((res) => {
        if (!alive) return;
        setGen(
          res.ok ? { status: 'done', value: res.data } : { status: 'error', error: res.error },
        );
      })
      .catch((e) => alive && setGen({ status: 'error', error: String(e) }));
    return () => {
      alive = false;
    };
    // gloss intentionally read once at expand time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, pick]);

  // "See more" for an IMAGE: ask the vision model again with a "describe in more detail" hint,
  // shown in the same modal shell. Falls back to the gloss we already have on any failure.
  useEffect(() => {
    if (!expanded || !pick || !pick.image) return;
    let alive = true;
    setImgMore({ status: 'loading' });
    const moreContext = [pick.context, s.imageMoreHint].filter(Boolean).join(' — ').slice(0, 600);
    send<DescribeImageResult>({
      kind: 'describeImage',
      image: pick.image,
      context: moreContext,
    })
      .then((res) => {
        if (!alive) return;
        if (res.ok) {
          setImgMore({ status: 'done', value: res.data });
        } else if (gloss?.status === 'done') {
          setImgMore({ status: 'done', value: gloss.value });
        } else {
          setImgMore({ status: 'error', error: res.error });
        }
      })
      .catch(() => {
        if (!alive) return;
        setImgMore(
          gloss?.status === 'done'
            ? { status: 'done', value: gloss.value }
            : { status: 'error', error: s.imageCorsError },
        );
      });
    return () => {
      alive = false;
    };
    // gloss read once at expand time (fallback only).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, pick]);

  // Escape closes; outside click closes.
  useEffect(() => {
    if (!pick) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('mousedown', onDown, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('mousedown', onDown, true);
    };
  }, [pick, close]);

  if (!pick) return null;

  // Anchor the popover just below the selection, clamped to the viewport.
  const top = Math.min(pick.rect.bottom + 8, window.innerHeight - 60);
  const left = Math.max(8, Math.min(pick.rect.left, window.innerWidth - 340));

  return (
    <div ref={rootRef}>
      {!expanded && (
        <div
          style={{ position: 'fixed', top, left, zIndex: 2147483647 }}
          className="max-w-[320px] overflow-y-auto rounded-xl border border-border bg-bg px-4 py-3 text-sm leading-normal text-fg-secondary"
        >
          {!gloss || gloss.status === 'loading' ? (
            <div className="curio-dots" role="status" aria-label={s.loadingDescription}>
              <span />
              <span />
              <span />
            </div>
          ) : gloss.status === 'error' ? (
            <p role="alert" className="text-fg-muted">
              {gloss.error}
            </p>
          ) : (
            <>
              <p className="whitespace-pre-wrap">{gloss.value}</p>
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="mt-2 text-xs font-medium text-accent hover:text-accent-hover hover:underline"
              >
                {s.seeMore}
              </button>
            </>
          )}
        </div>
      )}

      {expanded && (
        <>
          <div
            onClick={close}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2147483646,
              background: 'var(--color-scrim)',
            }}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={pick.term}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2147483647,
              width: 'min(560px, calc(100vw - 32px))',
              maxHeight: 'min(80vh, 640px)',
            }}
            className="flex flex-col overflow-hidden rounded-xl border border-border bg-bg"
          >
            <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-3">
              <h2 className="text-lg font-semibold leading-snug text-fg">{pick.term}</h2>
              <button
                onClick={close}
                aria-label={s.close}
                className="-mr-1 shrink-0 rounded-md p-1 text-xl leading-none text-fg-muted hover:text-fg"
              >
                &times;
              </button>
            </header>
            <div className="min-h-0 overflow-y-auto px-5 py-4 text-base leading-relaxed text-fg-secondary">
              {pick.image ? (
                <>
                  <img
                    src={pick.image}
                    alt=""
                    className="mb-4 max-h-64 w-full rounded-lg border border-border object-contain"
                  />
                  {!imgMore || imgMore.status === 'loading' ? (
                    <div className="curio-dots" role="status" aria-label={s.generating}>
                      <span />
                      <span />
                      <span />
                    </div>
                  ) : imgMore.status === 'error' ? (
                    <p role="alert" className="text-fg-muted">
                      {imgMore.error}
                    </p>
                  ) : (
                    <p className="whitespace-pre-wrap">{imgMore.value}</p>
                  )}
                </>
              ) : !gen || gen.status === 'loading' ? (
                <div className="curio-dots" role="status" aria-label={s.generating}>
                  <span />
                  <span />
                  <span />
                </div>
              ) : gen.status === 'error' ? (
                <p role="alert" className="text-fg-muted">
                  {gen.error}
                </p>
              ) : (
                <CatalogRenderer envelope={gen.value} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
