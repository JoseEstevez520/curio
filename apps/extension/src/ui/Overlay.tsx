import { useCallback, useEffect, useRef, useState } from 'react';
import { CatalogRenderer, STRINGS, toLocale, DEFAULT_LOCALE, type Envelope, type Locale } from '@curio/core';
import { STORAGE, type DescribeResult, type GenerateResult } from '../messages';

/** What the reader picked: the term, its surrounding context, and where to anchor. */
interface Pick {
  term: string;
  context: string;
  /** Viewport rect of the selection, for anchoring the popover. */
  rect: { top: number; bottom: number; left: number; right: number };
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

export default function Overlay() {
  const [enabled, setEnabled] = useState(false);
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [pick, setPick] = useState<Pick | null>(null);
  const [gloss, setGloss] = useState<Loadable<string> | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [gen, setGen] = useState<Loadable<Envelope> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // On/off + language, driven by the popup + the Alt+C command (both flip chrome.storage).
  useEffect(() => {
    chrome.storage.local.get([STORAGE.enabled, STORAGE.locale]).then((s) => {
      setEnabled(!!s[STORAGE.enabled]);
      setLocale(toLocale(s[STORAGE.locale]));
    });
    const onChange = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area !== 'local') return;
      if (STORAGE.enabled in changes) setEnabled(!!changes[STORAGE.enabled].newValue);
      if (STORAGE.locale in changes) setLocale(toLocale(changes[STORAGE.locale].newValue));
    };
    chrome.storage.onChanged.addListener(onChange);
    return () => chrome.storage.onChanged.removeListener(onChange);
  }, []);

  const s = STRINGS[locale];

  const close = useCallback(() => {
    setPick(null);
    setGloss(null);
    setExpanded(false);
    setGen(null);
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

  // Fetch the gloss whenever a new pick appears.
  useEffect(() => {
    if (!pick) return;
    let alive = true;
    setGloss({ status: 'loading' });
    send<DescribeResult>({
      kind: 'describe',
      term: pick.term,
      context: pick.context,
    })
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

  // Generate the rich component when expanding.
  useEffect(() => {
    if (!expanded || !pick) return;
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
              {!gen || gen.status === 'loading' ? (
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
