import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FloatingPortal, useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react';
import { Renderer } from '@openuidev/react-lang';
import { MODAL_IN } from '@curio/core';
import { useDescribe } from '../lookup/useDescribe';
import { useOpenUI } from '../openui/useOpenUI';
import { curioLibrary } from '../openui/library';
import { openUIFollowUpSystemPrompt } from '../openui/chatPrompt';
import { isRenderableLang } from '../openui/renderable';
import { toClickable } from '../reading/toClickable';
import { expandRangeToWords, BLOCK_SELECTOR } from './clickable';
import { PhraseBand } from './PhraseHighlight';
import DescriptionBody, { POPOVER_CLASS, SeeMoreButton } from './DescriptionBody';
import Composer from '../chat/Composer';
import { useChatStore } from '../app/store';
import { getBrain } from '../llm/brain';

interface DescribeModalProps {
  initialTerm: string;
  messageId: string;
  context: string;
  onClose: () => void;
}

const FOCUSABLE = 'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])';

export default function DescribeModal({
  initialTerm,
  messageId,
  context,
  onClose,
}: DescribeModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<Element | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Navigation stack
  const [history, setHistory] = useState<string[]>([initialTerm]);
  const term = history[history.length - 1];
  const canGoBack = history.length > 1;

  const pushTerm = useCallback((t: string) => {
    setHistory((h) => [...h, t]);
    setFollowUpMessages([]);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  const goBack = useCallback(() => {
    setHistory((h) => h.length > 1 ? h.slice(0, -1) : h);
    setFollowUpMessages([]);
    setHoveredWord(null);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  // Inline popover state — click a word OR drag-select a phrase to show the popover first,
  // "ver mas" navigates. Mirrors the store's selection shape (el for a word, range for a phrase).
  const [hoveredWord, setHoveredWord] = useState<{
    text: string;
    el: HTMLElement | null;
    range: Range | null;
    context: string;
  } | null>(null);
  const hoverGloss = useDescribe(
    hoveredWord !== null,
    messageId,
    hoveredWord?.text ?? '',
    hoveredWord?.context ?? context,
  );

  // Set when a drag just handled a selection, so the trailing click a short drag also fires
  // doesn't overwrite the phrase popover with a single-word one. Cleared on the next tick.
  const justDragged = useRef(false);

  /** The paragraph/block the clicked node lives in — the context sent with the lookup. */
  const blockText = (node: Node | null): string => {
    const el = node instanceof Element ? node : node?.parentElement;
    const block = el?.closest(BLOCK_SELECTOR) ?? scrollRef.current;
    return (block?.textContent ?? '').slice(0, 600);
  };

  // Inline popover positioning — REPLICATES the main-page SelectionPopover: floating-ui
  // anchors the bubble to the clicked word, follows it on scroll (autoUpdate), and FLIPS it
  // above the word when there is no room below. Follow-up answers live at the bottom of the
  // modal, where the old always-open-below bubble rendered out of view ("no funciona").
  const { refs, floatingStyles, isPositioned } = useFloating({
    open: hoveredWord !== null,
    placement: 'bottom',
    middleware: [offset(6), flip({ padding: 12 }), shift({ padding: 12 })],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    if (!hoveredWord) return;
    // Word → anchor to the live element; phrase → anchor to the range's rect (virtual
    // reference), exactly like SelectionPopover does for drag selections.
    if (hoveredWord.el) { refs.setReference(hoveredWord.el); return; }
    if (hoveredWord.range) {
      const range = hoveredWord.range;
      refs.setReference({ getBoundingClientRect: () => range.getBoundingClientRect() });
    }
  }, [hoveredWord, refs]);

  // Keep the clicked word highlighted (accent pill) while its popover is open — same
  // .entity-open treatment SelectionPopover applies on the main page.
  useEffect(() => {
    const el = hoveredWord?.el;
    if (!el) return;
    el.classList.add('entity-open');
    return () => el.classList.remove('entity-open');
  }, [hoveredWord]);

  // Main content
  const gloss = useDescribe(true, messageId, term, context);
  const openui = useOpenUI(true, term, context);
  // Prefetch the OpenUI panel for the hovered word as soon as its popover opens — exactly
  // like SelectionPopover does on the main page. Uses the modal's global context so the
  // generation uses the same source text regardless of which block the word was in.
  useOpenUI(
    hoveredWord !== null,
    hoveredWord?.text ?? '',
    context,
  );

  // Click on .entity word → show inline popover (single words only; drags go to mouse-up)
  const onContentClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (justDragged.current) {
      justDragged.current = false;
      e.stopPropagation(); // don't let the card dismiss the popover the drag just opened
      return;
    }
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.toString().trim()) return; // a drag; handled on mouse-up
    const entity = (e.target as HTMLElement).closest('.entity');
    if (!(entity instanceof HTMLElement)) return;
    const word = entity.textContent?.trim();
    if (!word || word.toLowerCase() === term.toLowerCase()) return;
    e.stopPropagation();

    // If clicking the same word that's already showing popover, close it
    if (hoveredWord && hoveredWord.text.toLowerCase() === word.toLowerCase()) {
      setHoveredWord(null);
      return;
    }
    setHoveredWord({ text: word, el: entity, range: null, context: blockText(entity) });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, hoveredWord]);

  // Drag-select any text → describe the whole phrase, replicating ClickableSurface.
  const onContentMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
    const liveRange = sel.getRangeAt(0);
    if (!scrollRef.current?.contains(liveRange.commonAncestorContainer)) return;
    const range = liveRange.cloneRange();
    expandRangeToWords(range); // snap partial words out to whole words
    const text = range.toString().trim();
    if (!text || text.toLowerCase() === term.toLowerCase()) return;
    justDragged.current = true;
    window.setTimeout(() => { justDragged.current = false; }, 0);
    setHoveredWord({ text, el: null, range, context: blockText(range.commonAncestorContainer) });
    // Drop the native selection so only our own rounded band shows (PhraseBand below),
    // exactly like ClickableSurface + PhraseHighlight on the main page.
    sel.removeAllRanges();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  // Close popover when clicking outside
  const onContentClickOutside = useCallback(() => {
    setHoveredWord(null);
  }, []);

  // Follow-up conversation
  const [followUpMessages, setFollowUpMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [followUpLoading, setFollowUpLoading] = useState(false);

  useEffect(() => {
    if ((followUpMessages.length > 0 || followUpLoading) && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [followUpMessages, followUpLoading]);

  const handleFollowUp = useCallback(async (q: string) => {
    if (!q || followUpLoading) return;
    setFollowUpMessages((prev) => [...prev, { role: 'user', text: q }]);
    setFollowUpLoading(true);
    try {
      const { provider, ready } = getBrain('chat');
      if (!ready) { setFollowUpLoading(false); return; }
      const hist = followUpMessages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.text }));
      // Summarise the existing panel as component TYPES instead of sending raw DSL,
      // so the model doesn't get distracted by a long code blob before the format contract.
      const panelTypes = openui.response
        ? [...openui.response.matchAll(/\b(Heading|Prose|DefinitionCard|FactTable|Timeline|Steps|Comparison|BulletList|Quote|CodeBlock|KeyStat|Callout|StatRow|BarList|Tags|SandboxHTML|LineChart|Donut|Card|Grid)\b/g)]
            .map((m) => m[1])
            .filter((t, i, a) => a.indexOf(t) === i)
            .join(', ')
        : null;
      const system = openUIFollowUpSystemPrompt(term, context, panelTypes, useChatStore.getState().locale);
      let answer = await provider.complete({
        messages: [
          { role: 'system', content: system },
          ...hist,
          { role: 'user', content: q },
        ],
        temperature: 0.3,
        maxTokens: 1200,
      });
      // If the brain answered in prose instead of OpenUI Lang, nudge it once with its own
      // reply as the bad example — cheaper than serving a degraded plain-text answer.
      if (!isRenderableLang(answer)) {
        try {
          const retry = await provider.complete({
            messages: [
              { role: 'system', content: system },
              ...hist,
              { role: 'user', content: q },
              { role: 'assistant', content: answer },
              { role: 'user', content: 'That reply was plain text. Answer the SAME question again, but ONLY as OpenUI Lang code — start with `root = Panel([...])`. Nothing outside the code.' },
            ],
            temperature: 0.2,
            maxTokens: 1200,
          });
          if (isRenderableLang(retry)) answer = retry;
        } catch { /* keep the original answer */ }
      }
      // Last resort: the brain kept answering in prose, so wrap it in a `Prose` piece
      // ourselves — the reply ALWAYS renders as a component (and its words stay clickable)
      // instead of degrading to plain text. Single-line + JSON-escaped so the DSL parses.
      if (!isRenderableLang(answer)) {
        const prose = answer.replace(/\s+/g, ' ').trim();
        answer = `root = Panel([Prose(${JSON.stringify(prose)})])`;
      }
      setFollowUpMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    } catch { /* silent */ }
    setFollowUpLoading(false);
  }, [followUpLoading, followUpMessages, term, context, openui.response]);

  // Focus trap + escape
  useEffect(() => {
    returnFocus.current = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (hoveredWord) { setHoveredWord(null); e.stopPropagation(); return; }
        e.stopPropagation(); onClose(); return;
      }
      if (e.key !== 'Tab') return;
      const card = cardRef.current;
      if (!card) return;
      const items = Array.from(card.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (items.length === 0) { e.preventDefault(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !card.contains(active))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (active === last || !card.contains(active))) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      if (returnFocus.current instanceof HTMLElement) returnFocus.current.focus();
    };
  }, [onClose, hoveredWord]);

  return (
    <FloatingPortal>
      <div className="curio-modal-center" onClick={onContentClickOutside}>
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={MODAL_IN}
          className="curio-modal-card"
          style={{ borderRadius: 16, transformOrigin: 'center', display: 'flex', flexDirection: 'column' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="curio-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <header className="flex shrink-0 items-center gap-2 px-5 pb-1 pt-4">
            {canGoBack && (
              <button
                type="button"
                onClick={goBack}
                aria-label="Back"
                className="shrink-0 rounded-md p-1 text-fg-muted transition-colors hover:text-fg"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2 id="curio-modal-title" className="flex-1 text-lg font-semibold leading-snug text-fg truncate">
              {term}
            </h2>
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 rounded-md p-1 text-xl leading-none text-fg-muted transition-colors hover:text-fg"
            >
              &times;
            </button>
          </header>

          {/* Breadcrumb */}
          {history.length > 1 && (
            <div className="flex items-center gap-1 px-5 pb-1 text-xs text-fg-muted overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {history.map((h, i) => (
                <span key={i} className="flex items-center gap-1 shrink-0">
                  {i > 0 && <span className="text-fg-faint">›</span>}
                  <button
                    type="button"
                    onClick={() => { setHistory((prev) => prev.slice(0, i + 1)); setFollowUpMessages([]); setHoveredWord(null); }}
                    className={`transition-colors hover:text-fg ${i === history.length - 1 ? 'text-fg font-medium' : ''}`}
                  >
                    {h}
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Scrollable content */}
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-base leading-relaxed text-fg-secondary"
            style={{ scrollbarWidth: 'none', position: 'relative' }}
            onClick={onContentClick}
            onMouseUp={onContentMouseUp}
          >
            {/* OpenUI content */}
            {openui.response !== null ? (
              <Renderer
                response={openui.response}
                library={curioLibrary}
                isStreaming={openui.isStreaming}
              />
            ) : openui.error ? (
              <p className="text-sm text-fg-muted">{openui.error}</p>
            ) : (
              <DescriptionBody entry={gloss} />
            )}

            {/* Inline popover — the SAME bubble as the main-page one (POPOVER_CLASS +
                DescriptionBody + SeeMoreButton), portaled above the modal card and anchored
                to the word by floating-ui (flips above when the word sits near the bottom,
                e.g. in follow-up answers). */}
            {hoveredWord && (
              <FloatingPortal>
                <div
                  ref={refs.setFloating}
                  className={POPOVER_CLASS}
                  style={{
                    ...floatingStyles,
                    zIndex: 60,
                    visibility: isPositioned ? 'visible' : 'hidden',
                  }}
          onClick={(e) => { e.stopPropagation(); setHoveredWord(null); }}
                >
                  <DescriptionBody entry={hoverGloss} />
                  {hoverGloss?.status === 'done' && (
                    <SeeMoreButton
                      onClick={() => {
                        const word = hoveredWord.text;
                        setHoveredWord(null);
                        pushTerm(word);
                      }}
                    />
                  )}
                </div>
              </FloatingPortal>
            )}

            {/* Follow-up messages — same pattern as the main chat and the panel: dots while
                generating, then the full panel revealed at once. Both the Gen UI renderer and
                the plain-text fallback emit .entity words (via toClickable), so every answer
                stays click-to-explain through the modal's own popover flow. */}
            {followUpMessages.length > 0 && (
              <div className="mt-5 space-y-3">
                {followUpMessages.map((m, i) => (
                  <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
                    {m.role === 'user' ? (
                      <span className="inline-block rounded-2xl bg-bg-muted px-3 py-1.5 text-sm text-fg">
                        {m.text}
                      </span>
                    ) : isRenderableLang(m.text) ? (
                      <Renderer response={m.text} library={curioLibrary} isStreaming={false} />
                    ) : (
                      <span className="block text-sm text-fg-secondary whitespace-pre-wrap">
                        {toClickable(m.text)}
                      </span>
                    )}
                  </div>
                ))}
                {followUpLoading && (
                  <div className="curio-dots" role="status" aria-label="Thinking">
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Composer — reused, compact mode */}
          <div className="shrink-0 px-3 pb-3 pt-1">
            <Composer onSend={handleFollowUp} disabled={followUpLoading} compact />
          </div>
        </motion.div>
      </div>

      {/* Phrase band — the SAME rounded band the main chat paints for a drag selection
          (PhraseHighlight on the main page reads the global store; here it reads the
          modal's local selection). z-60 so it paints above the modal card (z-50). */}
      <PhraseBand range={hoveredWord?.range ?? null} zIndex={60} />
    </FloatingPortal>
  );
}
